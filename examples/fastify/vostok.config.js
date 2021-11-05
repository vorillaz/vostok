module.exports = {
  version: 2,
  comment: 'Basic microservices setup',
  builds: [
    {
      pkg: 'home',
      dest: '/'
    },
    {
      pkg: 'api',
      dest: '/api',
      env: {
        LOCAL_KEY: 'this is coming from vostok.config.js'
      }
    },
    {
      pkg: 'static',
      dest: '/static',
      use: '@vostok/static'
    },
    {
      pkg: 'test-prefix',
      dest: '/test-prefix'
    },
    {
      pkg: 'auth',
      dest: '/auth'
    }
  ]
};
