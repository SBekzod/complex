const chatController = module.exports;

chatController.channelList = function (req, res) {
    res.render('chat/chat-list');
}

chatController.enterRoom = function (req, res) {
    const channel_info = req.query;
    //TODO: CHECKING CHANNELS' EXISTENCE AND PERMISSION ON MY-DB
    res.render('chat/chat-room', {channel_info: channel_info});
}