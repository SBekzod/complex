const Follow = require('../models/Follow')
const User = require('../models/User')


const followController = module.exports

followController.subscribe = async function (req, res) {

    const username = req.params.username
    try {
        let author = await User.findAuthorByUsername(username),
            followId = author._id,
            subscriberId = req.session.user.authorId,
            data = {followId: followId, subscriberId: subscriberId}

        let follow = new Follow(data)

        await follow.subscribeToUsername()
        // res.send('Fulfilled')
        res.redirect(`/profile/${username}`)
    } catch (err) {
        res.send(err)
    }
}

followController.unsubscribe = function (req, res) {

}

