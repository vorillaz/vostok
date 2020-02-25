const http = require('http');
const port = process.env.PORT || 3001;

http
  .createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    const now = new Date();

    res.write(`Time is ${new Date().toLocaleTimeString()}`);
    res.end();
  })
  .listen(port);

console.log(`server running on port ${port}`);
