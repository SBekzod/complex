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
        // this.socket = ''
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
        let username = this.chatWrapper.getAttribute('username')
        this.socket.emit('sentMessageByBrowser', {message: inputText, username: username})
        this.chatField.value = ''
        this.chatField.focus()
    }

    renderTheMessage(data) {
        this.chatLog.insertAdjacentHTML('beforeend', `<p>${data.username}` + ": " + `${data.messageBack}</p>`)
    }

    openConnection() {
        this.socket = io()

        this.socket.on('sentByServer', (data) => {
            this.renderTheMessage(data)
        })
        // alert('connection from browser to server on process!')
    }


}

export default Chat