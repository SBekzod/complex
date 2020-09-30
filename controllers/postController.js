const postController = module.exports
const Post = require('../models/Post')
const User = require('../models/User')

postController.viewCreateScreen = function (req, res) {
    res.render('create-post', { avatar: req.session.user.avatar, postErrors: req.flash('postErrors') })
}

postController.create = async function (req, res) {
    req.body.autherId = req.session.user.authorId
    let post = new Post(req.body)
    try {
        await post.create()
        res.send('Success')

    } catch (err) {
        req.session.flash.postErrors = err
        req.session.save(function () {
            res.redirect('/create-post')
        })
    }

}

postController.viewSingle = async function (req, res) {
    let messageID = req.params.id
    try {
        let message = await Post.findAndShowMessage(messageID)
        let author = await User.findAuthorByAuthorId(message.autherId)

        if (req.session.user) {
            req.session.user.authorId == author._id ? author.isVisitorAuthor = true : author.isVisitorAuthor = false
        }

        res.render('single-post-screen', { author: author, message: message })
    } catch (err) {
        res.render('error-404')
    }

}

postController.testing = function (req, res) {
    console.log(req.body)
}

postController.goToProfilePosts = async function (req, res) {
    try {
        let author = req.author
        let listOfMessages = await Post.findAllMessages(author._id)
        res.render('profile-posts', { allMessages: listOfMessages, avatar: author.avatar, username: author.username })
    } catch (err) {
        res.render(err)
    }
}
