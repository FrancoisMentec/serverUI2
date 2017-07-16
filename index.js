const fs = require('fs')
const express = require('express')
const app = express()
const http = require('http')
const server = http.Server(app)
const io = require('socket.io')(server)

const UserManager = require('./src/user.js')

// Config
try {
  config = JSON.parse(fs.readFileSync(__dirname + '/config.json'))
} catch (err) {
  console.error('No config file found')
  process.exit(1)
}

// Users manager
var userManager = new UserManager(config)

// App config
app.use('/material-design', express.static(__dirname + '/node_modules/material-design-fm')) // add material-design-fm
app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/html/index.html')
})

// Socket.io
io.on('connection', function (socket) {
  userManager.addUser(socket)
})

// Listen
server.listen(config.port, function () {
  console.log('serverUI listening on port ' + config.port)
})
