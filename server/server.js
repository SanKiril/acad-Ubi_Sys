const http = require('http');
const fs = require('fs');


const PORT = 8080;  // requires to be executed with elevated permissions
//const PORT = 8080;  // doesn't require elevated permissions


const serveFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(err, data) {
      if(err) reject(err);
      resolve(data);
    });
  });
}

const saveFile = async (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, function(err) {
      if (err) reject(err);
      resolve();
    });
  });
}

const readData = (request) => {
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', (chunk) => {
      data += chunk.toString();
    });
    request.on('end', () => {
      resolve(data);
    });
    request.on('error', (err) => {
      reject(err);
    });
  });
}

const sendResponse = (response, content, contentType) => {
  response.writeHead(200, {'Content-Type': contentType});
  response.end(content);
}

const handleRequest = async (request, response) => {
  const url = request.url;

  if (request.method === 'GET') {
    let content;
    let contentType;
    console.log(url);
    switch(url) {
      case '/':
      case '/web/client.html':
      case '/client.html':
        content = await serveFile('web/client.html');
        contentType = 'text/html';
        break;
      case '/web/clerk.html':
      case '/clerk.html':
        content = await serveFile('web/clerk.html');
        contentType = 'text/html';
        break;
      case '/web/style.css':
      case "/style.css":
        content = await serveFile("web/style.css");
        contentType = "text/css";
        break;
      case '/data/get':
        content = await serveFile('server/data.json');
        contentType = 'application/json';
        break;
      default:
        if (url.startsWith('/media')){
          console.log("access to media folder\n");
          content = await serveFile(url.substring(1));
          contentType = "image/png";
          break;
        }
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.write('404 Page Not Found');
        response.end();
    }

    if (content) {
      sendResponse(response, content, contentType);
    }
  }
  else if (request.method === 'POST') {
    switch(url) {
      case '/data/update':
        const data = await readData(request);
        saveFile('server/data.json', data);
        break;
      default:
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.write('404 Page Not Found');
        response.end();
    }
  }
  else {
    response.writeHead(405, {'Content-Type': 'text/html'});
    response.write(`Method ${request.method} Not Allowed\n`);
    response.end();
  }
}


const server = http.createServer(handleRequest);
server.listen(PORT);
