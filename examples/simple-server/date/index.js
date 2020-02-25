const http = require('http');
const port = process.env.PORT || 3002;

http
  .createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(
      `Date is: ${new Date()
        .toJSON()
        .slice(0, 10)
        .replace(/-/g, '/')}`
    );
    res.end();
  })
  .listen(port);

console.log(`server running on port ${port}`);
