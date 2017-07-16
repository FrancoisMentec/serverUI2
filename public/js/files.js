serverUI.addApp('files', 'folder', function () {
  this.content.innerHTML = 'files'

  this.on('logged', logged => {
    console.log('logged: ' + logged)
  })
})
