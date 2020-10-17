const User = require('../models/User')
const userController = module.exports

////----------------------------------

userController.login = async function (req, res) {
    let user = new User(req.body)
    // console.log(user.data.username)
    try {
        const result = await user.login()
        req.session.user = {username: user.data.username, avatar: user.avatar, authorId: user._id}
        req.session.save(function () {
            res.redirect('/')
        })
    } catch (err) {
        // req.flash('errors', err)
        req.session.flash.errors = [err]
        req.session.save(function () {
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
    let followPostsWithInfo = req.followPostsWithinfo
    res.render('home-dashboard', {permitErrors: req.flash('permitErrors')})

}

userController.about = function (req, res) {
    res.send('This page is about us')
}

userController.register = async function (req, res) {
    let user = new User(req.body)
    await user.register()
    if (user.error.length) {
        // console.log(user.error)
        req.session.flash.regErrors = user.error
        req.session.save(function () {
            res.redirect('/')
        })
    } else {
        req.session.user = {username: user.data.username, avatar: user.avatar, authorId: user._id}
        req.session.save(function () {
            res.redirect('/')
        })
    }

}

userController.mustBeLoggedIn = function (req, res, next) {
    if (req.session.user) {
        return next()
    } else {
        req.flash('errors', 'You must be logged in to post!')
        req.session.save(function () {
            res.redirect('/')
        })
    }
}

userController.mustBeLoggedInRes = function (req, res, next) {
    if (req.session.user) {
        return next()
    } else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}

userController.mustBeAuthorVisitor = function (req, res, next) {
    if (req.body.authorId != req.session.user.authorId) {
        next('you do not have right to edit')
    } else {
        next()
    }
}

userController.ifUserExists = async function (req, res, next) {
    let username = req.params.username
    try {
        let author = await User.findAuthorByUsername(username)
        req.author = author
        next()

    } catch (err) {
        // next(err)
        res.render('error-404')
    }

}

userController.isVisitorTheOwner = function (req, res, next) {
    let isVisitorTheOwner = false
    if (req.author.username == req.session.user.username) {
        isVisitorTheOwner = true
    }
    req.isVisitorTheOwner = isVisitorTheOwner
    next()
}
