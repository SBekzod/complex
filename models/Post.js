const db = require('../server').db().collection('post')
const ObjectID = require('mongodb').ObjectID


// Constructor
let Post = function (data) {
    this.data = data
    this.error = []
}

Post.prototype.cleanUp = function () {
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date(),
        autherId: ObjectID(this.data.autherId.trim())
    }
}

Post.prototype.validate = function () {
    if (this.data.title == '' && this.data.body == '') {
        this.error.push('you should type the title')
        this.error.push('you should type the body')
    } else if (this.data.body == '') {
        this.error.push('you should type the body')
    } else if (this.data.title == '') {
        this.error.push('you should type the title')
    }
}

Post.prototype.create = function () {

    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (this.error.length == 0) {
            try {
                await db.insertOne(this.data)
                resolve()
            } catch (err) {
                this.error.push(err)
                reject(this.error)
            }
        } else {
            reject(this.error)
        }

    })

}

Post.prototype.editPost = function () {

    return new Promise(async (resolve, reject) => {

        try {
            let newPost = await db.findOneAndUpdate({_id: ObjectID(this.data.messageId)}, {
                $set: {
                    title: `${this.data.title}`,
                    body: `${this.data.body}`
                }
            })
            resolve(newPost)
        } catch (err) {
            reject(err)
        }

    })
}


// Non OOP method on FPC
Post.findAndShowMessage = function (messageID) {

    return new Promise(async (resolve, reject) => {
        if (typeof messageID != 'string') {
            reject('the request is suspicious')
        } else {
            try {
                let message = await db.findOne(ObjectID(messageID))
                // console.log(message)
                if (message == null) throw new Error('No message with this messageId')
                resolve(message)
            } catch (err) {
                reject(err)
            }
        }
    })
}

// Non OOP method on FPC
Post.findAllMessages = function (authorId) {

    return new Promise(async function (resolve, reject) {
        if (typeof authorId != 'object') {
            reject('suspicious request')
        } else {
            try {
                let list = await db.find({autherId: ObjectID(authorId)}).toArray()
                resolve(list)
            } catch (err) {
                reject('problem in connection to db')
            }

        }
    })

}

// Non OOP method on FPC
Post.search = function (term) {
    return new Promise(async function (resolve, reject) {
        if (typeof (term) == 'string') {
            try {
                let posts = await db.find({title: {$regex: `${term}`}}).toArray()
                // if(posts.length == 0) reject('no posts were found')
                resolve(posts)
            } catch (err) {
                reject(err)
            }
        } else {
            reject('malicious request')
        }

    })
}

// Non OOP on FPC
Post.getFollowPosts = function (list) {

    return new Promise(async (resolve, reject) => {
        let followPosts = await db.aggregate([
            {$match: {autherId: {$in: list}}},
            {$sort: {createdDate: -1}},
            {$lookup: {from: "users", localField: "autherId", foreignField: "_id", as: "authorList"}},
        ]).toArray()

        followPosts = followPosts.map(ele => {
            return {
                title: ele.title,
                body: ele.body,
                username: ele.authorList[0].username,
                email: ele.authorList[0].email
            }
        })

        resolve(followPosts)
    })
}

module.exports = Post