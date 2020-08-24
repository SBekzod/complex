const express = require('express')

const firstRouter = express.Router()
firstRouter.get('/',function(req, res) {
    console.log('passed =========')
    res.render('home-guest')
})

firstRouter.get('/about', function(req, res) {
    res.send("HERE")
})

module.exports = firstRouter
