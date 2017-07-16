(function () {
  class serverUI {
    constructor () {
      materialDesign.primaryColor = 'blue'
      materialDesign.secondaryColor = 'orange'
      materialDesign.errorColor = 'red'

      // login
      this.loginDiv = document.getElementById('login')
      this.loginPassword = document.getElementById('loginPassword')
      this.loginPassword.addEventListener('enter', () => {
        this.login()
      })
      this.loginButton = document.getElementById('loginButton')
      this.loginButton.addEventListener('click', () => {
        this.login()
      })

      // Server
      this._connected = false
      this._logged = false
      this.connect()

      // Apps
      this.apps = []
      this.currentApp = null

      this.appsButtons = document.getElementById('appsButtons')
      this.appsContents = document.getElementById('appsContents')
    }

    get connected () {
      return this._connected
    }

    set connected (value) {
      this._connected = value
      if (!this.connected) this.logged = false
    }

    get logged () {
      return this._logged
    }

    set logged (value) {
      if (!this.connected && value) throw new Error('Can\'t be logged if not connected first.')
      this._logged = value
      if (this.logged) {
        this.loginDiv.classList.add('hidden')
      } else {
        this.loginDiv.classList.remove('hidden')
      }
      this.trigger('logged', this.logged)
    }

    connect () {
      this.server = io.connect()

      this.server.on('connect', () => {
        this.connected = true
      })

      this.server.on('disconnect', () => {
        this.connected = false
      })

      this.server.on('logged', logged => {
        this.logged = logged
      })
    }

    login (password) {
      password = password || this.loginPassword.value
      this.loginPassword.value = ''
      this.emit('login', password)
    }

    emit (action, message) {
      //if (!this.connected) throw Error('Not connected.')
      if (!this.logged && action !== 'login') throw Error('Not logged.')
      this.server.emit(action, message)
    }

    addApp (name, icon, init) {
      var app = new App(name, icon, init, this)
      this.apps.push(app)
      this.appsButtons.appendChild(app.button)
      this.appsContents.appendChild(app.content)
      if (!this.currentApp) this.showApp(app)
    }

    showApp (app) {
      if (app === this.currentApp) return
      if (this.currentApp) this.currentApp.hide()
      this.currentApp = app
      app.button.classList.add('active')
      app.content.classList.add('visible')
    }

    hideApp (app) {
      app.button.classList.remove('active')
      app.content.classList.remove('visible')
    }

    trigger (eventName, data) {
      for (var i = 0, li = this.apps.length; i < li; i++) {
        this.apps[i].trigger(eventName, data)
      }
    }
  }

  // App
  class App {
    constructor (name, icon, init, serverUI) {
      this.serverUI = serverUI

      this.button = document.createElement('div')
      this.button.className = 'appButton'
      this.button.addEventListener('click', e => {
        this.show()
      })
      this.iconDiv = document.createElement('span')
      this.iconDiv.className = 'material-icons'
      this.button.appendChild(this.iconDiv)
      this.nameDiv = document.createElement('span')
      this.nameDiv.className = 'name'
      this.button.appendChild(this.nameDiv)

      this.content = document.getElementById('content-' + name)

      this.name = name
      this.icon = icon

      this.listeners = {}

      this.init = init
      this.init()
    }

    get name () {
      return this._name
    }

    set name (value) {
      this._name = value
      this.nameDiv.innerHTML = this.name[0].toUpperCase() + this.name.slice(1)
    }

    get icon () {
      return this._icon
    }

    set icon (value) {
      this._icon = value
      this.iconDiv.innerHTML = this.icon
    }

    show () {
      this.serverUI.showApp(this)
    }

    hide () {
      this.serverUI.hideApp(this)
    }

    on (eventName, callback) {
      if (!this.listeners[eventName]) this.listeners[eventName] = []
      this.listeners[eventName].push(callback)
    }

    trigger (eventName, data) {
      if (this.listeners[eventName]) {
        for (var i = 0, li = this.listeners[eventName].length; i < li; i++) {
          this.listeners[eventName][i](data)
        }
      }
    }
  }

  window.serverUI = new serverUI()
})()
