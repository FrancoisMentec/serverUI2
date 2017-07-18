serverUI.addApp('files', 'folder', function () {
  this.path = null
	this.files = []
	this.selectedFiles = []

	this.pathDiv = document.getElementById('filesPathDiv')
	this.directoryContent = document.getElementById('filesDirectoryContent')

	// Events
	this.on('logged', logged => {
		if (logged) this.goTo(this.path || '/')
	})

	this.on('directoryContent', data => {
		if (data.path === this.path) {
			for (var i = 0, li = data.files.length; i < li; i++) {
				let file = new _File(data.files[i], this)
				this.files.push(file)
				this.directoryContent.appendChild(file.div)
			}
		}
	})

	// Functions
	this.goTo = function (path) {
		this.pathDiv.empty()
		this.directoryContent.empty()
		this.files = []
		this.selectedFiles = []

		this.path = path

		var dirs = this.path.split('/')
		if (dirs[dirs.length - 1].length === 0) dirs.pop()
		let p = ''
		for (var i = 0, li = dirs.length; i < li; i++) {
			if (i > 0) this.pathDiv.appendChild(document.createElement('span'))
			p += p.length > 0 && p[p.length - 1] === '/'
				? dirs[i]
				: '/' + dirs[i]
			let path = p
			let button = document.createElement('button')
			button.className = 'flat'
			button.innerHTML = dirs[i].length > 0
				? dirs[i]
				: '/'
			button.addEventListener('click', () => {
				this.goTo(path)
			})
			this.pathDiv.appendChild(button)
		}

		this.emit('getDirectoryContent', path)
	}
})

const FILE_ICONS = {
	file: 'insert_drive_file',
	directory: 'folder',
	blockDevice: 'devices',
	characterDevice: 'devices',
	symbolicLink: 'folder',
	fifo: 'keyboard_arrow_right',
	socket: 'settings_ethernet',
	unknown: 'insert_drive_file'
}

class _File {
	constructor (data, filesApp) {
		this.filesApp = filesApp
		this.type = data.type
		this.path = data.path
		this.name = data.name
		this._selected = false

		this.div = document.createElement('div')
		this.div.className = 'file'
		this.div.addEventListener('click', e => {
			if (e.ctrlKey) {
				this.selected = !this.selected
			} else if (e.shiftKey) {
				if (this.filesApp.selectedFiles.length > 0) {
					let i = this.filesApp.files.indexOf(this.filesApp.selectedFiles[this.filesApp.selectedFiles.length - 1])
					let j = this.filesApp.files.indexOf(this)
					let start = Math.min(i, j)
					let end = Math.max(i, j)
					for (var k = start; k <= end; k++) {
						this.filesApp.files[k].selected = !this.filesApp.files[k].selected
					}
				} else {
					this.selected = true
				}
			} else {
				while (this.filesApp.selectedFiles.length > 0) {
					this.filesApp.selectedFiles[0].selected = false
				}
				this.selected = true
			}
		})
		this.div.addEventListener('dblclick', () => {
			if (this.type === 'directory' || this.type === 'symbolicLink') {
				this.filesApp.goTo(this.path)
			} else {
				alert('no action for ' + this.type)
			}
		})

		this.icon = document.createElement('div')
		this.icon.className = 'icon ' + this.type
		this.icon.innerHTML = FILE_ICONS[this.type]
		this.div.appendChild(this.icon)

		this.nameDiv = document.createElement('span')
		this.nameDiv.className = 'name'
		this.nameDiv.innerHTML = this.name
		this.div.appendChild(this.nameDiv)
	}

	get selected () {
		return this._selected
	}

	set selected (value) {
		if (this.selected) {
			this.filesApp.selectedFiles.splice(this.filesApp.selectedFiles.indexOf(this), 1)
		}
		this._selected = value
		if (this.selected) {
			this.filesApp.selectedFiles.push(this)
			this.div.classList.add('selected')
		} else {
			this.div.classList.remove('selected')
		}
	}
}
