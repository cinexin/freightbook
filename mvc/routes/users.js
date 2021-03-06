const express = require('express');
const router = express.Router();
const middleware = require('./middleware/middleware');

const usersCtrl = require('../controllers/user');
const fakeUsersCtrl = require('../controllers/fake-users');

// Login in & Register
router.post('/register', usersCtrl.registerUser);
router.post('/login', usersCtrl.loginUser);

// Basic GET requests
router.get('/all', usersCtrl.getAllUsers);
router.get('/generate-feed', middleware.authorize, usersCtrl.generateFeed);
router.get('/get-user-data/:userid', middleware.authorize, usersCtrl.getUserData);
router.get('/get-search-results', middleware.authorize, usersCtrl.getSearchResults);

// Routes Handling friend requests
router.get('/get-friend-requests', middleware.authorize, usersCtrl.getFriendRequests);
router.post('/make-friend-request/:from/:to', middleware.authorize, usersCtrl.makeFriendRequest);
router.post('/resolve-friend-request/:from/:to', middleware.authorize, usersCtrl.resolveFriendRequest);

// Routes handling posts
router.post('/create-post', middleware.authorize, usersCtrl.createPost);
router.post('/like-unlike/:ownerId/:postId', middleware.authorize, usersCtrl.likeUnlike);
router.post('/post-comment/:ownerId/:postId', middleware.authorize, usersCtrl.commentOnPost);

// Routes handling messages
router.post('/send-message/:to', middleware.authorize, usersCtrl.sendMessage);
router.post('/reset-message-notifications', middleware.authorize, usersCtrl.resetMessageNotifications);
router.delete('/messages/:id', middleware.authorize, usersCtrl.deleteMessage);

// Misc Routes
router.post('/bestie-enemy-toggle/:userId', middleware.authorize, usersCtrl.bestieEnemyToggle);
router.post('/reset-alert-notifications', middleware.authorize, usersCtrl.resetAlertNotifications);

// Development & testing only!
router.post('/create-fake-users', fakeUsersCtrl.createFakeUsers);

module.exports = router;
