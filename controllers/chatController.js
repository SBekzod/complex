const chatController = module.exports

chatController.channelList = function (req, res) {
    console.log(req.session.user)
    let mb_id = req.session.user['authorId']
    res.render('chat/chat-list', {mb_id: mb_id})
}
