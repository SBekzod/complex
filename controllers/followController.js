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
        data = {followId: followId, subscriberId: subscriberId}
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
    let data = {followId: followId, subscriberId: subscriberId}
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

followController.goToProfileFollowers = async function (req, res) {
    let authorId = req.author._id

    try {

        let listOfFollowersAuthor = await Follow.getFollowersById(authorId)

        res.render('profile-followers', {
            allMessages: req.listOfMessages,
            avatar: req.author.avatar,
            username: req.author.username,
            isVisitorTheOwner: req.isVisitorTheOwner,
            isVisitorFollowing: req.isVisitorFollowing,
            sucFollow: req.flash('sucFollow'),
            failFollow: req.flash('failFollow'),
            listOfFollowersAuthor: listOfFollowersAuthor,
            numberOfFollowings: req.numberOfFollowings
        })

    } catch (err) {
        res.send(err)
    }

}

followController.goToProfileFollowings = async function (req, res) {

    let authorId = req.author._id
    // console.log(authorId)

    try {
        let listOfFollowingsId = await Follow.getListOfFollowingId(authorId)
        let listOfFollowingsAuthor = []
        // console.log(listOfFollowingsId)

        // getting following users author object information
        for (let i = 0; i < listOfFollowingsId.length; i++) {
            let followId = listOfFollowingsId[i].followId
            listOfFollowingsAuthor[i] = await User.findAuthorByAuthorId(followId)
        }

        // console.log(listOfFollowingsAuthor)
        res.render('profile-followings', {
            allMessages: req.listOfMessages,
            avatar: req.author.avatar,
            username: req.author.username,
            isVisitorTheOwner: req.isVisitorTheOwner,
            isVisitorFollowing: req.isVisitorFollowing,
            sucFollow: req.flash('sucFollow'),
            failFollow: req.flash('failFollow'),
            listOfFollowingsAuthor: listOfFollowingsAuthor,
            numberOfFollowers: req.numberOfFollowers
        })

    } catch (err) {
        res.session.flash.genError = err
        res.redirect(`/profile/${req.author.username}`)
    }


}

followController.profileFollowingsAspect = async function (req, res, next) {

    let authorId = req.author._id
    // console.log(authorId)

    try {
        let listOfFollowingsId = await Follow.getListOfFollowingId(authorId)
        let listOfFollowingsAuthor = []
        // console.log(listOfFollowingsId)

        // getting following users author object information
        for (let i = 0; i < listOfFollowingsId.length; i++) {
            let followId = listOfFollowingsId[i].followId
            listOfFollowingsAuthor[i] = await User.findAuthorByAuthorId(followId)
        }

        req.numberOfFollowings = listOfFollowingsAuthor.length
        next()

    } catch (err) {
        res.send(err)
    }


}

followController.profileFollowersAspect = async function (req, res, next) {
    let authorId = req.author._id

    try {
        let listOfFollowersId = await Follow.getListOfFollowerId(authorId)
        let listOfFollowersAuthor = []

        // getting subscribed users author object information
        for (let i = 0; i < listOfFollowersId.length; i++) {
            let subscriberId = listOfFollowersId[i].subscriberId
            listOfFollowersAuthor[i] = await User.findAuthorByAuthorId(subscriberId)
        }

        req.numberOfFollowers = listOfFollowersAuthor.length
        next()

    } catch (err) {
        res.send(err)
    }

}

followController.getFollowingIds = async function (req, res, next) {
    let authorId = req.session.user.authorId

    try {
        req.followIdList = await Follow.getFollowingPostsAndInfo(authorId)
        next()
    } catch {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }


}



