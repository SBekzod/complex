export default class Search {
    constructor() {
        this.a = 'hello'
        this.b = "BYE"
    }

    getAlert() {
        alert(this.a)
    }

    getAimedAlert(target) {
        alert(target)
    }

    get gettingValue () {
        return this.b
    }

    set settingValue (c) {
        this.b = c
    }

    simpleChangeValue(d) {
        this.b = d
    }
}