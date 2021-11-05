const fastify = require('fastify')({
  logger: true
});

const port = process.env.PORT || 3003;

// Declare a route
fastify.get('/image', function (request, reply) {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Vostok Microservices</title>
      </head>
      <body>
        <h1>Hello world</h1>
        <img src="static/test.jpeg" />
      </body>
    </html>
  `);
});

fastify.get('/home', function (request, reply) {
  reply.send({
    this_is: 'home'
  });
});
fastify.get('/', function (request, reply) {
  reply.send({
    this_is: 'home'
  });
});

// Run the server!
fastify.listen(port, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Auth server listening on ${address}`);
});
