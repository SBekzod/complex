import axios from "axios";

class SearchUser {

    constructor() {
        $('#ltalk-users .list_container').show()
        $('.search_user .btn_search').click(function () {

            let username = $('#search_val').val();
            if(username !== "") {
                console.log('passed')
                let url = `/l-talk/user-search/${username}`
                axios.get(url).then(data => {
                    let user = data.data
                    let user_list = $('.search_user .user_list')

                    if (user.hasOwnProperty('result') && !user.result) {
                        user_list.html('<p>NO USERS WITH THIS NAME</p>')
                        user_list.show()
                    } else {
                        let str = "<form method='get' action='/l-talk-list'>"
                        str += '<ul class="bd_users"><li class="user_item recommend_user">'
                        str += `<div class="user_name"><input type="text" name="target_id" style="display: none" value="${user['_id']}">`
                        str += `<img class='level' src='${user['avatar']}' alt=''>${user.username}`
                        str += `</div>`
                        str += `<button id="${user['_id']}" class="btn_talk"></button>`
                        str += '</li></ul>'
                        str += "</form>"
                        user_list.html(str)
                        user_list.show()
                    }

                    $('#search_val').val("")
                    console.log(data.data)

                }).catch(err => {
                    console.log(err.message)
                })
            }


        })
    }

}

export default SearchUser