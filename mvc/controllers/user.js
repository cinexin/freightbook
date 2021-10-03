const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const timeAgo = require('time-ago');

const containsDuplicate = (array) =>  new Set(array).size !== array.length;

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
  const maxAmountOfPosts = 38;

  const enrichPosts = (posts, name, ownerId) => {
    let item;
    for (item of posts) {
      item.name = name;
      item.ago = timeAgo.ago(item.date);
      item.ownerId = ownerId;
    }
  }
  const myPosts = new Promise((resolve, reject) => {
    User.findById(userId, 'name posts friends', {lean: true}, (err, user) => {
      if (err) {return res.json({err})}
      enrichPosts(user.posts, user.name, user._id)
      posts.push(...user.posts);
      resolve(user.friends);
    });
  });

  const myFriendsPosts = myPosts.then((friendsArray) => {
    return new Promise((resolve, reject) => {
      User.find({'_id': {$in: friendsArray}}, 'name posts', {lean: true}, (err, users) => {
        if (err) { return res.json({err}); }

        let user;
        for (user of users) {
          enrichPosts(user.posts, user.name, user._id)
          posts.push(...user.posts);
        }
        resolve();
      });
    });
  })

  myFriendsPosts.then(() => {
    posts.sort((a, b) => (a.date > b.date) ? -1 : 1);
    posts = posts.slice(0, maxAmountOfPosts);
    res.statusJson(200, { posts: posts });
  });
}

const getSearchResults = (req, res) => {
  const query = req.query;
  if (!query.query) { return res.json({err: 'Missing query'}); }
  User.find({name: {$regex: query.query, $options: 'i'}}, 'name friends friend_requests', {},  (err, docs) => {
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
  User.findById(userId, (err, user) => {
    if (err) { return res.json({err: err}); }
    return res.statusJson(200, {user});
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
          user.save((err, user) => {
            if (err) { return res.json({err}) }
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
    promise.then(() => {
      user.save((err, user) => {
        if (err) { return res.json({err}) }
        res.statusJson(200, { message: 'Friend request resolved', ...query, ...params });
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
  User.findById(req.params.ownerId, (err, user) => {
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

const getAllUsers = (req, res) => {
  User.find({},{}, {}, (err, users) => {
    if (err) { return res.send({error: err})}
    return res.json({users})
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
  likeUnlike
}
