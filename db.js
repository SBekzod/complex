const Mongodb = require('mongodb')

const url = 'mongodb+srv://todouser:todo14@cluster0.b91ez.mongodb.net/Complex?retryWrites=true&w=majority'
Mongodb.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    if (err) throw new Error(err)
    else {
        module.exports = client.db()
        console.log('Connected to Mongodb')

        const server = require('./app')
        server.listen(3000, function () {
            console.log('Connected to the Server')
        })
    }
})
