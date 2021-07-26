import Search from './modules/search'
import Chat from './modules/chat'
import Ltalk from './ltalk/ltalk'
import Graphql_client from "./modules/graphql_client";
import moment from "moment";
import SearchUser from './modules/searchUser'


if (document.getElementById("009")) {
    let search = new Search()
}

if (document.querySelector("#chat-wrapper")) {
    new Chat()
}

if (document.querySelector("#ltalk-users")) {
    let searchUser = new SearchUser()

    // $(document).on('click', '.btn_talk', function (e) {
    //     console.log(e.target.attributes[0].value)
    //     window.location.href("/l-talk")
    //
    // })

}


if (document.querySelector('#ltalk')) {

    let ltalk = new Ltalk()
    ltalk.checking()
    let session_id, mb_id;

    // session_id = 's3od97pt0cg8dv2lotgd854di0'
    // mb_id = 'pwe49bar70955c80e1f2dae4dc748fd69799b419'

    mb_id = $('#ltalk').attr('mb_id')
    session_id = $('#ltalk').attr('mb_id')
    logger.info(`THIS IS MEMBER ID: ${mb_id}`);

    /// -----------
    var gClient = null;
    var channels = [];
    var channelsActive = false;

    var activeChannelId = null;
    var otherId = null;
    var otherNick = null;

    var messages = [];
    var messagesActive = false;

    var messageLastIndex = 0;
    var messageStartAt = 0;
    var messageLimit = 20;
    var messagePage = 1;

    var count_channel_ticket = 1

    var filter_words = [""];
    var isAutoScroll = true;

    $(document).ready(function () {

        if (session_id && mb_id) {
            gClient = new Graphql_client(session_id, mb_id);
            gClient.setLibraryObjects(graphql, Apollo);

            // sending to GraphQL server's context
            // first request, ws subscription and channels update subscription
            gClient.startGraphQl((res) => {
                if (!res.updateChannel) return false;
                if (channelsActive) {
                    checkMessagePopup(res.updateChannel);
                    if (checkRemoveChannel(res.updateChannel)) {
                        $('.btn_list').click();
                    }
                }
                parseChannel(res.updateChannel);
                $('#con_list').text(`대화목록(${channels.length})`);

                if (channelsActive) {
                    $('.ntalk_list').html('');
                    for (let i = 0; i < channels.length; i++) {
                        renderingChannel(channels[i], mb_id);
                    }
                    updateUnReadMessageCount();
                    $('.ntalk_none').hide();
                }
            });

            // CHANNELS LIST
            gClient.getChannels(mb_id).then((datas) => {
                channels = datas;
                if (channels.length > 0) $('.ntalk_list').html('');
                for (let i = 0; i < channels.length; i++) {
                    renderingChannel(channels[i], mb_id);
                }
                $('#con_list').text(`대화목록(${channels.length})`);
                updateUnReadMessageCount();
            });

            setTimeout(() => {
                channelsActive = true;
            }, 2000); // 2초 후부터 메시지 팝업 활성화

            $('.list_container').show()

            // IF THERE IS MB_ID then create the channel and then go to channel
            if ($('#ltalk').attr('target_user') !== "none") {
                gClient.createChannel($('#ltalk').attr('target_user')).then((response) => {
                    if (response && response.createChannel) {
                        setTimeout(() => {
                            goChannel(response.createChannel.channel_id);
                        }, 1000);
                    } else {
                        logger.error('ERROR OCCURRED DURING CREATION');
                        logger.error(response.message);
                        // let message = response.message ? response.message : "";
                        // if (message) sweet_alert(message);
                    }
                });
            }

        } else {
            window.location.href = "/"
        }

        // CHANNEL ENTER
        $(document).on('click', '.go_channel', async function () {
            if (activeChannelId) {
                await gClient.leaveChannel(activeChannelId);
                initActiveChannel();
                return false;
            }
            activeChannelId = $(this).attr('id')
            goChannel(activeChannelId);
        });

        // CHANNEL LEAVE
        $('.btn_list').click(async () => {
            if (activeChannelId) {
                await gClient.leaveChannel(activeChannelId);
                initActiveChannel();
            }
            if ($('.setting_area').hasClass('open')) $('.setting_area').toggleClass('open');
        });

        // CHANNEL DELETE
        $('.btn_delete_channel').click(async () => {
            if (activeChannelId) await deleteChannel(activeChannelId);
        })

        // MESSAGE SEND
        $('#ntalk_input_text').keypress(function (e) {
            if (e.which === 13 && typeof (activeChannelId) !== 'undefined') {
                let message = $('#ntalk_input_text').val();
                if (message.length === 0) return false;
                if (message.length > 1000) {
                    logger.warn('메시지는 최대 1,000자 까지 보낼 수 있습니다.');
                    return false;
                }

                var lower = message.toLowerCase();
                // add message filters here
                gClient.sendMessage(activeChannelId, message).then((data) => {
                    if (data) $('#ntalk_input_text').val("");
                }).catch(err => {
                    logger.error(err);
                });
            }
        });

        // open configuration
        $('.btn_setup').click(function () {
            $('.setting_area').toggleClass('open');
        })
    });


    // MESSAGES read more
    $(document).on('click', '.load_more', () => {
        if (messageStartAt === 0) return false;
        const messageStartAtBefore = messageStartAt;
        messagePage++;
        messageStartAt = messageLastIndex - messageLimit * messagePage;
        if (messageStartAt < 0) messageStartAt = 0;

        for (let i = 0; i < messages.length; i++) {
            if (messages[i]) {
                if (parseInt(messages[i].index) >= messageStartAt && parseInt(messages[i].index) < messageStartAtBefore) {
                    renderingMessageMore(messages[i], mb_id);
                }
            }
        }
        let str = `<div class="load_more" startat="${messageStartAt}">이전 대화내용 더보기</div>`;
        $('.ntalk_wrap').prepend(str);
    });

    // go to the user feed
    $(document).on('click', '.go_user', function () {
        const mb_id = $(this).attr('mbid');
        // go to user feed
        // if (parent) parent.location.href = "/user/home.php?mb_id=" + mb_id;
    });

    async function goChannel(channel_id) {
        activeChannelId = channel_id;

        // 메시지 리스트 subscription 시작 !!
        gClient.enterChannel(channel_id, (res) => {
            if (!res.updateMessage) return false;
            parseMessage(res.updateMessage);
            logger.error(res)
            if (messagesActive) renderingMessage(res.updateMessage, mb_id);

            const chat = document.querySelector('.ntalk_wrap');
            isAutoScroll = chat.scrollTop - (chat.scrollHeight - 530 - 80) > 0 ? true : false;
            if (isAutoScroll) chat.scrollTop = chat.scrollHeight;
        });

        gClient.getMessages(channel_id).then((datas) => {
            messages = datas;
            for (let i = 0; i < datas.length; i++) {
                logger.warn('msg')
                if (datas[i].index - messageLastIndex > 0) messageLastIndex = datas[i].index;
            }
        });

        let channel = await gClient.setUserActive("Y", channel_id);
        if (channel) {
            //console.log(channel);
            let countUsedTicket = 0;
            if (channel.users[0].mb_id === mb_id) {
                countUsedTicket = channel.users[0].count_channel_ticket;
                otherId = channel.users[1] ? channel.users[1].mb_id : "";
                otherNick = channel.users[1] ? channel.users[1].mb_nick : "";
            } else {
                countUsedTicket = channel.users[1].count_channel_ticket;
                otherId = channel.users[0] ? channel.users[0].mb_id : "";
                otherNick = channel.users[0] ? channel.users[0].mb_nick : "";
            }

            let str = `
                    <div class="load_more">이전 대화내용 더보기</div>
                    <div class="guide">
                        Welcome to our chat<br/>
                        We are happy to have you here.<br/>
                        The logged user can make 1x1 Chat<br/>
                        GOOD LUCK.<br/>
                        <?= $memberNick ?>님의 <a href="#" class="go_ntalk_notice">톡 신청 제한 횟수</a>는 <b class="count_used_ticket">${countUsedTicket}</b>/${count_channel_ticket}회입니다.
                    </div>
                `;
            if (countUsedTicket >= count_channel_ticket) {
                str += `
                        <div class="talk_clear">
                            <a class="lnk_clear by_point" href="javascript:;">clear using 30 000 points</a>
                            <a class="lnk_clear by_star" href="javascript:;">clear using 300 starts</a>
                        </div>
                    `;
            }
            $('.ntalk_wrap').html(str);

            $('.list_container').hide();
            $('.view_container').show();
            $('.div_other_user').text(otherNick);

            setTimeout(() => {
                messagesActive = true;
                messageStartAt = messageLastIndex - messageLimit * messagePage;
                if (messageStartAt < 0) messageStartAt = 0;
                for (let i = messages.length - 1; i >= 0; i--) {
                    //console.log(messages[i]);
                    if (messages[i] && messages[i].index - messageStartAt >= 0) renderingMessage(messages[i]);
                }

                if (isAutoScroll) {
                    const chat = document.querySelector('.ntalk_wrap');
                    chat.scrollTop = chat.scrollHeight;
                }
            }, 2000); // two seconds
        } else {
            logger.warn("엔톡방 입장에 실패 하였습니다.");
            initActiveChannel();
        }
    }

    function initActiveChannel() {
        activeChannelId = null;
        otherId = null;
        otherNick = null;

        messages = [];
        messagesActive = false;
        messageLastIndex = 0;
        messageStartAt = 0;

        $('.list_container').show();
        $('.view_container').hide();
        $('.div_other_user').text('');
        $('.ntalk_wrap').html('');

        if ($('.setting_area').hasClass('open')) $('.setting_area').toggleClass('open');
    }

    async function deleteChannel(channel_id) {
        await gClient.leaveChannel(channel_id);
        await gClient.deleteChannel(channel_id);
        initActiveChannel();
    }


}


// -----------------------  //  ------------  OTHERS  -------------  //  -----------------------  //


function parseChannel(channel) {

    if (channel.type === "added") {
        if (channel.is_active === "Y") {
            logger.info('added ---------------------------------------');
            if (!channels.find((item) => item.channel_id === channel.channel_id)) {
                channels.unshift(channel);
            }
        } else {
            logger.info('removed ---------------------------------------');
            const channels_final = channels.filter(({channel_id}) => {
                return channel_id !== channel.channel_id;
            });
            channels = Object.assign([], channels_final);
        }
    }
    if (channel.type === "modified") {
        if (channel.is_active === "Y") {
            logger.info('modified ---------------------------------------');
            const channels_final = channels.filter(({channel_id}) => {
                return channel_id !== channel.channel_id;
            });
            channels = Object.assign([], [channel, ...channels_final]);
        } else {
            logger.info('removed ---------------------------------------');
            const channels_final = channels.filter(({channel_id}) => {
                return channel_id !== channel.channel_id;
            });
            channels = Object.assign([], channels_final);
        }
    }

    if (channels.length > 100) channels.pop();
}

function renderingChannel(data, mb_id) {
    let channel = data;
    let otherUser = channel['users'][0];
    let myUnReadMessages = gettingUnreadMessagesCount(channel, true);
    let yourUnReadMessages = gettingUnreadMessagesCount(channel, false);

    let str = "";
    str += `<div class="list_item" id="${channel['channel_id']}" other_nick="${otherUser.mb_nick}" otherId="${otherUser.mb_id}">`;

    // inserting last message and the other user nick name
    let last_message = "";
    if (channel.hasOwnProperty('messages') && channel['messages'].length > 0) {
        last_message = channel['messages'][0].content;
    } else {
        last_message = "등록된 메시지가 없습니다.";
    }
    str += `<div class="msg">
                <div class="user_name">
                    <img class="level" src="/img/level/50x50/${otherUser.mb_level}.png" />
                    <p class="go_user" mbid="${otherUser.mb_id}">${otherUser.mb_nick}</p>
                    <img class="add_black btn_add_blacklist" 
                        mbid="${otherUser.mb_id}" 
                        mbnick="${otherUser.mb_nick}"
                        channelid="${channel.channel_id}" 
                        src="/img/chat/ico_block.svg" />
                </div>
                <span class="go_channel" id="${channel['channel_id']}">${last_message}</span>`;

    // forming the time details of the other user
    let lastCheckedPeriod = formingLastCheckedPeriod(channel, mb_id);
    if (yourUnReadMessages > 0) {
        str += `</div><div class="info"><p>읽지 않음 ${yourUnReadMessages} / ${lastCheckedPeriod}</p>`;
    } else {
        str += `</div><div class="info"><p>${lastCheckedPeriod}</p>`;
    }

    // forming unread messages of the currently logged user
    str += '<div class="badge_wrap">';
    myUnReadMessages !== 0 ? str += `<span class="cnt_badge">${myUnReadMessages}</span>` : "";
    str += '</div></div></div>';

    $('.ntalk_list').append(str);
}

// messages 배열 업데이트
function parseMessage(message) {
    //message.date_created = changeDate(message.date_created);

    if (message.type === "added") {
        console.log('added ---------------------------------------');
        if (!messages.find((item) => item.index === message.index)) {
            messages.unshift(message);
        }
        messageLastIndex = message.index;
    }
    if (message.type === "modified") {
        console.log('modified ---------------------------------------');
        const messages_final = messages.filter(({index}) => {
            return index !== message.index;
        });
        messages = Object.assign([], [message, ...messages_final]);
    }
    if (messages.length > 1000) messages.pop();
}

function renderingMessage(message, mb_id) {
    let str;
    if (mb_id === message.mb_id) str = preparingMyMessages(message);
    else str = preparingOtherMessages(message, otherNick);

    $('.ntalk_wrap').append(str);
}

function renderingMessageMore(message, mb_id) {
    //console.log(message);
    let str;
    if (mb_id === message.mb_id) str = preparingMyMessages(message);
    else str = preparingOtherMessages(message, otherNick);

    $('.ntalk_wrap').prepend(str);
}

// 안 읽은 메시지 카운트 업데이트
function updateUnReadMessageCount() {
    let unReadMessageCount = 0;
    for (let i = 0; i < channels.length; i++) {
        unReadMessageCount += gettingUnreadMessagesCount(channels[i], true);
    }
    unReadMessageCount = (unReadMessageCount > 99) ? '99+' : unReadMessageCount;

    if (typeof parent.updateNTalkUnReadMessageCount !== 'function') return false;
    parent.updateNTalkUnReadMessageCount(unReadMessageCount);

    $ce = $('#talk_msg_count');
    if ($ce && $ce.length > 0) {
        if (unReadMessageCount > 0) {
            $ce.show().find('.count').text(unReadMessageCount);
            $('.talk_msg_count').show().find('.count').text(unReadMessageCount);
        } else {
            $ce.hide();
        }
    }
}

// 메시지 팝업을 띄워야 하는지 체크
function checkMessagePopup(channel) {
    // if (getCookie("isAlarmActive") === "N") return false;
    if (channel && channel.channel_id === activeChannelId) return false;

    if (channel.type === "added" && channel.messages && channel.messages[0]) {
        if (typeof parent.notifyNewTalkMessageAtFrameTop !== 'function') return false;
        console.log('added =========');

        if (channel.messages[0].mb_id !== mb_id) {
            parent.notifyNewTalkMessageAtFrameTop(
                channel.channel_id,
                channel.invitees_mb_id,
                channel.users[0].mb_level,
                channel.users[0].mb_nick,
                "",
                channel.messages[0].content
            );
        }
    }
    if (channel.type === "modified") {
        //console.log(channel);
        const findChannel = channels.find(item => item.channel_id === channel.channel_id);
        if (findChannel && findChannel.message_index >= channel.message_index) return false;
        if (typeof parent.notifyNewTalkMessageAtFrameTop !== 'function') return false;
        console.log('modified =========');

        if (channel.messages[0].mb_id !== mb_id) {
            parent.notifyNewTalkMessageAtFrameTop(
                channel.channel_id,
                channel.invitees_mb_id,
                channel.users[0].mb_level,
                channel.users[0].mb_nick,
                "",
                channel.messages[0].content
            );
        }
    }
}

// 입장 중인 방이 삭제 되었는지 체크
function checkRemoveChannel(channel) {
    if (channel && channel.channel_id === activeChannelId) {
        if (channel.type === "modified" && channel.is_active === "N") {
            console.log('removed =========');
            return true;
        } else {
            return false;
        }
    }
}

// getting unread messages for both channel users
function gettingUnreadMessagesCount(channel, isMine) {
    let message_count = channel['message_index'],
        otherId = channel['users'][0].mb_id, lastChecked;
    if (isMine) {
        otherId !== channel['invitees_mb_id'] ? lastChecked = channel['invitees_last_message_index'] : lastChecked = channel['opener_last_message_index'];
    } else {
        otherId === channel['invitees_mb_id'] ? lastChecked = channel['invitees_last_message_index'] : lastChecked = channel['opener_last_message_index'];
    }

    return (message_count - lastChecked);
}

// preparing message of the logged user
function preparingMyMessages(msg) {
    let time = moment.utc(parseInt(msg['date_created'])).local().format('hh:mm A');
    let list = time.split(" ");
    list[1] === "PM" ? time = `오후 ${list[0]}` : time = `오전 ${list[0]}`;

    let str = "";
    str += '<div class="msg mine">';
    str += `<span class="date">${time}</span>`;
    str += `<p>${msg['content']}</p></div>`;

    return str;
}

// preparing view of other user
function preparingOtherMessages(msg, nick) {
    let time = moment.utc(parseInt(msg['date_created'])).local().format('hh:mm A');
    let list = time.split(" ");
    list[1] === "PM" ? time = `오후 ${list[0]}` : time = `오전 ${list[0]}`;

    let str = "";
    str += '<div class="msg_wrap"><div class="user_name">';
    str += `<img class="level" src="/img/level/50x50/1.png" alt=""><p>${nick}</p>`;
    str += '</div><div class="msg yours">';
    str += `<p>${msg['content']}</p><span class="date">${time}</span>`;
    str += '</div></div>';

    return str;
}

// getting last checked time of other user of the channel
function formingLastCheckedPeriod(channel, mb_id) {
    let lastCheckedTime;
    let current = moment.utc();
    let diff_period;
    if (mb_id === channel['invitees_mb_id']) lastCheckedTime = channel['opener_last_message_date'];
    else lastCheckedTime = channel['invitees_last_message_date'];
    lastCheckedTime = moment.utc(parseInt(lastCheckedTime));

    diff_period = current.diff(lastCheckedTime, 'days');
    if (diff_period > 0) {
        return `${diff_period}일전`;
    } else if (current.diff(lastCheckedTime, 'hours') > 0) {
        diff_period = current.diff(lastCheckedTime, 'hours');
        return `${diff_period}시간전`;
    } else if (current.diff(lastCheckedTime, 'minutes') >= 0) {
        diff_period = current.diff(lastCheckedTime, 'minutes');
        return `${diff_period + 1}분전`;
    } else {
        return "";
    }
}

// setting cookie
function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

// getting cookies
// function getCookie(name) {
//     let nameOfCookie = name + "=";
//     let x = 0;
//     while (x <= document.cookie.length) {
//         let y = (x + nameOfCookie.length);
//         if (document.cookie.substring(x, y) == nameOfCookie) {
//             if ((endOfCookie = document.cookie.indexOf(";", y)) == -1)
//                 endOfCookie = document.cookie.length;
//             return unescape(document.cookie.substring(y, endOfCookie));
//         }
//         x = document.cookie.indexOf(" ", x) + 1;
//         if (x == 0) break;
//     }
//
//     return "";
// }

// 날짜 데이터 포멧 변경
function changeDate(timestamp) {
    let date = new Date(parseInt(timestamp));
    let year = date.getFullYear().toString().slice(-2); //년도 뒤에 두자리
    let month = ("0" + (date.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
    let day = ("0" + date.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)
    let hour = ("0" + date.getHours()).slice(-2); //시 2자리 (00, 01 ... 23)
    let minute = ("0" + date.getMinutes()).slice(-2); //분 2자리 (00, 01 ... 59)
    let second = ("0" + date.getSeconds()).slice(-2); //초 2자리 (00, 01 ... 59)
    let returnDate = year + "." + month + "." + day + " " + hour + ":" + minute + ":" + second;

    return returnDate;
}

// 팝업창 열기
function open_popup(url, win_name, width, height) {
    var popup_option = 'width=' + width + ', height=' + height + ', top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbars=no';
    var popup = window.open(url, win_name, popup_option);
    if (popup === null) {
        alert('차단된 팝업창을 허용해 주세요.');
        return false;
    }
}

// getting result from the search
function searchResult(mb_id) {
    let nick = $('#search_val').val();
    let sfMemberId = mb_id;

    if (!sfMemberId) {
        $('#search_val').val('');
        alert('로그인 후 이용할 수 있습니다.');
        return false;
    } else if (!nick) {
        alert('닉네임을 입력해 주세요.');
        $('#search_val').focus();
        return false;
    }

    // 로그인 관련 처리는 각 페이지
    $.post('/ajax/ntalk_user_find.ajax.php', {
        nick_name: nick,
        target: '_parent',
    }, function (res) {
        let message = "";
        if (!res || res == "") {
            message = '<li class="none">검색한 닉네임의 회원은 존재하지 않습니다.</li>';
            $('.user_list .bd_users').html(message);
            //console.log(message);
        } else {
            $('.user_list .bd_users').html(res);
            console.log(res);
        }
    }, 'html');

    return false;
}
