import axios from 'axios'

export default class Search {

  // Select DOM elements
  constructor() {
    this.insertHTML()
    this.overlay = document.querySelector(".search-overlay")
    this.searchInput = document.getElementById("live-search-field")
    this.resultOutput = document.querySelector(".live-search-results")

    this.headerSearchIcon = document.getElementById("009")
    this.closeIcon = document.querySelector(".close-live-search")
    this.loaderIcon = document.querySelector(".circle-loader")
    this.results = document.getElementById("results")

    this.typingWaitTimer
    this.prevValue = ""
    this.data = []

    this.events()
  }


  // Events
  events() {
    this.headerSearchIcon.addEventListener("click", (e) => {
      e.preventDefault()
      this.openOverlay()
    })
    this.closeIcon.addEventListener("click", (e) => {
      e.preventDefault()
      this.closeOverlay()
    })
    this.searchInput.addEventListener('keyup', (e) => {
      this.keyPressedHandler()
    })
  }


  // Methods
  openOverlay() {
    this.overlay.classList.add("search-overlay--visible")
    setTimeout(() => {
      this.searchInput.focus()
    }, 50)
  }

  closeOverlay() {
    this.overlay.classList.remove("search-overlay--visible")
  }

  keyPressedHandler() {

    let value = this.searchInput.value
    if (value != '' && value != this.prevValue) {
      this.results.remove
      // hiding results, and showing Icon loader
      this.resultOutput.classList.remove("live-search-results--visible")
      this.showIconLoader()

      // renewal waiting time
      clearTimeout(this.typingWaitTimer)
      this.prevValue = value
      this.typingWaitTimer = setTimeout(() => this.sendRequset(), 700)
    }

  }

  sendRequset() {
    // console.log(this.searchInput.value)
    axios.post("/search", { searchTerm: this.searchInput.value }).then((resp) => {
      if (resp.data.length) {
        this.data = resp.data
        this.renderResult()
      }

    }).catch((err) => {
      if (err.response.status === 500) {
        alert("Your request for " + this.searchInput.value + " was not fulfilled")
      }
    })

  }

  renderResult() {
    // hiding icon loader, showing results
    this.hideIconLoader()
    this.resultOutput.classList.add("live-search-results--visible")

    this.data.forEach(ele => {
      this.results.insertAdjacentHTML("beforebegin",
        `<a href="#" class="list-group-item list-group-item-action">
            <img class="avatar-tiny" src="${ele.avatar}"> <strong>${ele.title}</strong>
            <span class="text-muted small">by ${ele.username} on ${ele.createdDate} ${ele.createdDate} </span>
          </a>`)
    })

  }

  showIconLoader() {
    this.loaderIcon.classList.add("circle-loader--visible")
  }

  hideIconLoader() {
    this.loaderIcon.classList.remove("circle-loader--visible")
  }

  insertHTML() {
    document.body.insertAdjacentHTML('afterbegin', `<div class="search-overlay">
        <div class="search-overlay-top shadow-sm">
          <div class="container container--narrow">
            <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
            <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
            <span id="tempo" class="close-live-search"><i class="fas fa-times-circle"></i></span>
          </div>
        </div>
    
        <div class="search-overlay-bottom">
          <div class="container container--narrow py-3">
            <div class="circle-loader"></div>
            <div class="live-search-results">
              <div class="list-group shadow-sm">
                <div class="list-group-item active"><strong>Search Results</strong> (4 items found)</div>
                <div id="results"></div>  

              </div>
            </div>
          </div>
        </div>
      </div>`)
  }


}