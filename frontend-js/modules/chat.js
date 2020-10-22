class Chat {

    constructor() {
        this.openedChat = false
        this.chatWrapper = document.querySelector('#chat-wrapper')
        this.openIcon = document.querySelector('#open007')
        this.injectHTML()
        this.closeIcon = document.querySelector('.chat-title-bar-close')
        // handling with user typing in forms
        this.chatForm = document.querySelector('#chatForm')
        this.chatField = document.querySelector('#chatField')
        this.chatLog = document.querySelector('#chat')
        this.socket = ''
        this.events()
    }

    // events
    events() {
        this.openIcon.addEventListener('click', () => {
            this.showChat()
        })
        this.closeIcon.addEventListener('click', () => {
            this.chatWrapper.classList.remove('chat--visible')
        })
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault()
            this.submitToChat()
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
            this.openConnection()
        }
        this.openedChat = true
        this.chatWrapper.classList.add('chat--visible')
    }

    submitToChat() {
        let inputText = this.chatField.value
        this.socket.emit('sentMessageByBrowser', {message: inputText})
        this.chatField.value = ''
        this.chatField.focus()
    }

    renderOthersMessage(data) {
        this.chatLog.insertAdjacentHTML('beforeend', `
        <!-- template for messages from others -->
        <div class="chat-other">
            <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
            <div class="chat-message"><div class="chat-message-inner">
              <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
              ${data.message}
            </div></div>
        </div>
      <!-- end template-->
        `)
    }

    renderOwnMessage(data) {
        this.chatLog.insertAdjacentHTML('beforeend', `
        <!-- template for your own message -->
          <div class="chat-self">
            <div class="chat-message">
              <div class="chat-message-inner">
                ${data.message}
              </div>
            </div>
            <img class="chat-avatar avatar-tiny" src="${data.avatar}">
          </div>
          <!-- end template-->
        `)
    }

    openConnection() {
        this.socket = io()

        this.socket.on('sentByServer', (data) => {

            // checking whether author is user
            let sender = this.chatWrapper.getAttribute('username')
            console.log(sender)
            if(sender == data.username) this.renderOwnMessage(data)
            else this.renderOthersMessage(data)

        })

    }


}

export default Chat