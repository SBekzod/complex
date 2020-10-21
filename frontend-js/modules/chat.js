class Chat {

    constructor() {
        this.chatWrapper = document.querySelector('#chat-wrapper')
        this.openIcon = document.querySelector('#open007')
        this.injectHTML()
        this.closeIcon = document.querySelector('.chat-title-bar-close')
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
        this.chatWrapper.classList.add('chat--visible')
    }


}

export default Chat