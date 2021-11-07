/** @type {import('vostok').VostokConfig} */
module.exports = () => {
  return {
    version: '0.0.1',
    builds: [
      {
        pkg: 'home',
        dest: '/',
        port: 3001
      },
      {
        pkg: 'docs',
        dest: '/documentation',
        port: 3002
      }
    ]
  };
};
