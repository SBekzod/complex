import Search from './modules/search'
import Chat from './modules/chat'
import Ltalk from './ltalk/ltalk'


if (document.getElementById("009")) {
    let search = new Search()
}

if (document.querySelector("#chat-wrapper")) {
    new Chat()
}


if (document.querySelector('#ltalk')) {
    let ltalk = new Ltalk()
    ltalk.checking()


}


// Using JQuery here
$(document).ready(function () {

});