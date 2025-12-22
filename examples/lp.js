/**
 * @typedef {import('../dist/glpk.d.ts').GLPK} GLPK
 * @typedef {import('../dist/glpk.d.ts').LP} LP
 * @typedef {import('../dist/glpk.d.ts').Options} Options
 * @typedef {import('../dist/glpk.d.ts').Result} Result
 */

import GLPK from '../dist/index.js';

(async () => {
    /** @type {GLPK} */
    const glpk = await GLPK();

    /**
     * Display the result in the output element
     * @param {Result} res - The solve result
     */
    function print(res) {
        const el = window.document.getElementById('out');
        el.innerHTML = `Solution: LP \n\n ${JSON.stringify(res, null, 2)}`;
    }

    /** @type {LP} */
    const lp = {
        name: 'LP',
        objective: {
            direction: glpk.GLP_MAX,
            name: 'obj',
            vars: [
                { name: 'x1', coef: 0.6 },
                { name: 'x2', coef: 0.5 }
            ]
        },
        subjectTo: [
            {
                name: 'cons1',
                vars: [
                    { name: 'x1', coef: 1.0 },
                    { name: 'x2', coef: 2.0 }
                ],
                bnds: { type: glpk.GLP_UP, ub: 1.0, lb: 0.0 }
            },
            {
                name: 'cons2',
                vars: [
                    { name: 'x1', coef: 3.0 },
                    { name: 'x2', coef: 1.0 }
                ],
                bnds: { type: glpk.GLP_UP, ub: 2.0, lb: 0.0 }
            }
        ]
    };

    /** @type {Options} */
    const opt = {
        msglev: glpk.GLP_MSG_DBG,
        rows: true
    };

    /** @type {Result} */
    const res = await glpk.solve(lp, opt);
    print(res);

    window.document.getElementById('cplex').innerHTML = await glpk.write(lp);

    // Terminate worker and free shared resources
    glpk.terminate();
})();
