const http = require('http')
const express = require('express')
const firstRouter = require('./router')

const Mongodb = require('mongodb')
const url = 'mongodb+srv://todouser:todo14@cluster0.b91ez.mongodb.net/Complex?retryWrites=true&w=majority'
Mongodb.connect(url, {useUnifiedTopology: true}, function(err, client){
    if(err) throw new Error(err)
    else {
        console.log('Connected to Mongodb')
        global.db = client.db()
    }
})

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
server.listen(3000)