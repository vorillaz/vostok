module.exports = {
  version: 2,
  comment: 'Basic microservices setup',
  builds: [
    {
      pkg: 'api',
      dest: '/api',
      env: {
        LOCAL_KEY: 'this is coming from vostok.config.js'
      }
    },
    {
      pkg: 'auth',
      dest: '/auth'
    }
  ]
};
