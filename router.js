const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

// user related routes
router.get('/', userController.home)
router.get('/about', userController.about)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// profile related routes
router.get('/profile/:username', userController.mustBeLoggedIn, userController.ifUserExists, postController.goToProfilePosts)

//post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.post('/test', userController.mustBeLoggedIn, postController.testing)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit-post', userController.mustBeAuthorVisitor, postController.editPost)
router.post('/search', postController.search)

module.exports = router
