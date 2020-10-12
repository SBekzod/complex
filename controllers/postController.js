const Post = require('../models/Post')
const User = require('../models/User')
const {post} = require('../router')
const {isVisitorFollowing} = require('./followController')

const postController = module.exports

postController.viewCreateScreen = function (req, res) {
    res.render('create-post', {
        avatar: req.session.user.avatar,
        postErrors: req.flash('postErrors'),
        success: req.flash('success')
    })
}

postController.create = async function (req, res) {
    req.body.autherId = req.session.user.authorId
    let post = new Post(req.body)
    try {
        await post.create()
        req.session.flash.success = 'Post is successfully posted'
        res.redirect('/create-post')

    } catch (err) {
        req.session.flash.postErrors = err
        req.session.save(function () {
            res.redirect('/create-post')
        })
    }

}

postController.viewSingle = async function (req, res, next) {
    let messageID = req.params.id
    try {
        let message = await Post.findAndShowMessage(messageID)
        let author = await User.findAuthorByAuthorId(message.autherId)

        if (req.session.user) {
            req.session.user.authorId == author._id ? author.isVisitorAuthor = true : author.isVisitorAuthor = false
        }

        res.render('single-post-screen', {author: author, message: message})
    } catch (err) {
        // next(err)
        res.render('error-404')
    }

}

postController.testing = function (req, res) {
    // console.log(req.body)
}

postController.goToProfilePosts = async function (req, res) {

    // console.log(req)
    try {
        let author = req.author
        let listOfMessages = await Post.findAllMessages(author._id)
        res.render('profile-posts', {
            allMessages: listOfMessages,
            avatar: author.avatar,
            username: author.username,
            isVisitorTheOwner: req.isVisitorTheOwner,
            isVisitorFollowing: req.isVisitorFollowing,
            numberOfFollowers: req.numberOfFollowers,
            numberOfFollowings: req.numberOfFollowings,
            sucFollow: req.flash('sucFollow'),
            failFollow: req.flash('failFollow'),
            genError: req.flash('genError')
        })
    } catch (err) {
        res.render(err)
    }
}

postController.profileFollowAspect = async function (req, res, next) {

    // res.send('FOLLOWERS')

    try {
        let author = req.author
        req.listOfMessages = await Post.findAllMessages(author._id)
        next()
    } catch (err) {
        res.render(err)
    }
}

postController.viewEditScreen = async function (req, res) {
    let messageId = req.params.id
    try {
        let message = await Post.findAndShowMessage(messageId),
            author = await User.findAuthorByAuthorId(message.autherId)

        if (req.session.user.authorId == author._id) {
            res.render('edit-post', {message: message, editSuccess: req.flash('editSuccess')})
        } else {
            req.session.flash.permitErrors = 'you do not have right to see that page'
            req.session.save(function () {
                res.redirect('/')
            })
        }
        // console.log(message)

    } catch (err) {
        res.render('error-404')
    }

}

postController.editPost = async function (req, res, next) {

    try {
        let messageId = req.params.id
        // creating post object
        req.body.messageId = messageId
        let post = new Post(req.body)
        await post.editPost()
        // directing the page to editing page with result
        req.session.flash.editSuccess = 'The Post is updated'
        res.redirect("/post/" + messageId + '/edit')

    } catch (err) {
        // next(err)
        res.render('error-404')
    }

}

postController.search = async function (req, res) {
    // console.log(req.body)
    try {
        let posts = await Post.search(req.body.searchTerm)
        // adding user information to posts array
        for (let i = 0; i < posts.length; i++) {
            let ele = posts[i]
            let author = await User.findAuthorByAuthorId(ele.autherId)
            ele.username = author.username
            ele.avatar = author.avatar
        }

        res.json(posts)
    } catch (err) {
        res.sendStatus(500)
    }

}


