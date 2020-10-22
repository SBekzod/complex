const http = require('http')
const express = require('express')
const router = require('./router')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markDown = require('marked')

//---------------
const myapp = express()
let sessionOpt = session({
    secret: 'JS is cool',
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60, httpOnly: true}
})

myapp.use(flash())
myapp.use(sessionOpt)
myapp.use(express.urlencoded({extended: true}))
myapp.use(express.json())

myapp.set('views', 'views')
myapp.set('view engine', 'ejs')

myapp.use(express.static('public'))
// enabling user object from session within each ejs pages
myapp.use(function (req, res, next) {
    res.locals.user = req.session.user
    next()
})
myapp.use('/', router)

//---------------
const server = http.createServer(myapp)

const io = require('socket.io')(server)

// getting connected user's session data
io.use(function (socket, next) {
    sessionOpt(socket.request, socket.request.res, next)
})

io.on('connection', function (socket) {
    console.log('server was ready, the connection is set')
    let user = socket.request.session.user

    // welcome connected user and provide with session data via socket connection
    if (user) {
        socket.emit('welcome', {username: user.username, avatar: user.avatar})
    }

    // user send message to server
    socket.on('sentMessageByBrowser', function (data) {

        // then, server is sending the message to every connected user except the sender
        socket.broadcast.emit('sentByServer', {message: data.message, username: user.username, avatar: user.avatar})

    })

})

module.exports = server