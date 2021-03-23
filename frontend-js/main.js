import Search from './modules/search'
import Chat from './modules/chat'
import Ltalk from './ltalk/ltalk'
import Graphql_client from './modules/graphql_client'


if (document.getElementById("009")) {
    let search = new Search()
}

if (document.querySelector("#chat-wrapper")) {
    new Chat()
}


if (document.querySelector('#ltalk')) {
    let ltalk = new Ltalk()
    ltalk.checking()

    let ntalk_notis_active = false;
    setTimeout(() => { ntalk_notis_active = true; }, 5000);

    let session_id = 's3od97pt0cg8dv2lotgd854di0'
    let mb_id = 'pwe49bar70955c80e1f2dae4dc748fd69799b419'
    const gClient = new Graphql_client(session_id, mb_id);
    gClient.setLibraryObjects(graphql, Apollo);
    let channel_list = [], count = 0;

    gClient.startGraphQl(data => {
        $('.ntalk_list .ntalk_none').hide();
        let str = "";
        console.log(data);

        if (data.hasOwnProperty('updateChannel') && data['updateChannel'].hasOwnProperty('channel_id')) {
            console.log(data['updateChannel'])
            let channel = data['updateChannel'], otherUser = channel['users'][0],
                myUnReadMessages = ltalk.gettingUnreadMessagesCount(channel, true),
                yourUnReadMessages = ltalk.gettingUnreadMessagesCount(channel, false);
            str += `<div class="list_item" id="${channel['channel_id']}" other_nick="${otherUser.mb_nick}" otherId="${otherUser.mb_id}">`
            str += '<img src="http://kate.ntry.com/data/profile/ma/manager_chadd.jpg" alt="">'

            // inserting last message and the other user nick name
            if (channel.hasOwnProperty('messages') && channel['messages'].length > 0) {
                let last_message = channel['messages'][0].content;
                str += `<div class="msg"><p>${otherUser.mb_nick}</p><span>${last_message}</span>`
            } else {
                str += `<div class="msg"><p>${otherUser.mb_nick}</p>`;
            }

            // forming the time details of the other user
            let lastCheckedPeriod = ltalk.formingLastCheckedPeriod(channel, mb_id);
            if (yourUnReadMessages > 0) {
                str += `</div><div class="info"><p>읽지 않음 ${yourUnReadMessages} / ${lastCheckedPeriod}</p>`;
            } else {
                str += `</div><div class="info"><p>${lastCheckedPeriod}</p>`;
            }

            // forming unread messages of the currently logged user
            str += '<div class="badge_wrap">';
            myUnReadMessages !== 0 ? str += `<span class="cnt_badge">${myUnReadMessages}</span>` : "";
            str += '</div></div></div>';
        }

        let searchResult = channel_list.find(ele => ele === data['updateChannel'].channel_id)
        if (typeof (searchResult) === 'undefined') {
            channel_list.push(data['updateChannel'].channel_id);
            count++;
            $('.ntalk_list').prepend(str);
        } else {
            $(`#${data['updateChannel'].channel_id}`).replaceWith(str);
        }
        $('#con_list').text(`대화목록(${count})`);



    })

    $('.btn_setup').click(function () {
        $('.setting_area').toggleClass('open');
    })


    // opening nTalk channel
    let channel_id, other_nick, otherId;
    $(document).on('click', '.ntalk_list .list_item', function (data) {
        channel_id = data.currentTarget.attributes[1].nodeValue;
        other_nick = data.currentTarget.attributes[2].nodeValue;
        otherId = data.currentTarget.attributes[3].nodeValue;
        $('#dialog').text(`${other_nick}님과의 대화`);

        gClient.enterChannel(channel_id, data => {
            let msg = data;
            $('.ntalk_list').hide();
            $('.view_container').show();
            if (msg.hasOwnProperty('updateMessage')) {
                msg = msg['updateMessage'];
                let str;
                if (mb_id === msg.mb_id) str = preparingMyMessages(msg);
                else str = preparingOtherMessages(msg, other_nick);
                $('.ntalk_wrap').append(str);
                const chat = document.querySelector('.ntalk_wrap')
                chat.scrollTop = chat.scrollHeight
            }
        })

    });

    // sending messages
    $('#ntalk_input_text').keypress(function (e) {
        if (e.which === 13 && typeof (channel_id) !== 'undefined') {
            let message = $('#ntalk_input_text').val()
            gClient.sendMessage(channel_id, message).then(data => {
                if (data) {
                    console.log("Msg was created");
                    $('#ntalk_input_text').val("");
                }
            }).catch(err => {
                console.log(err);
            })
        }
    });

    // deleting the channel or getting rid of it
    $('.setup .btn_delete').click(() => {
        if (confirm(`Do you really want to delete channel ${channel_id}`)) {
            gClient.leaveChannel(channel_id);
            gClient.deleteChannel(channel_id);
            location.reload();
        }
    })

    // Putting on black list
    $('.setup .btn_blacklist').click(() => {
        if (confirm(`Do you really want to add ${other_nick} into blacklist`)) {
            console.log(otherId);
            gClient.addBlacklist(otherId).then(result => {
                if (result) alert(`user ${other_nick} was added to black list`)
            }).catch(err => console.log(err));
        }
    })

    // reporting the user
    $('.setup .btn_report').click(() => {
        open_popup('/helpdesk/report.popup.php?type=nTalk&channel=' + channel_id + '&id=' + otherId, 'report', '383', '455');
    })

}


// // Using JQuery here
// $(document).ready(function () {
//
// });