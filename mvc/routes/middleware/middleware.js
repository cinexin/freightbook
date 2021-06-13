const jwt = require('express-jwt');

const authorize = jwt({
  secret: process.env.JWT_SECRET,
  _userProperty: 'payload',
  algorithms: ['HS256']
});

module.exports = {
  authorize
}
