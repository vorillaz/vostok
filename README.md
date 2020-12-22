![vostok](./assets/vostok.jpg)

Vostok is minimalistic build and development system for Node.js. Inspired by Vercel's [now dev](https://zeit.co/docs/now-cli#commands/dev), Yarn [workspaces](https://classic.yarnpkg.com/en/docs/workspaces/), and [Lerna](https://github.com/lerna/lerna), Vostok lets you develop modern Node.js apps and services with meaningful and robust architecture.

Vostok is a development first solution for monorepos, projects consuming microservices even huge single page applications. Instead of bundling, watching and transpiling every single piece of code in your project using Vostok you can split your architecture into meaningful and reusable parts. You just need a configuration file and some your favorite library or framework.

## Tell me more.

Named by the USSR space program, Vostok (Восто́к) is a development tool made for everyone working with a monorepo or a project which relies on a more versatile architecture.

Using Vostok you can spin up a project which relies on modular parts, debug and build your application.

Imagine that you are building a super simple application with two APIs. Each endpoint is a standalone service, in that way you can containerize your final application and scale it horizontally.

The folder structure of your application would look like this.

```bash
my_awesome_app/
├── api_1
├──── index.js # Entry point
├──── package.json #api_1 dependencies
├── api_2
├──── index.js # Entry point
├──── package.json # api_2 dependencies
├── vostok.config.js # vostok configuration
└── package.json # Main package.json
```

Using Vostok you can fairly easily create a reverse proxy for your application, thus you can easily test `api_1` and `api_2` independently. There is a full working [example](./examples/simple-server) at the `/examples` folder.

## Configuration

### vostok.config.js

Vostok relies on a simple configuration file called `vostok.config.js` which has to be placed in the root of your project. A sample config would look like this:

```js
module.exports = {
  version: 2,
  comment: 'Basic microservices setup',
  builds: [
    {
      pkg: 'home',
      dest: '/'
    },
    {
      pkg: 'docs',
      dest: '/docs'
    }
  ]
};
```

Each `build` can get declated independently, thus we can redirect the ouput from subproject `home` to `localhost:3000/`, the output from `docs` to `localhost:3000/docs` and so on.

Additionally we can can preprocess the ouput of the builds using additional options.

### builds.headers

We can pass through HTTP headers using the `headers` options as:

```js
module.exports = {
  builds: [
    {
      pkg: 'home',
      dest: '/',
      headers: {
        cache: 'HIT'
      }
    }
  ]
};
```

### builds.port

Vostok handles port mapping dynamically, but sometimes we may need to manually mount the port of the build:

```js
module.exports = {
  builds: [
    {
      pkg: 'home',
      dest: '/',
      port: 3000
    }
  ]
};
```

### builds.env

Pass the environment variables to the build:

```js
module.exports = {
  builds: [
    {
      pkg: 'api',
      dest: '/api',
      env: {
        LOCAL_KEY: 'this is coming from vostok.config.js'
      }
    }
  ]
};
```

### builds.rewriteRequestHeaders

A custom hook that allows headers parsing and rewriting.

```js
module.exports = {
  builds: [
    {
      pkg: 'api',
      dest: '/api',
      rewriteRequestHeaders: (request, headers) => ({
        ...headers,
        'request-id': uuid()
      })
    }
  ]
};
```

### builds.rewritePrefix

Rewrite the propagated prefix

```js
module.exports = {
  builds: [
    {
      pkg: 'api',
      dest: '/api',
      rewritePrefix: 'hello'
    }
  ]
};
```

### builds.onResponse

A custom hook that can be used before dispatching the response, it relies on [Fastify's `onResponse` hook](https://github.com/fastify/fastify-reply-from#onresponserequest-reply-res):

```js
module.exports = {
  builds: [
    {
      pkg: 'api',
      dest: '/api',
      onResponse: async (request, reply, res) => {
        reply.removeHeader('content-length');
        reply.header('cache', 'HIT');
        // Don't forget this line as the response won't get back.
        reply.send(res);
      }
    }
  ]
};
```

## CLI

### `vostok dev`

Runs Vostok in development mode, using the `vostok.config.js` you can configure the sub app entry points.
The dev option allows you yo pass down some additional params:

- `-p 4011` Choose the port for Vostok
- `-a app,lib` Run Vostok with specific apps.
- `l` See Vostok's logging info.

## Working examples

- [Fastify](/examples/fastify)
- [Microbundle](/examples/microbundle)
- [Next.js multiple apps](/examples/nextjs)
- [Simple HTTP server](/examples/simple-server)

## Next up.

- Add `vostok install` with workspaces support.
- Finalize `vostok build`.
- Add sourcemaps for `@vostok/node`.
- Better error handling, bundling and spin up for child processes.
