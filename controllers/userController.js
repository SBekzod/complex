const User = require('../models/User')

////----------------------------------

exports.login = function (req, res) {
}

exports.logout = function (req, res) {
}

exports.home = function (req, res) {
    res.render('home-guest')
}

exports.about = function (req, res) {
    res.send('This page is about us')
}

exports.register = function (req, res) {
    console.log(req.body)
    // let user = new User(req.body)
    // user.register()
    res.send("Thanks on register")
}