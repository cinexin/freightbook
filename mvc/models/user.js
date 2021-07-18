const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const commentSchema = new mongoose.Schema({
  commenter_name: {
    type: String,
    required: true,
  },
  commenter_id: {
    type: String,
    required: true,
  },
  comment_content: {
    type: String,
    required: true,
  },
});

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  theme: {
    type: String,
    default: 'primary'
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: [commentSchema],
    default: []
  },
});

const messageSchema = new mongoose.Schema({
  from_id: {
    type: String,
    required: true,
    unique: false
  },
  content: [
    {
      messenger: String,
      message: String
    }
  ]
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  friends: [String],
  friend_requests: [String],
  besties: [String],
  enemies: [String],
  posts: {
    type: [postSchema],
    default: []
  },
  messages: {
    type:[messageSchema],
    default: []
  },
  notifications: [String],
  profile_image: {type: String, default: "default-avatar"},
  new_message_notifications: {
    type: Number,
    default: 0
  },
  new_notifications: {
    type: Number,
    default: 0
  },
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(64).toString('hex');
  this.password = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
}

userSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return hash === this.password;
}

userSchema.methods.getJwt = function() {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
  }, process.env.JWT_SECRET);
}

mongoose.model('User', userSchema);
mongoose.model('Message', messageSchema);
mongoose.model('Post', postSchema);
mongoose.model('Comment', commentSchema);

