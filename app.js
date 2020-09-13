const http = require('http')
const express = require('express')
const firstRouter = require('./router')
const session = require('express-session')

//---------------
const myapp = express()
let sessionOpt = session({
    secret: 'JS is cool',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*2, httpOnly: true} 
})

myapp.use(sessionOpt)
myapp.use(express.urlencoded({extended: true}))
myapp.use(express.json())

myapp.set('views', 'views')
myapp.set('view engine', 'ejs')

myapp.use(express.static('public'))
myapp.use('/', firstRouter)

//---------------
const server = http.createServer(myapp)
module.exports = server