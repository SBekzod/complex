import axios from 'axios'

export default class Search {

  // Select DOM elements
  constructor() {
    this.insertHTML()
    this.overlay = document.querySelector(".search-overlay")
    this.searchInput = document.getElementById("live-search-field")

    this.headerSearchIcon = document.getElementById("009")
    this.closeIcon = document.querySelector(".close-live-search")
    this.loaderIcon = document.querySelector(".circle-loader")

    this.typingWaitTimer
    this.prevValue = ""

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
      // showing Icon loader
      this.showIconLoader()

      // starting user keyup event
      clearTimeout(this.typingWaitTimer)
      this.prevValue = value
      this.typingWaitTimer = setTimeout(() => this.sendRequset(), 3000)
    }

  }

  showIconLoader() {
    this.loaderIcon.classList.add("circle-loader--visible")
  }

  sendRequset() {
    // console.log(this.searchInput.value)
    axios.post("/search", { searchingValue: this.searchInput.value }).then(() => {
    }).catch(() => {
      alert("Your request for " + this.searchInput.value + " was failed!")
    })
  }

  insertHTML() {
    document.body.insertAdjacentHTML('beforeend', `<div class="search-overlay">
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
    
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #1</strong>
                  <span class="text-muted small">by barksalot on 0/14/2019</span>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #2</strong>
                  <span class="text-muted small">by brad on 0/12/2019</span>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #3</strong>
                  <span class="text-muted small">by barksalot on 0/14/2019</span>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #4</strong>
                  <span class="text-muted small">by brad on 0/12/2019</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>`)
  }


}