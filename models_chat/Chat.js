const MySql = require('./MySql');

class Chat {
    constructor() {
        this.db = new MySql();
    }

    async getActiveChannels() {
        try {
            let data = await this.db.getActiveChatRooms();
            if (data) return data;
            else return false;
        } catch (e) {
            // never reaches here
            return false;
        }
    }

    async getTargetChannelInfo(room_id) {
        try {
            let data = await this.db.getTargetChannelInfo(room_id);
            logger.warn('room data', data);
            if(data) return data;
            else return false;
        } catch (e) {
            // never reaches here
            return false;
        }
    }

    async createRoomProcess(data) {
        try {
            return await this.db.createRoomProcess(data);
        } catch(e) {
            logger.error('Chat model createRoomProcess', e);
            throw e;
        }
    }

}

module.exports = Chat;