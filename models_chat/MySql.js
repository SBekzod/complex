const mysql = require('mysql2/promise');

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

}

module.exports = MySql


