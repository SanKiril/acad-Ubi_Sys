const express = require('express');
const fs = require('fs');
const app = express();
const server = require("http").Server(app);
const bodyParser = require('body-parser');
const io = require("socket.io")(server);

app.use(bodyParser.json());

// serve static files
app.use(express.static("www"));
app.use(express.static("media"));
app.use(express.static("data"));

// serve default file
app.get('/', (_, res) => res.sendFile("client.html", { root: "www" }));

// update files
app.post('/products.json', (req, res) => {
  fs.writeFile("data/products.json", JSON.stringify(req.body), (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }
    else {
      res.sendStatus(200);
    }
  });
});

io.on("connection", function(socket){
  console.log("nuevo cliente");

  socket.on("message_evt", function(message){
    console.log(socket.id, message);
    socket.broadcast.emit("message_evt", message);
  });
});

server.listen(3000, () => console.log("server started"));