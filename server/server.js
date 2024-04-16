  const express = require('express');
const fs = require('fs');
const app = express();
const server = require("http").Server(app);
const bodyParser = require('body-parser');
const io = require("socket.io")(server);
const chokidar = require('chokidar');
const PORT  = 3000

app.use(bodyParser.json());

const filesToCheck = [
  "/app/server/server.js",
  "/app/www/client.js",
  "/app/www/clerk.html",
  "/app/www/clerk.js",
  "/app/www/client.js",
  "/app/www/style.css",
  "/app/www/utils.js",
  "/app/data/products-default.json"
];
function reloadModule() {
  filesToCheck.forEach(filePath => {
    delete require.cache[require.resolve(filePath)];
  });
  console.log("Cambio local detectado: recargando archivos\n")
  io.emit("reload");
}
// Watch for changes in the specific files
const watcher = chokidar.watch(filesToCheck);
watcher.on('change', reloadModule);

// serve static files
app.use(express.static("www"));
app.use(express.static("media"));
app.use(express.static("data"));

// serve default file
app.get('/', (_, res) => res.sendFile("client.html", { root: "www" }));

// update files
app.post('/products.json', (req, res) => {
  console.log("Updated products.json file")
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
  console.log("Nueva conexión de cliente detectada");

  socket.on("message_evt", function(message){
    console.log(socket.id, message);
    socket.broadcast.emit("message_evt", message);
  });
});

server.listen(PORT, () => console.log("Servidor iniciado en puerto  " + PORT));
