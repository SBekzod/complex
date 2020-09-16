const User = require('../models/User')
const userController = module.exports

////----------------------------------

userController.login = async function (req, res) {
    let user = new User(req.body)
    // console.log(user.data.username)
    try {
        const result = await user.login()
        req.session.user = { username: user.data.username, school: 'Cambridge' }
        req.session.save(function () {
            res.redirect('/')
        })
    } catch (err) {
        req.flash('errors', err)
        // req.session.flash.errors = [err]
        req.session.save(function(){
            res.redirect('/')
        })
    }

    // console.log('Final')
}

userController.logout = function (req, res) {
    req.session.destroy(function () {
        res.redirect('/')
    })
}

userController.home = function (req, res) {
    if (req.session.user) {
        // console.log(req.session.user.username)
        res.render('home-dashboard', { username: req.session.user.username })
    } else {
        res.render('home-guest', { errors: req.flash('errors') })
    }

}

userController.about = function (req, res) {
    res.send('This page is about us')
}

userController.register = function (req, res) {
    let user = new User(req.body)
    user.register()
    if (user.error.length) {
        res.send(user.error)
    } else {
        res.send("Successfully registered")
    }

}