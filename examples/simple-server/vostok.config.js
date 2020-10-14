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
      dest: '/date',
      onResponse: (request, reply, res) => {
        reply.header('coming-from', 'vostok');
        reply.send(res);
      }
    }
  ]
};
