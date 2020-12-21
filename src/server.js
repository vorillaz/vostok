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
    },
    rewriteRequestHeaders = (originalReq, headers) => headers
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

  const opts = {
    cwd: path.join(process.cwd(), pkg),
    ...passedOpts
  };

  if (use === static) {
    console.log('static');
    await server.register(staticFastify, {
      prefix: dest,
      prefixAvoidTrailingSlash: true,
      root: path.join(process.cwd(), pkg, src)
    });
  }

  if (use === node) {
    await server.register(proxy, {
      upstream: `http://localhost:${port}`,
      prefix: dest,
      replyOptions: {
        rewriteRequestHeaders,
        onResponse: async (request, reply, res) => {
          Object.keys(headers).forEach(h => {
            reply.header(h, headers[h]);
          });
          await onResponse(request, reply, res);
        }
      }
    });
    run({pkg, opts, command});
  }

  return {pkg, port};
};

module.exports = createServer;
