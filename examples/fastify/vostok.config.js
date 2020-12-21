module.exports = {
  version: 2,
  comment: 'Basic microservices setup',
  builds: [
    {
      pkg: 'api',
      dest: '/api',
      rewriteRequestHeaders: (originalReq, headers) => ({
        ...headers,
        'request-time': Date.now()
      }),
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
      pkg: 'home',
      dest: '/'
    },

    {
      pkg: 'auth',
      dest: '/auth'
    }
  ]
};
