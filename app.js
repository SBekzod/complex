const http = require('http');
const express = require('express');
const router = require('./router');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
// const markDown = require('marked');
const sanitizer = require('sanitize-html');
const cors = require('cors');

//---------------
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

let sessionOpt = session({
    secret: 'JS is cool',
    store: new MongoStore({client: require('./server')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60, httpOnly: true}
});
app.use(flash());
app.use(sessionOpt);

app.set('views', 'views');
app.set('view engine', 'ejs');

// enabling user object from session within each ejs pages
app.use(function (req, res, next) {
    res.locals.user = req.session.user
    next();
});
app.use('/', router);
//---------------

const server = http.createServer(app);
const io = require('socket.io')(server, {serveClient: false, origins: '*:*', transport: ['websocket', 'xhr-polling']});

// getting connected user's session data via socket
io.use(function (socket, next) {
    sessionOpt(socket.request, socket.request.res, next);
});

io.on('connection', function (socket) {
    console.log('server was ready, the connection is set');
    let user = socket.request.session.user;

    // welcome connected user and provide with session data via socket connection
    if (user) {
        socket.emit('welcome', {username: user.username, avatar: user.avatar})
        socket.broadcast.emit('newUserJoined', {joinedUser: user.username})
    }

    // user send message to server
    socket.on('createMsg', function (data) {
        // then, server is sending the message to every connected user except the sender
        io.emit('newMsg', {message: sanitizer(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})

    });

});

module.exports = server;