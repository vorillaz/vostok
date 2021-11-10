/** @type {import('vostok').VostokConfig} */
module.exports = {
  version: 2,
  comment: 'Basic microservices setup with express',
  builds: [
    {
      pkg: 'app',
      dest: '/'
    },
    {
      pkg: 'api',
      subdomain: 'staging',
      port: 8001,
      env: {
        LOCAL_KEY: 'this is coming from vostok.config.js'
      }
    }
  ]
};
