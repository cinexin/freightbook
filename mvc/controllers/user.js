const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

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
      if (err.errmsg && err.errmsg.includes('duplicate key error')) {
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
  res.status(200).json(({ message: 'Generating posts for users feed.'}));
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

const deleteAllUsers = (req, res) => {
  User.deleteMany({},{}, (err) => {
    if (err) { return res.send({error: err})}
    return res.json({message: 'All users deleted'})
  });
}

module.exports = {
  deleteAllUsers,
  registerUser,
  loginUser,
  generateFeed,
  getSearchResults,
  makeFriendRequest,
  getUserData,
  getFriendRequests,
  resolveFriendRequest
}
