import tape from 'tape';
import fs from 'fs';
import almostEqual from 'almost-equal';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import GLPK from '../dist/glpk.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

tape('test LP/MIP & compare against native node-glpk', { timeout: 99999 }, async (t) => {
    /** @type {import('../src/glpk.d.ts').GLPK} */
    const glpk = await GLPK();
    const problems = [
        ['lp', 0.45999999999999996],
        ['diet_large', -500.37199169354767],
        ['mip', 122.5],
        ['mip2', -8.233333333333334]
    ];
    for (const [problemName, expectedSolution] of problems) {
        const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/${problemName}.json`).toString());
        const result = glpk.solve(lp, {
            rows: true,
            cb: {
                call: (res) => {
                    console.log(res.z);
                },
                each: 10
            }
        }).result;
        t.ok(
            almostEqual(result.z, expectedSolution, almostEqual.FLT_EPSILON),
            `Solved ${problemName}`
        );
        // Verify rows are returned and match constraint count
        const rowCount = Object.keys(result.rows || {}).length;
        t.equal(rowCount, lp.subjectTo.length, `${problemName} has ${rowCount} row values`);
    }
    t.end();
});

tape('MIP callback receives scalars without solutions flag', { timeout: 99999 }, async (t) => {
    /** @type {import('../src/glpk.d.ts').GLPK} */
    const glpk = await GLPK();
    const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/mip2.json`).toString());
    const incumbents = [];
    const result = glpk.solve(lp, {
        cb: {
            call: (res) => {
                incumbents.push(res);
            }
        }
    });

    t.ok(
        almostEqual(result.result.z, -8.233333333333334, almostEqual.FLT_EPSILON),
        'Final objective value is correct'
    );

    t.ok(incumbents.length > 0, `Received ${incumbents.length} incumbent(s)`);

    for (const inc of incumbents) {
        t.ok(typeof inc.z === 'number', 'Incumbent has z');
        t.ok(typeof inc.mipgap === 'number', 'Incumbent has mipgap');
        t.ok(typeof inc.reason === 'number', 'Incumbent has reason');
        t.equal(inc.getSolution, undefined, 'getSolution is not present');
    }

    t.end();
});

tape('MIP callback with solutions: true provides getSolution()', { timeout: 99999 }, async (t) => {
    /** @type {import('../src/glpk.d.ts').GLPK} */
    const glpk = await GLPK();
    const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/mip2.json`).toString());
    const incumbents = [];
    const result = glpk.solve(lp, {
        rows: true,
        cb: {
            call: (res) => {
                const sol = res.getSolution();
                incumbents.push({ z: res.z, mipgap: res.mipgap, ...sol });
            },
            solutions: true
        }
    });

    t.ok(
        almostEqual(result.result.z, -8.233333333333334, almostEqual.FLT_EPSILON),
        'Final objective value is correct'
    );

    t.ok(incumbents.length > 0, `Received ${incumbents.length} incumbent(s)`);

    for (const inc of incumbents) {
        t.ok(typeof inc.z === 'number', 'Incumbent has z');
        t.ok(typeof inc.vars === 'object' && inc.vars !== null, 'Incumbent has vars');
        t.ok(typeof inc.mipgap === 'number', 'Incumbent has mipgap');
        t.ok(typeof inc.rows === 'object' && inc.rows !== null, 'Incumbent has rows');
    }

    t.end();
});

tape('MIP without callback still works correctly', { timeout: 99999 }, async (t) => {
    /** @type {import('../src/glpk.d.ts').GLPK} */
    const glpk = await GLPK();
    const problems = [
        ['mip', 122.5],
        ['mip2', -8.233333333333334]
    ];
    for (const [problemName, expectedSolution] of problems) {
        const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/${problemName}.json`).toString());
        const result = glpk.solve(lp);
        t.ok(
            almostEqual(result.result.z, expectedSolution, almostEqual.FLT_EPSILON),
            `Solved ${problemName} without callback`
        );
    }
    t.end();
});

tape('MIP callback throwing does not leak function pointer', { timeout: 99999 }, async (t) => {
    /** @type {import('../src/glpk.d.ts').GLPK} */
    const glpk = await GLPK();
    const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/mip2.json`).toString());

    t.throws(
        () => {
            glpk.solve(lp, {
                cb: {
                    call: () => {
                        throw new Error('intentional callback error');
                    }
                }
            });
        },
        /intentional callback error/,
        'Error from callback propagates'
    );

    // Solve again without callback to verify the Wasm runtime is not corrupted
    const result = glpk.solve(lp);
    t.ok(
        almostEqual(result.result.z, -8.233333333333334, almostEqual.FLT_EPSILON),
        'Solver still works after callback error'
    );

    t.end();
});

tape(
    'The time limit should kill the solver before finding optimal solution',
    { timeout: 99999 },
    async (t) => {
        /** @type {import('../src/glpk.d.ts').GLPK} */
        const glpk = await GLPK();
        const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/mip2.json`).toString());
        const sol = glpk.solve(lp, {
            tmlim: 0.001
        });

        t.equal(sol.result.status, 1, 'solution is undefined');
        t.equal(sol.result.vars.x1, 0, 'the variable has the value of zero');
        t.equal(sol.result.z, 0, 'objective function is zero');

        t.end();
    }
);
