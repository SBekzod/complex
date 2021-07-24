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
            console.log('room data: ', data);
            if(data) return data;
            else return false;
        } catch (e) {
            // never reaches here
            return false;
        }
    }
}

module.exports = Chat;