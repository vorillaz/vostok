const path = require('path');
const staticFastify = require('fastify-static');
const proxy = require('fastify-http-proxy');
const {builds} = require('./constants');
const {logErr, getPort} = require('./utils');
const run = require('./run');

const {static, node} = builds;

const createServer = async ({server, build, spawnOpts = {}}) => {
  const port = await getPort();
  const command = 'dev';

  const {use = node, pkg = null, src = '/', dest = '/', headers = {}} = build;
  if (pkg === null) {
    logErr(`There is a build with no \`pkg\` defined.`);
  }

  const {env = {}} = spawnOpts;
  const passedOpts = {
    cwd: path.join(process.cwd(), pkg),
    ...spawnOpts,
    env: {...env, PORT: port}
  };

  if (use === static) {
    server.register(staticFastify, {
      root: path.join(process.cwd(), pkg, src),
      prefix: dest,
      setHeaders: function(res, pathName) {
        Object.keys(headers).forEach(h => {
          res.setHeader(h, headers[h]);
        });
      }
    });
  }

  if (use === node) {
    await server.register(proxy, {
      upstream: `http://localhost:${port}`,
      prefix: dest,
      replyOptions: {
        onResponse: (request, reply, res) => {
          Object.keys(headers).forEach(h => {
            reply.header(h, headers[h]);
          });
          reply.send(res);
        }
      }
    });
  }

  const opts = {
    cwd: path.join(process.cwd(), pkg),
    ...passedOpts
  };

  return run({pkg, opts, command});
};

module.exports = createServer;
