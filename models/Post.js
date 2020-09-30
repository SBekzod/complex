const db = require('../db').db().collection('post')
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
            let newPost = await db.findOneAndUpdate({ _id: ObjectID(this.data.messageId) }, { $set: { title: `${this.data.title}`, body: `${this.data.body}` } })
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
                let list = await db.find({ autherId: ObjectID(authorId) }).toArray()
                resolve(list)
            } catch (err) {
                reject('problem in connection to db')
            }

        }
    })

}

module.exports = Post