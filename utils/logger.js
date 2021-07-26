const winston = require('winston');

const logConfiguration = {
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'HH:mm:ss'
        }),
        winston.format.colorize(),
        winston.format.timestamp(),

        winston.format.printf((info) => {
            const {
                timestamp, level, message, ...args
            } = info;
            const ts = timestamp.slice(0, 19).replace('T', ' ');
            return `${ts} [${level}] : ${message}  ${Object.keys(args).length ? '\n'+JSON.stringify(args, null, 2) : ''}`;
        }),
    )
};

module.exports = winston.createLogger(logConfiguration);