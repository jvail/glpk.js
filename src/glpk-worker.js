import GLPK from './glpk.js';
let glpk;
self.onmessage = function (evt) {
    if (glpk) {
        const { cmd, lp, opt, cb } = evt.data;
        switch (cmd) {
            case 'solve':
                if (cb) {
                    opt.cb = {
                        call: res => {
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
                break;
        }
    } else {
        const { wasmBinary } = evt.data
        glpk = GLPK(wasmBinary);
        self.postMessage(Object.keys(glpk).reduce((flags, key) => {
            if (typeof glpk[key] === 'number' || typeof glpk[key] === 'string') {
                flags[key] = glpk[key];
            }
            return flags;
        }, {}));
    }
}
