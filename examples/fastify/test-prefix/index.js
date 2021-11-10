const fastify = require('fastify')({
  logger: true
});

const port = process.env.PORT || 3004;

// Declare a route
fastify.get('/test-prefix', function (request, reply) {
  reply.send({
    hello: 'with-a-prefix',
    port: port
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
