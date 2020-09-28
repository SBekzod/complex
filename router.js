const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

// ruser related routes
router.get('/', userController.home)
router.get('/about', userController.about)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

//post related routes
router.get('/create-post', userController.mustBeLoggedIn , postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.post('/test', userController.mustBeLoggedIn, postController.testing)
router.get('/post/:id', postController.viewSingle)
router.get('/profile/:id', userController.mustBeLoggedIn, postController.goToProfile)

module.exports = router
