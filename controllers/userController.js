const User = require('../models/User')
const userController = module.exports

////----------------------------------

userController.login = async function (req, res) {
    let user = new User(req.body)
    // console.log(user.data.username)
    try {
        const result = await user.login()
        req.session.user = { username: user.data.username, school: 'Cambridge' }
        res.send(result)
    } catch (err) {
        res.send(err)
    }

    // console.log('Final')
} 

userController.logout = function (req, res) {
}

userController.home = function (req, res) {
    if (req.session.user) {
        console.log(req.session.user.username)
        res.render('home-dashboard', {username: req.session.user.username})
    } else {
        res.render('home-guest', { username: 'Damir', surname: 'Sanakulov' })
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