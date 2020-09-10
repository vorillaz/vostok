module.exports = {
  version: 2,
  comment: 'Basic microservices setup',
  builds: [
    {
      pkg: 'home',
      dest: '/',
      port: 3001
    },
    {
      pkg: 'docs',
      dest: '/docs',
      port: 3002
    }
  ]
};
