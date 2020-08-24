const http = require('http')
const express = require('express')

//---------------
const myapp = express()
myapp.get('/', function(req, res) {
    res.send('Hello')
})


//---------------
const server = http.createServer(myapp)
server.listen(3000)