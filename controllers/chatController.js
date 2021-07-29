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
        channel_info.room_title = channel_info.room_title.toUpperCase();
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
    res.render('chat/create-room', {owner_id: req.params['id'], result: null});
}

chatController.createRoomProcess = async function (req, res) {
    try{
        logger.warn('createRoomProcess: req.body', req.body);
        const chat = new Chat();
        let room_created = await chat.createRoomProcess(req.body);
        logger.warn('room_id on ctrl: ', room_created);
        let room_url = `/l-chat/room?room_id=${room_created['insertId']}`;
        res.end(`<div>
                    <script>
                        if(window.confirm("Room created, do you want to log into it?")) {
                            window.opener.location.href='${room_url}'
                        } else {
                            window.opener.location.reload(true)
                        }
                    window.close();
                    </script>
                </div>`);
    } catch(e) {
        res.end(`<div>
                    <script>alert('error occurred'); window.close()</script>
                </div>`);;
    }

}

chatController.createVerifiedDataOnCookies = function (req, res, next) {
    res.cookie('verified_data', req.session.user, {httpOnly: true});
    next();
}
