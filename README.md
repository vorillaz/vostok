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
/** @type {import('vostok').VostokConfig} */
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

For dynamic build steps you can also use a function:

```js
/** @type {import('vostok').VostokConfig} */
module.exports = async () => {
  const hello = await doSomeIo();
  return {
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
};
```

Each `build` can get declated independently, thus we can redirect the ouput from subproject `home` to `localhost:3000/`, the output from `docs` to `localhost:3000/docs` and so on.

Additionally we can can preprocess the ouput of the builds using additional options.

### builds.port

Vostok handles port mapping dynamically, but sometimes we may need to manually mount the port of the build:

```js
module.exports = {
  builds: [
    {
      pkg: 'home',
      dest: '/',
      port: 1312
    }
  ]
};
```

### builds.env

By default Vostok will load and configure every envinromental variables found in the project. But you can also distinguish passed through variables.

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

### builds.dest

The destination path to resolve proxy the request

```js
module.exports = {
  builds: [
    {
      port: 5001
      pkg: 'api',
      dest: '/api' // proxying http://localhost:3000/api to http://localhost:5001
    }
  ]
};
```

### builds.subdomain

The destination subdomain to resolve proxy the request

```js
module.exports = {
  builds: [
    {
      port: 5002
      pkg: 'api',
      subdomain: 'bar',
      dest: '/foo' // proxying http://bar.localhost:3000/foo to http://localhost:5002
    }
  ]
};
```

## CLI

### `vostok dev`

Runs Vostok in development mode, using the `vostok.config.js` you can configure the sub app entry points.
The dev option allows you to pass down some additional params:

- `-a, --apps` Run specific builds
- `-c, --config` Choose another vostok configuration file,
- `-d, --debug` See Vostok's logging info.
- `-p, --port` Run Vostok on a specific port.

## Working examples

- [Fastify](/examples/fastify)
- [Microbundle](/examples/microbundle)
- [Next.js multiple apps](/examples/nextjs)
- [Simple HTTP server](/examples/simple-server)
