const db = require('../db').db().collection('post')

// Constructor
let Post = function (data) {
    this.data = data
    this.error = []
}

Post.prototype.cleanUp = function () {
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        autherId: this.data.autherId.trim()
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
        if(this.error.length == 0) {
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

module.exports = Post