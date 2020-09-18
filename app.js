const http = require('http')
const express = require('express')
const router = require('./router')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')

//---------------
const myapp = express()
let sessionOpt = session({
    secret: 'JS is cool',
    store: new MongoStore({ client: require('./db') }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 2, httpOnly: true }
})

myapp.use(flash())
myapp.use(sessionOpt)
myapp.use(express.urlencoded({ extended: true }))
myapp.use(express.json())

myapp.set('views', 'views')
myapp.set('view engine', 'ejs')

myapp.use(express.static('public'))
myapp.use(function(req, res, next){
    res.locals.user = req.session.user
    next()
})
myapp.use('/', router)

//---------------
const server = http.createServer(myapp)
module.exports = server