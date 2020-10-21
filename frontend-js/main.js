import Search from './modules/search'
import Chat from './modules/chat'

if (document.getElementById("009")) {
    let search = new Search()
}

if(document.querySelector("#chat-wrapper")) {
    new Chat()
}

// Using JQuery and Axios here
// $(document).ready(function(){
//     $("#009").click(function(){
//           alert('You clicked');
//     });
// });