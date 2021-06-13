const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

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
  user.firstname = body.first_name.trim();
  user.lastname = body.last_name.trim();
  user.email = body.email;
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

module.exports = {
  registerUser,
  loginUser,
  generateFeed
}
