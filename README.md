![vostok](./assets/vostok.jpg)

Vostok is minimalistic build and development system for Node.js. Inspired by ZEIT's [now dev](https://zeit.co/docs/now-cli#commands/dev), Yarn [workspaces](https://classic.yarnpkg.com/en/docs/workspaces/), and [Lerna](https://github.com/lerna/lerna), Vostok lets you develop modern Node.js apps and services with meaningful and robust architecture.

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
├── vostok.json # vostok configuration
└── package.json # Main package.json
```

Using Vostok you can fairly easily create a reverse proxy for your application, thus you can easily test `api_1` and `api_2` independently. There is a full working [example](./examples/simple-server) at the `/examples` folder.

## CLI

TBD.

## Next up.

- [] Add build.
- [] Add sourcemaps for `@vostok/node`.
- [] Better error handling, bundling and spin up for child process.
