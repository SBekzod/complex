const express = require('express')
const userController = require('./controllers/userController')

const firstRouter = express.Router()
firstRouter.get('/', userController.home)
firstRouter.get('/about', userController.about)
firstRouter.post('/register', userController.register)

module.exports = firstRouter
