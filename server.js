//Getting all the requirements here
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')//Using uuid to get id for our room

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')//Setting the view engine to be embedded javascript
app.use(express.static('public'))
//The function below reroutes into a room with id generated using uuid
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
//This renders the room into which everything resides
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
//This section ensures that when a person performs an action, it broadcasted throughout the connections.
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})
//The server lsitens here on the port specidied here.
server.listen(process.env.PORT||3030)
