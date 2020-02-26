const ALL_APPS = '__ALL__';

module.exports = {
  portGap: 4000,
  allApps: ALL_APPS,
  registry: {
    url: 'https://api.npms.io/v2/package/vostok'
  },
  builds: {
    static: '@vostok/static',
    node: '@vostok/node'
  },
  args: {
    port: {options: ['port', 'p'], default: 3000},
    apps: {options: ['apps', 'a'], default: ALL_APPS},
    logger: {options: ['log', 'l'], default: false}
  }
};
