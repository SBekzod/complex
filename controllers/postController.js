const postController = module.exports
const Post = require('../models/Post')

postController.viewCreateScreen = function (req, res) {
    res.render('create-post', { avatar: req.session.user.avatar, postErrors: req.flash('postErrors') })
}

postController.create = async function (req, res) {
    // console.log(req.session.user)
    req.body.autherId = req.session.user.autherId
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

postController.viewSingle = function(req, res) {
    res.render('single-post-screen')
}