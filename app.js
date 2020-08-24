const http = require('http')
const express = require('express')
const firstRouter = require('./router')

//---------------
const myapp = express()
myapp.use(express.static('public'))
myapp.set('views', 'views')
myapp.set('view engine', 'ejs')

myapp.use('/', firstRouter)

//---------------
const server = http.createServer(myapp)
server.listen(3000)