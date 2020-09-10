const validator = require('validator')
const db = require('../db')
const { use } = require('../router')

// constructor
let User = function (data) {
    this.data = data
    this.error = []
}

User.prototype.validate = function () {
    if (this.data.username == "") this.error.push('username should not be empty')
    if (this.data.username.length > 0 && this.data.username.length < 5 || this.data.username.length > 20)
        this.error.push('username should be at least five characters long and less then twenty characters')
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) this.error.push('username should contain only numbers and letters')
    if (!validator.isEmail(this.data.email)) this.error.push('you entered invalid email')
    if (this.data.password == "") this.error.push('password should not be empty')
    if (this.data.password.length > 0 && this.data.password.length < 8 || this.data.password.length > 15)
        this.error.push('password should be at least eight characters long and less then fifteen characters')

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

User.prototype.login = function (callback) {
    this.cleanUp()
    db.collection('users').findOne({ "username": this.data.username }, (err, data) => {
        if (err) {
            this.error.push('bad connection')
        } else if (data == null) {
            this.error.push('No user like this')
        } else if(data.password != this.data.password){
            this.error.push('Wrong paswword')
        } else {
            this.result = 'Successful: you provided valid login details'
        }
        callback('achieved')
    })

}

User.prototype.register = function () {
    // Validate user information
    this.cleanUp()
    this.validate()
    // If inputs are appropriate then make records on database
    if (this.error.length == 0) {
        db.collection('users').insertOne({ 'username': this.data.username, 'email': this.data.email, 'password': this.data.password },
            function (err, data) {
                if (err) throw new Error(err)
                else console.log('Successfully inserted to User collection')
            })

    }
}

module.exports = User