const express = require('express');
const app = express();
const port = process.env.PORT || 3002;

app.get('/', (req, res) => {
  console.log(req.subdomains);
  res.send('Hello app!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
