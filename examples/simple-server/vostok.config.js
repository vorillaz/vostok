module.exports = {
  version: 2,
  comment: 'Basic server config',
  builds: [
    {
      pkg: 'time',
      dest: '/time'
    },
    {
      pkg: 'date',
      dest: '/date'
    }
  ]
};
