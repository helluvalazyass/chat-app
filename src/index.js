const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join( __dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count = 0
// let sockets = []
io.on('connection', (socket) => {
  console.log('New Websocket Connection')
  // sockets.push(socket)

  // socket.emit('countUpdated', count)
  // socket.on('increment', () => {
  //   count++
  //   // sockets.forEach((socket) => {
  //   //   socket.emit('countUpdated', count)
  //   // })
  //   io.emit('countUpdated', count)
  // })

  // socket.emit('message', {
  //   text: 'Welcome!',
  //   createdAt: new Date().getTime()
  // })

  

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options})
    if(error) {
      return callback(error)
    }
    socket.join(user.room)
    socket.emit('message', generateMessage('Admin', 'Welcome'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    callback()
  })

  socket.on('messageFromClient', (message, callback) => {
    const filter = new Filter()
    if(filter.isProfane(message)) {
      return callback('Profanity is not allowed')
    }
    const user = getUser(socket.id)

    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()
  })
  socket.on('sendLocation', (coords, callback) => {
    // io.emit('message', `Location: ${coords.latitude}, ${coords.longitude}`)

    // io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}` )
    const user = getUser(socket.id)

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude}, ${coords.longitude}`))
    callback('location shared!')
  })
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if(user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
    
  })
})

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port} `)
})