const dotenv = require('dotenv')
global.logger = require('./utils/logger');
dotenv.config()

const Mongodb = require('mongodb')
Mongodb.connect(process.env.CONNECTIONURL, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    if (err) throw new Error(err)
    else {
        module.exports = client
        logger.info('Connected to Mongodb');

        const server = require('./app')
        server.listen(process.env.PORT, function () {
            logger.info('Connected to the Server');
        })
    }
})