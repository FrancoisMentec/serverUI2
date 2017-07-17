serverUI.addApp('files', 'folder', function () {
  this.path = null
	this.files = []

	this.pathDiv = document.getElementById('filesPathDiv')
	this.directoryContent = document.getElementById('filesDirectoryContent')

	// Events
	this.on('logged', logged => {
		if (logged) this.goTo(this.path || '/')
	})

	this.on('directoryContent', data => {
		console.log(data)
		if (data.path === this.path) {
			this.pathDiv.innerHTML = this.path
			this.files = []
			while (this.directoryContent.firstChild) this.directoryContent.removeChild(this.directoryContent.firstChild)
			for (var i = 0, li = data.files.length; i < li; i++) {
				let file = new _File(data.files[i])
				this.files.push(file)
				this.directoryContent.appendChild(file.div)
			}
		}
	})

	// Functions
	this.goTo = function (path) {
		this.path = path
		this.emit('getDirectoryContent', path)
	}
})

class _File {
	constructor (data) {
		this.type = data.type
		this.path = data.path
		this.name = data.name

		this.div = document.createElement('div')
		this.div.className = 'file'
		this.div.innerHTML = this.name
	}
}
