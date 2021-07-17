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
    console.log(req.session.user)
    let target_user = "none"
    let mb_id = req.session.user['authorId']
    if (req.query.hasOwnProperty('target_id')) target_user = req.query['target_id']
    console.log("THIS IS TARGET_ID: ", target_user)
    console.log("THIS IS MB_ID: ", mb_id)
    res.render('home-dashboard', {followPosts: followPostsWithInfo, target_user: target_user, mb_id: mb_id, permitErrors: req.flash('permitErrors')})
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
        console.log(req.url)
        if (req.url === '/l-talk-list') req.flash('errors', `You must log in to make ltalk 🥶, please login 😅`)
        else req.flash('errors', 'You must be logged in to post!')

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

userController.getUserInfo = async function (req, res) {
    let username = req.params.username
    try {
        let result = await User.findAuthorByUsername(username)
        await res.json(result)
    } catch (err) {
        console.log("Error getUserInfo: ", err.message)
        await res.json({result: false})
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

// userController.getPostsAndInfo = async function (req, res) {
//
//     if (!req.session.user) {
//         res.render('error-404')
//     } else {
//         let username = req.session.user.username
//         try {
//             let followPosts = await User.getPostsAndInfo(username)
//             res.render('home-dashboard', {permitErrors: [], followPosts: followPosts})
//         } catch {
//             res.render('error-404')
//         }
//     }
//
// }
