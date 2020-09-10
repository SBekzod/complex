const User = require('../models/User')

////----------------------------------

exports.login = function (req, res) {
    let user = new User(req.body)
    user.login(function (message) {
        if (message == 'achieved') {
            if (user.error.length > 0) {
                res.send(user.error)
            } else {
                res.send(user.result)
            }
        }
    })
    // user.login().then(response => {
    //     console.log(user.error)
    //     if (user.error.length > 0) {
    //         res.send(user.error)
    //     } else {
    //         res.send(user.result)
    //     }
    // })

}

exports.logout = function (req, res) {
}

exports.home = function (req, res) {
    // res.render('index', )
    res.render('home-guest', { username: 'Damir', surname: 'Sanakulov' })
}

exports.about = function (req, res) {
    res.send('This page is about us')
}

exports.register = function (req, res) {
    let user = new User(req.body)
    user.register()
    if (user.error.length) {
        res.send(user.error)
    } else {
        res.send("No errors")
    }

}