/**
 * @typedef {import('./glpk.d.ts').GLPK} GLPK
 * @typedef {import('./glpk.d.ts').LP} LP
 * @typedef {import('./glpk.d.ts').Options} Options
 * @typedef {import('./glpk.d.ts').Result} Result
 */

/**
 * @typedef {Object} WorkItem
 * @property {function(Result): void} resolve - Promise resolve function
 * @property {function(Error): void} reject - Promise reject function
 * @property {function} [cb] - Callback function for progress
 */

/**
 * @typedef {Object} WorkerMessage
 * @property {string} cmd - Command type ('solve' or 'write')
 * @property {LP} lp - Linear program
 * @property {Object} [opt] - Options
 * @property {number} [cb] - Callback frequency
 */

/**
 * @typedef {Object} GLPKFlags
 * @property {number} GLP_MIN
 * @property {number} GLP_MAX
 * @property {number} GLP_FR
 * @property {number} GLP_LO
 * @property {number} GLP_UP
 * @property {number} GLP_DB
 * @property {number} GLP_FX
 * @property {number} GLP_MSG_OFF
 * @property {number} GLP_MSG_ERR
 * @property {number} GLP_MSG_ON
 * @property {number} GLP_MSG_ALL
 * @property {number} GLP_MSG_DBG
 * @property {number} GLP_UNDEF
 * @property {number} GLP_FEAS
 * @property {number} GLP_INFEAS
 * @property {number} GLP_NOFEAS
 * @property {number} GLP_OPT
 * @property {number} GLP_UNBND
 * @property {string} version
 */

import * as pako from 'pako';
import workerStr from './.build/worker.str.js';
import wasmStr from './.build/wasm.str.js';

/** @type {string|null} */
let workerURL = null;

/** @type {ArrayBuffer|null} */
let wasmBinary = null;

/**
 * Get or create the worker URL (lazy initialization)
 * @returns {string} Blob URL for the worker
 */
const getWorkerURL = () => {
    if (!workerURL) {
        workerURL = URL.createObjectURL(
            new Blob(
                [
                    pako.inflate(
                        Uint8Array.from(atob(workerStr), (c) => c.charCodeAt(0)),
                        { to: 'string' }
                    )
                ],
                { type: 'text/javascript' }
            )
        );
    }
    return workerURL;
};

/**
 * Get or create the WASM binary (lazy initialization)
 * @returns {ArrayBuffer} WASM binary
 */
const getWasmBinary = () => {
    if (!wasmBinary) {
        wasmBinary = pako.inflate(Uint8Array.from(atob(wasmStr), (c) => c.charCodeAt(0))).buffer;
    }
    return wasmBinary;
};

/**
 * Clean up shared resources (Blob URL and WASM binary)
 */
const cleanupResources = () => {
    if (workerURL) {
        URL.revokeObjectURL(workerURL);
        workerURL = null;
    }
    wasmBinary = null;
};

/**
 * Create a new web worker and wait for initialization
 * @returns {Promise<[Worker, GLPKFlags]>} Worker and GLPK flags
 */
const createWorker = () => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(getWorkerURL());
        worker.onmessage = (evt) => {
            resolve([worker, evt.data]);
        };
        worker.onerror = (err) => {
            reject(err.message);
        };
        worker.postMessage({ wasmBinary: getWasmBinary() });
    });
};

/**
 * GLPK web worker wrapper constructor
 * @param {Worker} wkr - Web worker instance
 * @param {GLPKFlags} flags - GLPK constants and version
 * @constructor
 */
const glpk = function (wkr, flags) {
    // @ts-ignore
    if (!new.target) return Object.freeze(new glpk(wkr, flags));
    Object.keys(flags).forEach((flag) => {
        this[flag] = flags[flag];
    });

    /** @type {WorkItem[]} */
    const work = [];

    /**
     * Post a message to the worker
     * @param {WorkerMessage} msg - Message to send
     * @param {Object} [cb] - Callback configuration
     * @returns {Promise<Result>} Promise resolving to result
     */
    const post = (msg, cb = {}) => {
        return new Promise((resolve, reject) => {
            msg.cb = cb.each;
            work.push({ resolve, reject, cb: cb.call });
            wkr.postMessage(msg);
        });
    };

    wkr.onmessage = (evt) => {
        const { cb, res, error } = evt.data;
        if (error) {
            const err = new Error(error.message);
            err.name = error.name;
            work.shift().reject(err);
        } else if (cb) {
            work[0].cb(cb);
        } else {
            work.shift().resolve(res);
        }
    };

    wkr.onerror = (evt) => {
        evt.preventDefault();
        const err = new Error(evt.message || 'Worker error');
        work.shift().reject(err);
    };

    /**
     * Solve a linear or mixed-integer program
     * @param {LP} lp - Linear program definition
     * @param {number|Options} [options] - Message level or options object
     * @returns {Promise<Result>} Solution result
     */
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

    /**
     * Write problem data in CPLEX LP format
     * @param {LP} lp - Linear program definition
     * @returns {Promise<string>} Problem in CPLEX LP format
     */
    this.write = (lp) => post({ cmd: 'write', lp });

    /**
     * Terminate the web worker
     * @param {boolean} [cleanup=true] - If true, also free shared Blob URL and WASM binary
     */
    this.terminate = (cleanup = true) => {
        wkr.terminate();
        if (cleanup) {
            cleanupResources();
        }
    };
};

/**
 * Factory function to create a GLPK instance with web worker
 * @returns {Promise<GLPK>} GLPK instance
 */
export default () => createWorker().then((args) => glpk(...args));
