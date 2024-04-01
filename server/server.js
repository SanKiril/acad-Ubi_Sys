const http = require('http');
const fs = require('fs');


const PORT = 80;  // requires to be executed with elevated permissions (sudo node ./index.js)
//const PORT = 8080;  // doesn't require elevated permissions (node ./index.js)


const serveStaticFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(err, data) {
      if(err) reject(err);
      resolve(data);
    });
  });
}

const saveStaticFile = async (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, function(err, data) {
      if (err) reject(err);
      resolve();
    });
  });
}

const readData = (request) => {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk.toString();
    });
    request.on("end", () => {
      resolve(data);
    });
    request.on("error", (err) => {
      reject(err);
    });
  });
}

const sendResponse = (response, content, contentType) => {
  response.writeHead(200, {"Content-Type": contentType});
  response.end(content);
}

const handleRequest = async (request, response) => {
  const url = request.url;

  if (request.method === "GET") {
    let content;
    let contentType;
    switch(url) {
      case "/":
      case "/index.html":
        content = await serveStaticFile("www/index.html");
        contentType = "text/html";
        break;
      case "/script.js":
        content = await serveStaticFile("www/script.js");
        contentType = "text/javascript";
        break;
      case "/style.css":
        content = await serveStaticFile("www/style.css");
        contentType = "text/css";
        break;
      case "/tasks/get":
        content = await serveStaticFile("tasks.json");
        contentType = "application/json";
        break;
      default:
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write('404 Page Not Found');
        response.end();
    }

    if (content) {
      sendResponse(response, content, contentType);
    }
  }
  else if (request.method === "POST") {
    switch(url) {
      case "/tasks/update":
        const data = await readData(request);
        saveStaticFile("tasks.json", data);
        break;
      default:
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write('404 Page Not Found');
        response.end();
    }
  }
  else {
    response.writeHead(405, {"Content-Type": "text/html"});
    response.write(`Method ${request.method} Not Allowed\n`);
    response.end();
  }
}


const server = http.createServer(handleRequest);
server.listen(PORT);
