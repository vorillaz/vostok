module.exports = {
  version: 2,
  comment: 'Basic microservices setup',
  builds: [
    {
      pkg: 'app',
      use: '@vostok/static',
      dest: '/app'
    },
    {
      pkg: 'lib',
      use: '@vostok/static',
      dest: '/lib'
    }
  ]
};
