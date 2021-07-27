const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const followController = require('./controllers/followController');
const talkController = require('./controllers/talkController');
const chatController = require('./controllers/chatController');

// user related routes
router.get('/', userController.mustBeLoggedInRes, followController.getFollowingIds, postController.getPostsWithInfo, userController.home)
// router.get('/', userController.getPostsAndInfo)
router.get('/about', userController.about)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// profile related routes
router.get('/profile/:username', userController.mustBeLoggedIn, userController.ifUserExists,
    userController.isVisitorTheOwner, followController.isVisitorFollowing, followController.profileFollowingsAspect, followController.profileFollowersAspect, postController.goToProfilePosts)
router.get('/profile/:username/followers', userController.mustBeLoggedIn, userController.ifUserExists,
    userController.isVisitorTheOwner, followController.isVisitorFollowing, postController.profileFollowAspect, followController.profileFollowingsAspect, followController.goToProfileFollowers)
router.get('/profile/:username/followings', userController.mustBeLoggedIn, userController.ifUserExists,
    userController.isVisitorTheOwner, followController.isVisitorFollowing, postController.profileFollowAspect, followController.profileFollowersAspect, followController.goToProfileFollowings)

// post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.post('/test', userController.mustBeLoggedIn, postController.testing)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit-post', userController.mustBeAuthorVisitor, postController.editPost)
router.post('/search', postController.search)

// follow related routes
router.post('/follow/:username', userController.mustBeLoggedIn, followController.subscribe)
router.post('/unfollow/:username', userController.mustBeLoggedIn, userController.ifUserExists, followController.unsubscribe)

// L-TALK related routes
router.get('/l-talk-list', userController.mustBeLoggedIn, talkController.channelList)
router.get('/l-talk/user-search', userController.mustBeLoggedIn, talkController.userSearch)
router.get('/l-talk/user-search/:username', userController.mustBeLoggedIn, userController.getUserInfo)

// L-CHAT related routes
router.get('/l-chat/list', userController.mustBeLoggedIn, chatController.channelList);
router.get('/l-chat/room', userController.mustBeLoggedIn, chatController.enterRoom);
router.get('/l-chat/creat-room/:id', userController.mustBeLoggedIn, chatController.createRoom);
router.post('/l-chat/creat-room', userController.mustBeLoggedIn, chatController.createRoomProcess);

module.exports = router
