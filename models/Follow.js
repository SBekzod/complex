const db = require('../db').db().collection('follow')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')


let Follow = function (data) {
    this.data = data
}

Follow.prototype.subscribeToUsername = function () {

    return new Promise(async (resolve, reject) => {

        if (typeof this.data.followId != 'object' || typeof this.data.subscriberId != 'string') {
            reject('Malicious request')
            return
        } else {

            try {
                // check first whether the user is subscribed or not
                let sub_history = await db.findOne({
                    followId: this.data.followId,
                    subscriberId: ObjectID(this.data.subscriberId)
                })
                // console.log(sub_history)
                if (sub_history != null) {
                    reject('already subscribed to this user')
                    return
                }

                // checking if the user is not the owner of the page
                if (this.data.followId == this.data.subscriberId) {
                    reject('User can not subscribe to himself')
                    return
                }

                // subscribe the user to the chosen followId
                let result = await db.insertOne({
                    followId: this.data.followId,
                    subscriberId: ObjectID(this.data.subscriberId)
                })
                if (result == null) reject('failed to insert')
                resolve('subscribed')
            } catch (err) {
                reject(err)
            }

        }

    })

}

Follow.prototype.isVisitorFollowing = function () {

    return new Promise(async (resolve, reject) => {

        try {
            let sub_history = await db.findOne({
                followId: this.data.followId,
                subscriberId: ObjectID(this.data.subscriberId)
            })
            // console.log(sub_history)
            if (sub_history != null) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (err) {
            reject('Error in database connection')
        }


    })
}

Follow.prototype.unsubscribe = function () {
    return new Promise(async (resolve, reject) => {

        try {
            await db.deleteOne({
                followId: this.data.followId,
                subscriberId: ObjectID(this.data.subscriberId)
            })
            resolve('deleted')
        } catch (err) {
            reject(err)
        }


    })
}


// Non OOP on FPC
Follow.getListOfFollowerId = function (authorId) {

    return new Promise(async (resolve, reject) => {
        try {
            let resultList = await db.find({followId: authorId}).toArray()
            resolve(resultList)
        } catch (err) {
            reject(err)
        }

    })

}

// Non OOP on FPC
Follow.getListOfFollowingId = function (authorId) {

    return new Promise(async (resolve, reject) => {
        try {
            let resultList = await db.find({subscriberId: authorId}).toArray()
            resolve(resultList)
        } catch (err) {
            reject(err)
        }

    })

}

// Non OOP on FPC
Follow.getFollowersById = function (authorId) {

    return new Promise(async (resolve, reject) => {
        try {
            // aggregating two database combined search
            let followers = await db.aggregate([
                {$match: {followId: authorId}},
                {$lookup: {from: "users", localField: "subscriberId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]}
                }}
            ]).toArray()

            // adding avatars to the followers list array
            followers = followers.map(function (ele) {
                let user = new User(ele)
                user.getAvatar()
                return {username: ele.username, avatar: user.avatar}
            })
            resolve(followers)

        } catch (err) {
            reject(err)
        }

    })

}


module.exports = Follow