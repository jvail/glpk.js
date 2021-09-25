const fs = require('fs');
const pako = require('pako');

const wasm = Buffer.from(pako.deflate(fs.readFileSync('src/.build/glpk.wasm'), { level: 9 })).toString('base64');
fs.writeFileSync('src/.build/wasm.str.js', `export default "${wasm}"`);

const worker = Buffer.from(pako.deflate(fs.readFileSync('src/.build/worker.js'), { level: 9 })).toString('base64');
fs.writeFileSync('src/.build/worker.str.js', `export default "${worker}";\n`);
