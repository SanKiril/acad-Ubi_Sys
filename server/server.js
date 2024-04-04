const express = require('express');
const app = express();
const server = require("http").Server(app);

const io = require("socket.io")(server);

// serve static files
app.use(express.static('www'));
app.use(express.static('media'));

// default file
app.get('/', (_, res) => res.sendFile('client.html', { root: 'www' }));

io.on("connection", function(socket){
  console.log("nuevo cliente");

  socket.on("message_evt", function(message){
    console.log(socket.id, message);
    socket.broadcast.emit("message_evt", message);
  });
});

server.listen(3000, () => console.log('server started'));
