const talkController = module.exports

talkController.channelList = function (req, res) {
    console.log(req.session.user)
    res.render('ltalk/l-talk-channel-list', {channel_id: "CH1616129196177281424"})
}

talkController.userSearch = function (req, res) {
    console.log(req.session.user)
    res.render('ltalk/l-talk-user-search', {channel_id: "CH1616129196177281424"})
}