const validator = require('validator')
const db = require('../db').db()
const bcrypt = require('bcryptjs')
const md5 = require('md5')
const ObjectID = require('mongodb').ObjectID

// constructor
let User = function (data) {
    this.data = data
    this.error = []
    this._id
}

User.prototype.validate = function () {
    return new Promise(async (resolve, reject) => {
        if (this.data.username == "") this.error.push('username should not be empty')
        if (this.data.username.length > 0 && this.data.username.length < 5 || this.data.username.length > 20)
            this.error.push('username should be at least five characters long and less then twenty characters')
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) this.error.push('username should contain only numbers and letters')
        if (!validator.isEmail(this.data.email)) this.error.push('you entered invalid email')
        if (this.data.password == "") this.error.push('password should not be empty')
        if (this.data.password.length > 0 && this.data.password.length < 8 || this.data.password.length > 15)
            this.error.push('password should be at least eight characters long and less then fifteen characters')

        if (this.data.username.length >= 5 && this.data.username.length <= 20 && validator.isAlphanumeric(this.data.username)) {
            let usernameExits = await db.collection('users').findOne({ 'username': this.data.username })
            if (usernameExits) this.error.push('the username that you are using has been already used')
            // console.log('I passed here later')
        }
        resolve()
    })


}

User.prototype.cleanUp = function () {
    if (typeof (this.data.username) != 'string') this.data.username = ''
    if (typeof (this.data.password) != 'string') this.data.password = ''
    if (typeof (this.data.email) != 'string') this.data.email = ''

    // avoiding bogus
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }

}

User.prototype.login = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        try {
            let data = await db.collection('users').findOne({ "username": this.data.username })
            if (data == null) reject('No user like this')
            else if (!bcrypt.compareSync(this.data.password, data.password)) reject('Wrong paswword')
            else {
                resolve('Successful: you provided valid login details')
                // console.log(data)
                this.data = data
                this._id = data._id
                this.getAvatar()
            }
        } catch (err) {
            reject(err)
        }

    })

}

User.prototype.register = function () {

    return new Promise(async (resolve, reject) => {
        // Validate user information
        this.cleanUp()
        await this.validate()
        // console.log('will wait till the end')

        // If inputs are appropriate then make records on database
        if (this.error.length == 0) {
            // hashing codes before saving onto db
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            try {
                let data = await db.collection('users').insertOne({
                    'username': this.data.username,
                    'email': this.data.email,
                    'password': this.data.password
                })
                console.log('Successfully inserted to User collection')
                this._id = data.ops[0]._id
                this.getAvatar()
            } catch (err) {
                this.error.push(err)
            }
        }
        resolve()
    })

}

User.prototype.getAvatar = function () {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

// Non OOP method on FPC
User.findAuthorByUsername = function (username) {

    return new Promise(async (resolve, reject) => {
        try {
            let author = await db.collection('users').findOne({ "username": username })
            if(author == null) throw new Error('No user with this name')
            author.avatar = `https://gravatar.com/avatar/${md5(author.email)}?s=128`
            delete author.password
            resolve(author)
        } catch (err) {
            reject(err)
        }

    })

}

// Non OOP method on FPC
User.findAuthorByAuthorId = function (authorID) {

    return new Promise(async (resolve, reject) => {
        try {
            let author = await db.collection('users').findOne(ObjectID(authorID))
            if(author == null) throw new Error('No user with this id')
            author.avatar = `https://gravatar.com/avatar/${md5(author.email)}?s=128`
            delete author.password
            resolve(author)
        } catch (err) {
            reject(err)
        }

    })

}

module.exports = User