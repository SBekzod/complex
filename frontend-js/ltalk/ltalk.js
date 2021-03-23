import moment from 'moment'

class Ltalk {

    // getting unread messages for both channel users
    gettingUnreadMessagesCount(channel, isMine) {
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
    preparingMyMessages(msg) {
        let time = moment.utc(parseInt(msg['date_created'])).local().format('hh:mm A'),
            list = time.split(" ");
        list[1] === "PM" ? time = `오후 ${list[0]}` : time = `오전 ${list[0]}`
        let str = "";
        str += '<div class="msg mine">';
        str += `<span class="date">${time}</span>`;
        str += `<p>${msg['content']}</p></div>`;
        return str;
    }

    // preparing view of other user
    preparingOtherMessages(msg, nick) {

        let time = moment.utc(parseInt(msg['date_created'])).local().format('hh:mm A'),
            list = time.split(" ");
        list[1] === "PM" ? time = `오후 ${list[0]}` : time = `오전 ${list[0]}`;
        let str = "";
        str += '<div class="msg_wrap"><div class="user_name">';
        str += `<img class="level" src="/public/img/level/50x50/1.png" alt=""><p>${nick}</p>`;
        str += '</div><div class="msg yours">';
        str += `<p>${msg['content']}</p><span class="date">${time}</span>`;
        str += '</div></div>';
        return str;
    }

    // getting last checked time of other user of the channel
    formingLastCheckedPeriod(channel, mb_id) {

        let lastCheckedTime, current = moment.utc(), diff_period;
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
        } else return "";
    }

    // getting cookies
    getCookie(name) {

        let nameOfCookie = name + "=";
        let x = 0;
        while (x <= document.cookie.length) {
            let y = (x + nameOfCookie.length);
            if (document.cookie.substring(x, y) == nameOfCookie) {
                if ((endOfCookie = document.cookie.indexOf(";", y)) == -1)
                    endOfCookie = document.cookie.length;
                return unescape(document.cookie.substring(y, endOfCookie));
            }
            x = document.cookie.indexOf(" ", x) + 1;
            if (x == 0)
                break;
        }
        return "";
    }

    // 팝업창 열기
    open_popup(url, win_name, width, height) {
        var popup_option = 'width=' + width + ', height=' + height + ', top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbars=no';
        var popup = window.open(url, win_name, popup_option);
        if (popup === null) {
            alert('차단된 팝업창을 허용해 주세요.');
            return false;
        }
    }

    // getting result from the search
    searchResult(mb_id) {
        let nick = $('#search_val').val(),
            sfMemberId = mb_id;
        console.log('NICKNAME: ', nick)

        if (!sfMemberId) {
            $('#search_val').val('');
            alert('로그인 이후 이용할 수 있습니다.');
            return false;
        } else if (!nick) {
            alert('닉네임을 입력해 주세요.');
            $('#search_val').focus();
            return false;
        }

        // 로그인 관련 처리는 각 페이지에서
        $.post('/ajax/ntalk_user_find.ajax.php', {
            nick_name: nick,
            target: '_parent',
        }, function (res) {
            let message = '';
            if (!res || res == "") {
                message = '<li class="none">검색한 닉네임의 회원은 존재하지 않습니다.</li>'
                $('.user_list .bd_users').html(message);
                console.log(message)
            } else {
                $('.user_list .bd_users').html(res);
                console.log(res)
            }
        }, 'html');

        return false;
    }

    // checking function
    checking() {
        console.log(`The checking function is executed at ${moment.utc().format()}`)
    }

}

export default Ltalk
