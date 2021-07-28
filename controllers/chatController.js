const chatController = module.exports;
const Chat = require('../models_chat/Chat');


chatController.channelList = async function (req, res) {
    try {
        const chat = new Chat();
        let channel_list = await chat.getActiveChannels();
        res.render('chat/chat-list', {channel_list: channel_list ? channel_list : []});
    } catch (e) {
        logger.error(`channelList:  ${e}`);
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
        logger.error(`enterRoom: ${e}`);
    }
}

chatController.createRoom = function (req, res) {
    logger.warn('params', req.params);
    res.render('chat/create-room', {owner_id: req.params['id']});
}

chatController.createRoomProcess = async function (req, res) {
    try{
        logger.warn('req.body', req.body);
        const chat = new Chat();
        await chat.createRoomProcess(req.body);
        res.end('<div><script>alert("chat room created"); window.close();</script></div>')
    } catch(e) {
        res.send('error');
    }

}

chatController.createVerifiedDataOnCookies = function (req, res, next) {
    res.cookie('verified_data', req.session.user, {httpOnly: true});
    next();
}
