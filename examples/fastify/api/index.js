const fastify = require('fastify')({
  logger: true
});

const port = process.env.PORT || 3001;

// Declare a route
fastify.get('/api', function (request, reply) {
  reply.send({
    hello: 'api',
    another: 'key',
    keys: {
      comment_foo: 'This one is coming from vostok.config.js',
      foo: process.env.LOCAL_KEY,
      comment_bar: 'and this one from .env',
      bar: process.env.KEY_FROM_DOT_ENV
    }
  });
});

fastify.get('/api/redirect', function (request, reply) {
  reply.redirect('https://vorillaz.com');
});

// Run the server!
fastify.listen(port, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`API server listening on ${address}`);
});
