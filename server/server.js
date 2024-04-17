  const express = require('express');
const fs = require('fs');
const app = express();
const server = require("http").Server(app);
const bodyParser = require('body-parser');
const io = require("socket.io")(server);
const chokidar = require('chokidar');
const path = require('path');
const PORT  = 3000

app.use(bodyParser.json());

const currentDir = __dirname;
const rootDirectory = path.join(currentDir, '..');

let projectDirectory = rootDirectory + "/app";
if (!fs.existsSync(projectDirectory)) {
  projectDirectory = rootDirectory;
}

const productsJson = `${projectDirectory}/data/products.json`;
const productsDefaultJson = `${projectDirectory}/data/products-default.json`;
if (!fs.existsSync(productsJson))
  fs.readFile(productsDefaultJson, 'utf8', (err, data) => {
    console.log("Products.json not found, copying default products.json...");
    if (err) {
      console.error(err);
      return;
    }
    fs.writeFile(productsJson, data, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('File copied successfully!');
    });
  });

const filesToCheckDirectory = projectDirectory + "/www"
const fileNames = fs.readdirSync(filesToCheckDirectory);
let filesToCheck = Array.from(fileNames.map(fileName => `${filesToCheckDirectory}/${fileName}`));
filesToCheck.push(`${projectDirectory}/server/server.js`);

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
app.use(express.static(`www`));
app.use(express.static(`media`));
app.use(express.static(`data`));

// serve default file
app.get('/', (_, res) => {
  res.sendFile("client.html", { root: `www` }, (err) => {
    if (err) {
      console.error("Ejecutar este archivo desde el directorio base del projecto:\n\tnode server/server.js");
      console.error(err);
      process.exit();
    }
  });
});

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

server.listen(PORT, () => console.log("Servidor iniciado en puerto " + PORT));
