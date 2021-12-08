const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
const Message = mongoose.model('Message');
const timeAgo = require('time-ago');

const containsDuplicate = (array) =>  new Set(array).size !== array.length;
const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min) ) + min;
}

const enrichComments = (posts) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    for (let post of posts) {
      for (let comment of post.comments) {
        const promise = new Promise((resolve1, reject1) => {
          User.findById(comment.commenter_id, "name profile_image", (err, user) => {
            comment.commenter_name = user.name;
            comment.commenter_profile_image = user.profile_image;
            resolve1(comment)
          });
        });
        promises.push(promise);
      }
    }
    Promise.all(promises).then((val) => {
      console.log(val);
      resolve(posts);
    });
  });
}

const enrichPosts = (posts, user) => {
  let item;
  for (item of posts) {
    item.name = user.name;
    item.ago = timeAgo.ago(item.date);
    item.ownerProfileImage = user.profile_image;
    item.ownerId = user._id;
  }
}

const alertUser = ({fromUser, toId, type, postContent}, res) => {
  return new Promise((resolve, reject) => {
    const alert = {
      alert_type: type,
      from_id: fromUser,
      from_name: fromUser.name,
    };

    switch (type) {
      case 'new_friend':
        alert.alert_text = `${alert.from_name} has accepted your friend request`;
        break;
    }

    User.findById(toId, (err, user) => {
      if (err) {reject('Error', err); return res.json({err});}

      user.new_notifications++;
      user.notifications.push(JSON.stringify(alert));
      user.save((err) => {
        if (err) {reject('Error', err); return res.json({err});}
        resolve();
      });
    })
  });
}

const registerUser = ({ body }, res) => {
  if (Object.keys(body).length === 0 || !Object.values(body).every((val) => val)) {
    return res.send({ message: 'All Fields are required' });
  }

  if (!body.first_name || !body.last_name || !body.password || !body.password_confirm) {
    return res.send({ message: 'All Fields are required' });
  }

  if (body.password !== body.password_confirm) {
    return res.send({ message: 'Passwords don\'t match' });
  }

  const user = new User();
  user.name = `${body.first_name.trim()} ${body.last_name.trim()}`;
  user.email = body.email;
  user.messages = [];
  user.setPassword(body.password);
  user.save((err, newUSer) => {
    if (err) {
      if (err.errmsg && err.errmsg.includes('duplicate key error') && err.errmsg.includes('email')) {
        return res.json({ message: 'The provided email is already taken.' });
      }
      return res.status(422).json({ message: 'Something went wrong.' });
    } else {
      const token = newUSer.getJwt();
      res.status(201).json({ message: 'Created user', user: newUSer, token: token });
    }
  });
}

const loginUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json( { message: 'All fields are required' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(401).json(err);
    }

    if (user) {
      const token = user.getJwt();
      res.status(200).json({ message: 'Logged in ', token: token});
    } else {
      res.status(401).json(info);
    }
  })(req, res);
}

const generateFeed = (req, res) => {
  const userId = req.user._id;
  let posts = [];
  const bestiesPosts = [];
  const maxAmountOfPosts = 48;

  const getPostsFrom = (arrayOfUsers, maxAmountOfPosts, postsArray) => {
    return new Promise((resolve, reject) => {
      User.find({_id: {$in: arrayOfUsers}}, 'name posts profile_image', {lean: true}, (err, users) => {
        if (err) {reject('Error', err); return res.json({err});}
        users.forEach(user => {
          enrichPosts(user.posts, user);
          postsArray.push(...user.posts);
        });
        postsArray.sort((a, b) => (a.date > b.date) ? -1 : 1);
        postsArray = postsArray.splice(maxAmountOfPosts);

        enrichComments(postsArray).then(() => {
          resolve();
        })
      });
    });
  }

  const myPosts = new Promise((resolve, reject) => {
    User.findById(userId, 'name posts profile_image friends besties', {lean: true}, (err, user) => {
      if (err) {return res.json({err})}
      enrichPosts(user.posts, user)
      posts.push(...user.posts);
      user.friends = user.friends.filter((friendId) => {
        return !user.besties.includes(friendId);
      });
      resolve(user);
    });
  });

  const myBestiesPosts = myPosts.then(({besties}) => {
    return getPostsFrom(besties, 4, bestiesPosts);
  });
  const myFriendsPosts = myPosts.then(({friends}) => {
    return getPostsFrom(friends, maxAmountOfPosts, posts);
  });

  Promise.all([myBestiesPosts, myFriendsPosts]).then(() => {
    res.statusJson(200, {posts, bestiesPosts});
  });
}

const getSearchResults = (req, res) => {
  const query = req.query;
  if (!query.query) { return res.json({err: 'Missing query'}); }
  User.find({name: {$regex: query.query, $options: 'i'}}, 'name profile_image friends friend_requests', {},  (err, docs) => {
    if (err) {return res.json({err})}
    docs = docs.slice(0, 20);
    docs = docs.filter(i => i._id != req.user._id);
    return res.status(200).json({message: `Users fetched: ${docs.length}`, results: docs})
  });
}

const makeFriendRequest = ({params}, res) => {
  const fromUserId = params.from;
  const toUserId = params.to;
  User.findById(toUserId, (err, toUser) => {
    if (err) { return res.json({err: err}); }
    if (containsDuplicate([fromUserId,  ...toUser.friend_requests])) {
      return res.json({ message: 'Friend request already sent.' })
    }

    toUser.friend_requests.push(fromUserId);
    toUser.save((err, savedUser) => {
      if (err) { return res.json({err: err}); }

      return res.statusJson(201, {
        message: 'Friend request successfully sent',
        from: fromUserId,
        to: toUserId,
      });
    });

  });
}

const getUserData = ({params}, res) => {
  const userId = params.userid;
  User.findById(userId, '-salt -password', {lean: true}, (err, user) => {
    if (err) { return res.json({err: err}); }
    const getRandomFriends = (friendsList) => {
      let copyOfFriendsList = Array.from(friendsList);
      let randomIds = [];
      for (let i = 0; i<6; i++) {
        if (friendsList.length <= 6) {
          randomIds = copyOfFriendsList;
          break;
        }

        const randomId = getRandom(0, copyOfFriendsList.length - 1);
        randomIds.push(copyOfFriendsList[randomId])
        copyOfFriendsList.splice(randomId, 1);
      }
      return new Promise((resolve, reject) => {
        User.find({'_id': {$in: randomIds}}, 'name profile_image', (err, friends) => {
          if (err) { return res.json ({err})}
          resolve(friends);
        });
      });
    }
    const addMessengerDetails = (messages) => {
      return new Promise((resolve, reject) => {
        if (!messages.length) { resolve(messages) }

        const usersArray = messages.map(message => message.from_id);
        User.find({'_id': {$in: usersArray}}, "name profile_image", (err, users) => {
          if (err) { return res.json({err}) }

          for (message of messages) {
            for (let i=0; i < users.length; i++) {
              if (message.from_id == users[i]._id) {
                message.messengerName = users[i].name;
                message.messengerProfileImage = users[i].profile_image;
                users.splice(i, 1);
                break;
              }
            }
          }
          resolve(messages);
        });
      });
    }

    user.posts.sort((a, b) => (a.date > b.date) ? -1 : 1);
    enrichPosts(user.posts, user);
    const randomFriends = getRandomFriends(user.friends);
    const commentDetails = enrichComments(user.posts);
    const messageDetails = addMessengerDetails(user.messages);
    const besties = new Promise((resolve) => {
      User.find({_id: {$in: user.besties}}, "name profile_image", (err, users) => {
        user.besties = users;
        resolve(user);
      });
    });
    const enemies = new Promise((resolve) => {
      User.find({_id: {$in: user.enemies}}, "name profile_image", (err, users) => {
        user.enemies = users;
        resolve(user);
      });
    });
    let waitFor = [randomFriends, commentDetails, messageDetails, besties, enemies]
    Promise.all(waitFor).then((val) => {
      user.random_friends = val[0];
      user.comment_details = val[1];
      user.messages = val[2];
      return res.statusJson(200, {user});
    })

  })
}

const getFriendRequests = ({query}, res) => {
  const friendRequests = JSON.parse(query.friend_requests);
  User.find({'_id': {$in: friendRequests}}, 'name profile_image', null,(err, users) => {
    if (err) { return res.json({err: err}); }
    console.log(`Users: ${users}`);
    return res.statusJson(200, { message: 'Friend requests successfully fetched', users})
  });
}

const resolveFriendRequest = ({query, params}, res) => {
  User.findById(params.to, (err, user) => {
    const from = params.from;
    const to = params.to;
    if (err) { return res.json({ err }); }
    user.friend_requests = user.friend_requests.filter(item => item != from);
    const promise = new Promise(function(resolve, reject) {
      if (query.resolution === 'accept') {
        if (user.friends.includes(from)) {
          return res.json({ message: 'Duplicate error.' });
        }

        user.friends.push(from);
        User.findById(from, (err, user) => {
          if (err) { return res.json({err}) }
          if (user.friends.includes(to)) {
            return res.json({ message: 'Duplicate error.' });
          }

          user.friends.push(to);
          user.save((err) => {
            if (err) { return res.json({err}) }
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
    promise.then(() => {
      user.save((err) => {
        if (err) { return res.json({err}) }
        alertUser({fromUser: user, toId: from, type: 'new_friend', postContent: null}, res).then(() => {
          res.statusJson(200, { message: 'Friend request resolved', ...query, ...params });
        });
      })
    });
  });
}

const createPost = ({body, user}, res) => {
  if (!body.content || !body.theme) {
    return res.statusJson(400, {message: 'content / theme not specified'})
  }
  let userId = user._id;

  const post = new Post();
  post.theme = body.theme;
  post.content = body.content;

  User.findById(userId, (err, user) => {
    if (err) { return res.json(err) }
    let newPost = post.toObject();
    newPost.name = user.name;
    newPost.ownerId = user._id;
    newPost.ownerProfileImage = user.profile_image;
    user.posts.push(post);
    user.save((err) => {
      if (err) { return res.json(err) }
      return res.statusJson(201, {message: 'Create post', ...body, userid: userId, newPost})
    });
  });
}

const likeUnlike = (req, res) => {
  const userIdThatDoesTheLike = req.user._id;
  const postIdLiked = req.params.postId;
  const postOwnerUserId = req.params.ownerId;
  User.findById(postOwnerUserId, (err, user) => {
    if (err) { return res.json({err}) }
    const post = user.posts.id(postIdLiked);
    if (post.likes.includes(userIdThatDoesTheLike)) {
      post.likes.splice(post.likes.indexOf(userIdThatDoesTheLike), 1);
    } else {
      post.likes.push(userIdThatDoesTheLike);
    }
    user.save(() => {
      if (err) { return res.json({err})}
      res.statusJson(200, { message: 'Like or unlike a post...' });
    });
  });
}

const commentOnPost = (req, res) => {
  const ownerId = req.params.ownerId;
  const postId = req.params.postId;
  const commenterUserId = req.user._id;

  User.findById(ownerId, (err, user) => {
    if (err) { return res.json({err}) }

    const post = user.posts.id(postId);
    const comment = new Comment();
    comment.commenter_id = commenterUserId;
    comment.comment_content = req.body.content;
    post.comments.push(comment);
    user.save((err, user) => {
      if (err) { return res.json({err})}
      User.findById(commenterUserId, "name profile_image", (err, commenter) => {
        if (err) { return res.json({err})}

        res.statusJson(201, {
          message: 'Post comment',
          comment,
          commenter
        });
      })
    });
  });

}

const sendMessage = (req, res) => {
  let from = req.user._id;
  let to = req.params.to;

  const fromPromise = new Promise((resolve, reject) => {
    User.findById(from, "messages", (err, user) => {
      if (err) { reject( err); return res.json({err}) }
      from = user
      resolve(user)
    });
  });

  const toPromise = new Promise((resolve, reject) => {
    User.findById(to, "messages new_message_notifications", (err, user) => {
      if (err) { reject( err); return res.json({err}) }
      to = user
      resolve(user)
    });
  });

  const sendMessagePromise = Promise.all([fromPromise, toPromise]).then(() => {
    const hasMessageFrom = (messages, id) => {
      return messages.find((message) => message.from_id == id);
    }

    const sendMessageTo = (to, from, notify = false) => {
      return new Promise((resolve, reject) => {
        if (notify && !to.new_message_notifications.includes(from._id)) {
          to.new_message_notifications.push(from._id);
        }

        let foundMessage;
        if (foundMessage = hasMessageFrom(to.messages, from._id)) {
          foundMessage.content.push(message);
          to.save((err, user) => {
            if (err) { reject(err); return res.json({err}); }
            resolve(user);
          });
        } else {
          const newMessage = new Message();
          newMessage.from_id = from._id;
          newMessage.content = [message];

          to.messages.push(newMessage);
          to.save((err, user) => {
            if (err) { reject(err); return res.json({err}); }
            resolve(user);
          });
        }
      });
    }

    const message = {
      messenger: from._id,
      message: req.body.content,
    }
    const saveMessageToRecipient = sendMessageTo(to, from, true);
    const saveMessageToAuthor = sendMessageTo(from, to);
    return new Promise((resolve, reject) => {
      Promise.all([saveMessageToRecipient, saveMessageToAuthor]).then(() => {
        resolve();
      });
    });
  });

  sendMessagePromise.then(() => {
    return res.statusJson(201, {
      message: 'Sending message',
    });
  });
}

const resetMessageNotifications = (req, res) => {
  const userId = req.user._id;
  User.findById(userId, (err, user) => {
    if (err) { return res.json({err}) }

    user.new_message_notifications = [];
    user.save((err ) => {
      if (err) { return res.json({err}) }
      return res.statusJson(200, { message: 'Reset messages notifications' });
    });
  });
}

const getAllUsers = (req, res) => {
  User.find({},{}, {}, (err, users) => {
    if (err) { return res.send({error: err})}
    return res.json({users})
  });
}

const deleteMessage = (req, res) => {
  const messageId = req.params.id;
  const userId = req.user._id;
  User.findById(userId, (err, user) => {
    if (err) {return res.json({err: err});}
    user.messages.id(messageId).remove();
    user.save((err) => {
      if (err) {return res.json({err: err});}
      return res.statusJson(204, {message: 'Chat deleted'});
    });
  })
}

const bestieEnemyToggle = (req, res) => {
  const targetUserId = req.params.userId;
  const toggle = req.query.toggle;
  if (toggle !== 'besties' && toggle !== 'enemies') {
    return res.statusJson(400, {message: 'Incorrect toggle parameter'});
  }
  const userId = req.user._id;
  User.findById(userId, (err, user) => {
    if (err) { return res.json({err}); }
    if (!user.friends.includes(targetUserId)) {
      return res.statusJson(422, {message: 'You\'re not friends with this user.'});
    }

    const bestiesEnemiesArray = user[toggle];
    if (bestiesEnemiesArray.includes(targetUserId)) {
      bestiesEnemiesArray.splice(bestiesEnemiesArray.indexOf(targetUserId, 1));
    } else {
      if (toggle === 'besties' && user.besties.length >= 2) {
        return res.statusJson(422, {message: 'You have reached the max amount of besties.'})
      }
      bestiesEnemiesArray.push(targetUserId);
    }
    user.save((err) => {
      if (err) { return res.json({err}); }
      return res.statusJson(201, {message: 'Bestie / enemy toggle'});
    })
  });
}

const deleteAllUsers = (req, res) => {
  User.deleteMany({},{}, (err) => {
    if (err) { return res.send({error: err})}
    return res.json({message: 'All users deleted'})
  });
}

module.exports = {
  getAllUsers,
  deleteAllUsers,
  registerUser,
  loginUser,
  generateFeed,
  getSearchResults,
  makeFriendRequest,
  getUserData,
  getFriendRequests,
  resolveFriendRequest,
  createPost,
  likeUnlike,
  commentOnPost,
  sendMessage,
  resetMessageNotifications,
  deleteMessage,
  bestieEnemyToggle,
}
