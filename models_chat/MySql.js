const mysql = require('mysql2/promise');
const moment = require('moment');

class MySql {
    constructor() {
        this.con = null
    }

    async connection() {
        this.con = await mysql.createConnection({
            host: '31.220.109.104',
            user: 'martindb',
            password: 'Damir2014@',
            port: '3306',
            database: 'lchat_complex'
        })
    }

    async getActiveChatRooms() {
        try {
            if (!this.con) await this.connection();
            const query_result = await this.con.execute('select * from channel_info where room_id > ? and status = ? ', [0, 'active']);
            if (query_result[0].length === 0) {
                return false;
            } else {
                return query_result[0];
            }
        } catch (e) {
            logger.error(`getActiveChatRooms: ${e}`);
            return false;
        }

    }

    async getTargetChannelInfo(room_id) {
        try {
            if (!this.con) await this.connection();
            const query_result = await this.con.execute('select * from channel_info where room_id = ? and status = ? ', [room_id, 'active']);
            if (query_result[0].length === 0) {
                return false;
            } else {
                return query_result[0][0];
            }
        } catch (e) {
            logger.error( `getTargetChannelInfo: ${e}`);
            return false;
        }
    }

    async checkRoomExist(id) {
        if (!this.con) await this.connection();
        const query_result = await this.con.execute('select * from channel_info where room_id = ? ', [id]);
        return query_result[0][0];
    }

    async createRoomProcess(data) {
        if (!this.con) await this.connection();
        logger.warn('data', data);
        const time = moment().format("YYYY-MM-DD HH:mm:ss");
        logger.warn(time);
        try {
            const query_result = await this.con.execute('insert into channel_info set owner_id = ?, room_title = ?, visitors_limit = ?, description = ?, created_date = ?',
                [data.owner_id, data.title, data['visitors'], data['description'], time]);
            logger.warn(query_result);
            return true;
        } catch(e) {
            logger.error('mysql createRoomProcess ', e);
            throw e;
        }

    }

}

module.exports = MySql


