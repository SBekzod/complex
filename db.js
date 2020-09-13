const dotenv = require('dotenv')
dotenv.config()

const Mongodb = require('mongodb')
Mongodb.connect(process.env.CONNECTIONURL, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    if (err) throw new Error(err)
    else {
        module.exports = client
        console.log('Connected to Mongodb')

        const server = require('./app')
        server.listen(process.env.PORT, function () {
            console.log('Connected to the Server')
        })
    }
})