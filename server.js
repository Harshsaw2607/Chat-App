const express=require('express');
const app=express();
const http=require('http').createServer(app);


const PORT=process.env.PORT || 5000
http.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`)
})

app.use(express.static('public'))
app.get('/',(req,res)=>{
    res.sendFile('./index.html',{root:__dirname})
})

// SOCKET CODE

const activeUsers = new Set();
const io = require('socket.io')(http)

io.on('connection',(socket)=>{
    console.log('Connected.....')

    socket.on('login', (username) => {
        if (activeUsers.has(username)) {
          socket.emit('usernameExists');
        } else {
          activeUsers.add(username);
          socket.username = username;
          socket.broadcast.emit('userConnected', username);
          console.log(`${username} connected`)
        }
      });

    socket.on('join',(name)=>{
        const newJoin=`<h4 style="font-weight:300; font-family:system-ui; color:gray;">${name} has joined the conversation</h4>`
        socket.broadcast.emit('join',newJoin)
    })

    // Track Typing
    socket.on('typing',(name)=>{
        socket.broadcast.emit('typing',name)
    })
    
    socket.on('stopTyping', (name)=>{
        socket.broadcast.emit('stopTyping',name)
    })
  // Handle messages
    socket.on('Event',(msg)=>{
        // Broadcast the message to the appropriate room (member)
        // Below syntax will broadcast to all the users who are using the app i.e connected with browsers that are linked with this socket
        socket.broadcast.emit('Event',msg)
        // Below syntax will send the message only to the specific user to whom i want to send
            // socket.to(msg.user).emit('Event', msg);

        // Store the message for the member
    
    })
    socket.on('disconnect', () => {
        if (socket.username) {
          activeUsers.delete(socket.username);
          socket.broadcast.emit('userDisconnected', socket.username);
          console.log(`${socket.username} disconnected`)
        }
      });

      
      
})