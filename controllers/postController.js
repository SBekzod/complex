const postController = module.exports

postController.viewCreateScreen = function(req, res) {
    res.render('create-post', {avatar: req.session.user.avatar})
}