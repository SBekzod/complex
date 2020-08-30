
class User {
    constructor(data){
        this.data = data
        this.planet = 'EARTH'
    }

    get planetName() {
        return this.planet
    }

    set planetNameSet(a) {
        this.planet = a
    }

}


// // constructor
// let User = function (data) {
//     this.data = data
//     this.planet = 'Earth'
// }

// User.prototype.register = function () {

// }

module.exports = User