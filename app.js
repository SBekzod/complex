const http = require('http')
const express = require('express')
const firstRouter = require('./router')

//---------------
const myapp = express()
myapp.use(express.urlencoded({extended: true}))
myapp.use(express.json())

myapp.set('views', 'views')
myapp.set('view engine', 'ejs')

myapp.use(express.static('public'))
myapp.use('/', firstRouter)

//---------------
const server = http.createServer(myapp)
module.exports = server