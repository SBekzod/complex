const User = require('../models/User')


////----------------------------------

exports.login = async function (req, res) {
    let user = new User(req.body)
    try{
        const result = await user.login()
        res.send(result)
    } catch(err){
        res.send(err)
    }
    
    console.log('Final')
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
        res.send("Successfully registered")
    }

}