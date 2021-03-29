const talkController = module.exports

talkController.channelList = function (req, res) {
    console.log(req.session.user)
    let target_user = "none"
    let mb_id = req.session.user['authorId']
    if (req.query.hasOwnProperty('target_id')) target_user = req.query['target_id']
    console.log("THIS IS TARGET_ID: ", target_user)
    console.log("THIS IS MB_ID: ", mb_id)
    res.render('ltalk/l-talk-channel-list', {target_user: target_user, mb_id: mb_id})
}

talkController.userSearch = function (req, res) {
    console.log(req.session.user)
    res.render('ltalk/l-talk-user-search')
}