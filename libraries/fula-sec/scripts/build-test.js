import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { build } from 'esbuild';
// import browserify from 'browserify';
// import * as fs from 'fs'

await build({
  entryPoints: ['tests/asym.enc.test.ts','tests/tagged.enc.test.ts','tests/wallet.test.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outExtension: {'.js':'.cjs'},
  outdir: 'dist/test/',
});

// const b = browserify()
// b.add('dist/temp.js')
// const stream = b.bundle()
// const dest = fs.createWriteStream('dist/test.js')
// stream.pipe(dest)
//
// stream.once('end',()=>{
//   fs.rmSync('dist/temp.js')
// })




