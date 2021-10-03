const express = require('express');
const router = express.Router();
const middleware = require('./middleware/middleware');

const usersCtrl = require('../controllers/user');
const fakeUsersCtrl = require('../controllers/fake-users');


router.post('/register', usersCtrl.registerUser);
router.post('/login', usersCtrl.loginUser);
router.get('/all', usersCtrl.getAllUsers);
router.get('/generate-feed', middleware.authorize, usersCtrl.generateFeed);
router.get('/get-search-results', middleware.authorize, usersCtrl.getSearchResults);
router.get('/get-friend-requests', middleware.authorize, usersCtrl.getFriendRequests);
router.get('/get-user-data/:userid', middleware.authorize, usersCtrl.getUserData);
router.post('/make-friend-request/:from/:to', middleware.authorize, usersCtrl.makeFriendRequest);
router.post('/resolve-friend-request/:from/:to', middleware.authorize, usersCtrl.resolveFriendRequest);
router.post('/create-post', middleware.authorize, usersCtrl.createPost);
router.post('/like-unlike/:ownerId/:postId', middleware.authorize, usersCtrl.likeUnlike);
router.post('/post-comment/:ownerId/:postId', middleware.authorize, usersCtrl.commentOnPost);


router.post('/create-fake-users', fakeUsersCtrl.createFakeUsers);

module.exports = router;
