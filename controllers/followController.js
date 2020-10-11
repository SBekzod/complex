const Follow = require('../models/Follow')
const User = require('../models/User')


const followController = module.exports

followController.subscribe = async function (req, res) {

    const username = req.params.username
    try {
        let author = await User.findAuthorByUsername(username),
            followId = author._id,
            subscriberId = req.session.user.authorId,
            data = { followId: followId, subscriberId: subscriberId }

        let follow = new Follow(data)

        await follow.subscribeToUsername()
        // res.send('Fulfilled')
        req.session.flash.sucFollow = 'Successfully subscribed!'
        res.redirect(`/profile/${username}`)
    } catch (err) {
        req.session.flash.failFollow = 'Fail to subscribe, already subscribed!'
        res.redirect(`/profile/${username}`)
    }
}

followController.unsubscribe = async function (req, res) {

    let followId = req.author._id,
        username = req.params.username,
        subscriberId = req.session.user.authorId,
        data = { followId: followId, subscriberId: subscriberId }
    let follow = new Follow(data)
    let result 

    try {
        result = await follow.unsubscribe()
    } catch (err) {
        res.send(err)
    }

    req.session.flash.sucFollow = 'Unsubscribed successfully!'
    res.redirect(`/profile/${username}`)
}

followController.isVisitorFollowing = async function (req, res, next) {

    let followId = req.author._id
    let subscriberId = req.session.user.authorId
    let data = { followId: followId, subscriberId: subscriberId }
    let follow = new Follow(data)

    try {
        let isVisitorFollowing = await follow.isVisitorFollowing()
        // console.log(isVisitorFollowing)
        req.isVisitorFollowing = isVisitorFollowing
    } catch (err) {
        res.send(err)
    }

    next()

}

