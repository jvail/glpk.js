/**
 * @typedef {import('./glpk.d.ts').GLPK} GLPK
 * @typedef {import('./glpk.d.ts').LP} LP
 * @typedef {import('./glpk.d.ts').Options} Options
 * @typedef {import('./glpk.d.ts').Result} Result
 */

/**
 * @typedef {Object} WorkerCommand
 * @property {string} cmd - Command type ('solve' or 'write')
 * @property {LP} lp - Linear program
 * @property {Options} [opt] - Solver options
 * @property {number} [cb] - Callback frequency
 */

/**
 * @typedef {Object} InitMessage
 * @property {ArrayBuffer} wasmBinary - WebAssembly binary
 */

import GLPKFactory from './glpk.js';

/**
 * Web Worker for GLPK.
 *
 * Note: The Emscripten-generated code uses `import.meta.url` to locate the WASM file.
 * Since this worker runs from a Blob URL (not an ES module), `import.meta` is not available.
 *
 * Workarounds applied:
 * 1. rollup.config.js replaces `import.meta.url` with `self.location.href` when bundling
 * 2. We pass `locateFile: () => ''` to prevent URL construction errors
 * 3. We pass `wasmBinary` directly so the WASM file doesn't need to be located
 */

/** @type {GLPK|null} */
let glpk = null;

/**
 * Handle messages from the main thread
 * @param {MessageEvent<WorkerCommand|InitMessage>} evt - Message event
 */
self.onmessage = async function (evt) {
    try {
        if (glpk) {
            const { cmd, lp, opt, cb } = /** @type {WorkerCommand} */ (evt.data);
            switch (cmd) {
                case 'solve':
                    if (cb) {
                        opt.cb = {
                            call: (res) => {
                                postMessage({ cb: res });
                            },
                            each: cb
                        };
                    }
                    postMessage({ res: glpk.solve(lp, opt) });
                    break;
                case 'write':
                    postMessage({ res: glpk.write(lp) });
                    break;
                default:
                    postMessage({ error: { message: `Unknown command: ${cmd}`, name: 'Error' } });
                    break;
            }
        } else {
            const { wasmBinary } = /** @type {InitMessage} */ (evt.data);
            glpk = await GLPKFactory({ wasmBinary, locateFile: () => '' });
            self.postMessage(
                Object.keys(glpk).reduce((flags, key) => {
                    if (typeof glpk[key] === 'number' || typeof glpk[key] === 'string') {
                        flags[key] = glpk[key];
                    }
                    return flags;
                }, {})
            );
        }
    } catch (err) {
        postMessage({
            error: {
                message: err.message || String(err),
                name: err.name || 'Error'
            }
        });
    }
};
