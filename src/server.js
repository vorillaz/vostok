const path = require('path');
const staticFastify = require('fastify-static');
const proxy = require('fastify-http-proxy');
const {builds} = require('./constants');
const {logErr, getPort} = require('./utils');
const run = require('./run');

const {static, node} = builds;

const createServer = async ({server, build, spawnOpts = {}}) => {
  const {
    use = node,
    pkg = null,
    port: buildPort,
    src = '/',
    dest = '/',
    headers = {},
    env: buildEnv = {},
    onResponse = (request, reply, res) => {
      reply.send(res);
    }
  } = build;

  const port = buildPort ? buildPort : await getPort();

  const command = 'dev';

  if (pkg === null) {
    logErr(`There is a build with no \`pkg\` defined.`);
  }

  const {env = {}} = spawnOpts;

  const passedOpts = {
    cwd: path.join(process.cwd(), pkg),
    ...spawnOpts,
    env: {...env, ...buildEnv, PORT: port}
  };

  if (use === static) {
    server.register(staticFastify, {
      root: path.join(process.cwd(), pkg, src),
      decorateReply: false,
      prefix: dest,
      rewritePrefix: dest,
      setHeaders: (res, pathName) => {
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
      rewritePrefix: dest,
      replyOptions: {
        onResponse: async (request, reply, res) => {
          Object.keys(headers).forEach(h => {
            reply.header(h, headers[h]);
          });
          await onResponse(request, reply, res);
        }
      }
    });
  }

  const opts = {
    cwd: path.join(process.cwd(), pkg),
    ...passedOpts
  };
  run({pkg, opts, command});
  return {pkg, port};
};

module.exports = createServer;
