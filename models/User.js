const validator = require('validator')
const db = require('../db').db()
const bcrypt = require('bcryptjs')

// constructor
let User = function (data) {
    this.data = data
    this.error = []
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
    this.cleanUp()

    return new Promise((resolve, reject) => {
        db.collection('users').findOne({ "username": this.data.username }).then((data) => {
            if (data == null) reject('No user like this')
            else if (!bcrypt.compareSync(this.data.password, data.password)) reject('Wrong paswword')
            else resolve('Successful: you provided valid login details')
        }).catch(function (err) {
            reject(err)
        })
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
            db.collection('users').insertOne({ 'username': this.data.username, 'email': this.data.email, 'password': this.data.password },
                function (err, data) {
                    if (err) throw new Error(err)
                    else console.log('Successfully inserted to User collection')
                })
        }
        resolve()
    })

}

module.exports = User