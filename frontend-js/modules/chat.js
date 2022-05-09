import sanitizeHTML from 'sanitize-html';
import DOMPurify from 'dompurify';

class Chat {

    constructor() {
        this.openedChat = false;
        this.chatWrapper = document.querySelector('#chat-wrapper');
        this.openIcon = document.querySelector('#open007');
        this.injectHTML();
        this.closeIcon = document.querySelector('.chat-title-bar-close');
        this.chatForm = document.querySelector('#chatForm');
        this.chatField = document.querySelector('#chatField');
        this.chatLog = document.querySelector('#chat');
        // events happen when user makes actions
        this.events();
    }

    // method events
    events() {
        this.openIcon.addEventListener('click', () => {
            this.showChat();
        })
        this.closeIcon.addEventListener('click', () => {
            this.chatWrapper.classList.remove('chat--visible');
        })
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitToChat();
        })
    }


    injectHTML() {
        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
        <div id="chat" class="chat-log"></div>
        
        <form id="chatForm" class="chat-form border-top">
          <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>
        `
    }

    showChat() {
        if (!this.openedChat) {
            this.openConnection();
        }
        this.openedChat = true;
        this.chatWrapper.classList.add('chat--visible');
        $('#chat-wrapper').show();

    }

    submitToChat() {
        let inputText = sanitizeHTML(this.chatField.value, {allowedTags: [], allowedAttributes: {}});
        this.socket.emit('createMsg', {message: inputText, sender_name: this.socket_username});
        this.chatField.value = '';
        this.chatField.focus();
    }

    renderOthersMessage(data) {
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
            <!-- template for messages from others -->
            <div class="chat-other">
                <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
                <div class="chat-message"><div class="chat-message-inner">
                  <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
                  ${data.message}
                </div></div>
            </div>
            <!-- end template-->
        `))

        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    renderOwnMessage(inputText) {
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
          <!-- template for your own message -->
          <div class="chat-self">
            <div class="chat-message">
              <div class="chat-message-inner">
                ${inputText}
              </div>
            </div>
            <img class="chat-avatar avatar-tiny" src="${this.socket_avatar}">
          </div>
          <!-- end template-->
        `))

        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    userGreetings() {
        this.chatLog.insertAdjacentHTML('beforeend', `<p>welcome ${this.socket_username}</p>`);
    }

    newUserInfo() {
        this.chatLog.insertAdjacentHTML("beforeend", `<p class="newUser">new user ${this.socket_newUser} joined</p>`);
    }

    openConnection() {
        // this.socket = io('http://localhost:5003', {transports: ['websocket', 'xhr-polling']});
        this.socket = io('http://45.13.132.208:5003', {transports: ['websocket', 'xhr-polling']});

        console.log('Started');
        console.log('Socket: ', this.socket);

        // receiving server's message called welcome and getting session data via socket connection
        this.socket.on('welcome', (data) => {
            console.log('welcome arrived');
            this.socket_username = data.username;
            this.socket_avatar = data.avatar;
            this.userGreetings();
        })

        // receiving server's new user joined message
        this.socket.on('newUserJoined', (data) => {
            this.socket_newUser = data.joinedUser;
            this.newUserInfo();
        })

        // receiving server's message called sentByServer
        this.socket.on('newMsg', (data) => {
            console.log('newMsg:', data);
            if (this.socket_username !== data.username) {
                this.renderOthersMessage(data);
            } else {
                this.renderOwnMessage(data.message);
            }
        })

    }

}

export default Chat;
