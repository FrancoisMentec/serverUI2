module.exports = class UserManager {
  constructor (config) {
    this.config = config
    this.users = []
  }

  addUser (socket) {
    this.users.push(new User(this, socket))
  }

  removeUser (user) {
    this.users.splice(this.users.indexOf(user), 1)
  }
}

class User {
  constructor (userManager, socket) {
    this.userManager = userManager
    this.socket = socket
    this._logged = false

    this.socket.on('disconnect', () => {
      this.userManager.removeUser(this)
    })

    this.socket.on('login', password => {
      this.logged = password === this.userManager.config.password
    })
  }

  get logged () {
    return this._logged
  }

  set logged (value) {
    if (this.logged === value) return
    this._logged = value
    this.emit('logged', this.logged)
  }

  emit (action, message) {
    if (!this.logged && action !== 'logged') throw Error('User not logged.')
    this.socket.emit(action, message)
  }
}
