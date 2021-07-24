const chatController = module.exports;
const Chat = require('../models_chat/Chat');

chatController.channelList = async function (req, res) {
    try {
        const chat = new Chat();
        let channel_list = await chat.getActiveChannels();
        res.render('chat/chat-list', {channel_list: channel_list ? channel_list : []});
    } catch (e) {
        console.log('ERROR, channelList: ', e);
    }
}

chatController.enterRoom = async function (req, res) {
    try {
        const room_id = req.query['room_id'];
        const chat = new Chat();
        let channel_info = await chat.getTargetChannelInfo(room_id);
        if (channel_info) {
            res.render('chat/chat-room', {channel_info: channel_info});
        } else {
            res.redirect('/l-chat/list');
        }
    } catch (e) {
        console.log('ERROR, enterRoom: ', e);
    }
}