import * as pako from 'pako';
import workerStr from './.build/worker.str.js';
import wasmStr from './.build/wasm.str.js';
const workerURL= URL.createObjectURL(new Blob([pako.inflate(Uint8Array.from(atob(workerStr), c => c.charCodeAt(0)), { to: 'string' })], { type: 'text/javascript' }));
const wasmBinary = pako.inflate(Uint8Array.from(atob(wasmStr), c => c.charCodeAt(0))).buffer;

const worker = () => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerURL);
        worker.onmessage = evt => {
            resolve([worker, evt.data]);
        };
        worker.onerror = err => {
            reject(err.message)
        };
        worker.postMessage({ wasmBinary });
    });
};


const glpk = function (wkr, flags) {

    // @ts-ignore
    if (!new.target) return Object.freeze(new glpk(wkr, flags));
    Object.keys(flags).forEach(flag => {
        this[flag] = flags[flag];
    });
    const work = [];
    const post = (msg, cb={}) => {
        return new Promise((resolve, reject) => {
            msg.cb = cb.each;
            work.push({ resolve, reject, cb: cb.call });
            wkr.postMessage(msg);
        });
    };

    wkr.onmessage = evt => {
        const { cb, res } = evt.data;
        if (cb) {
            work[0].cb(cb);
        } else {
            work.shift().resolve(res);
        }
    };

    wkr.onerror = evt => {
        evt.preventDefault();
        work.shift().reject(evt);
    };

    this.solve = (lp, options) => {
        options = options || lp.options || {};
        const opt = {
            ...(typeof options === 'number' ? { msglev: options } : options),
            cb: null
        };
        if (options.cb && options.cb.call && typeof options.cb.call === 'function') {
            return post({ cmd: 'solve', lp, opt }, options.cb);
        }
        return post({ cmd: 'solve', lp, opt });
    };

    this.write = lp => post({ cmd: 'write', lp });
    this.terminate = () => wkr.terminate();

};

export default () => worker().then(args => glpk(...args));
