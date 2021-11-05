const { build } = require('esbuild');
const { esbuildPluginNodeExternals } = require('esbuild-plugin-node-externals');
const path = require('path');
const notify = require('./plugins/notify');

const source = path.resolve(process.cwd());

const src = path.join(source, 'src', 'vostok.ts');
const out = path.join(source, './build/vostok.js');

const passedArgs = process.argv.slice(2) || [];
const watch = passedArgs.includes('--watch');

const options = {
  entryPoints: [src],
  outfile: out,
  minify: false,
  bundle: true,
  watch,
  sourcemap: 'external',
  platform: 'node',
  plugins: [
    notify,
    esbuildPluginNodeExternals({
      packagePaths: [path.resolve(source, 'package.json')]
    })
  ]
};

build(options).catch(err => {
  process.stderr.write(err.stderr);
  process.exit(1);
});
