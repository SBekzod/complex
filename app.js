const http = require('http')
const express = require('express')

//---------------
const myapp = express()
myapp.use(express.static('public'))
myapp.set('views', 'views')
myapp.set('view engine', 'ejs')

myapp.get('/', function(req, res) {
    res.render('home-guest')
})


//---------------
const server = http.createServer(myapp)
server.listen(3000)