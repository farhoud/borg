import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';



build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  target: 'node16',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  external: ['wrtc','libp2p'],
  tsconfig: 'tsconfig.json'
})
