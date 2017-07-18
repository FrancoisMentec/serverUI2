const PATH = require('path');
const fs = require('fs')

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

		this.socket.on('message', message => {
			if (this.logged) {
				let action = message.action
				if (action === 'getDirectoryContent') {
					let path = message.message
					fs.readdir(path, (err, files) => {
						if (err) this.emit('err', err)
						else {
							let filesR = []
							for (var i = 0, li = files.length; i < li; i++) {
								let name = files[i]
								let filepath = PATH.join(path, name)
								let stat = fs.lstatSync(filepath)
								filesR.push({
									path: filepath,
									name: name,
									type: typeOfFile(stat),
									size: stat.size
								})
							}
							this.emit('directoryContent', {
								path: path,
								files: filesR
							})
						}
					})
				}
			}
		})
  }

  get logged () {
    return this._logged
  }

  set logged (value) {
    if (this.logged === value) return
    this._logged = value
    this.socket.emit('logged', this.logged)
  }

  emit (action, message) {
    if (!this.logged) throw Error('User not logged.')
    this.socket.emit('message', {
			action: action,
			message: message
		})
  }
}

function typeOfFile (stat) {
	if (stat.isFile()) return 'file'
	if (stat.isDirectory()) return 'directory'
	if (stat.isBlockDevice()) return 'blockDevice'
	if (stat.isCharacterDevice()) return 'characterDevice'
	if (stat.isSymbolicLink()) return 'symbolicLink'
	if (stat.isFIFO()) return 'fifo'
	if (stat.isSocket()) return 'socket'
	return 'unknown'
}
