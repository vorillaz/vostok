module.exports = {
  portGap: 4000,
  registry: {
    url: 'https://api.npms.io/v2/package/vostok'
  },
  builds: {
    static: '@vostok/static',
    node: '@vostok/node'
  },
  args: {
    port: {options: ['port', 'p'], default: 3000},
    logger: {options: ['log', 'l'], default: false}
  }
};
