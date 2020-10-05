const db = require('../db').db().collection('follow')
const ObjectID = require('mongodb').ObjectID


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
                // Check first whether the user is subscribed or not
                let sub_history = await db.findOne({
                    followId: this.data.followId,
                    subscriberId: ObjectID(this.data.subscriberId)
                })
                if (sub_history != null) {
                    reject('already subscribed to this user')
                    return
                }

                // Subscribe the user to the chosen followId
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

module.exports = Follow