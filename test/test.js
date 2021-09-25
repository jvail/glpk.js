const tape = require('tape');
const fs = require('fs');
const almostEqual = require('almost-equal');
const glpk = require('../dist/glpk.js');

tape('test LP/MIP & compare against native node-glpk', { timeout: 99999 }, t => {
    [
        ['lp', 0.45999999999999996],
        ['diet_large', -500.37199169354767],
        ['mip', 122.5],
        ['mip2', -8.233333333333334]
    ].forEach((d) => {
        const [problemName, expectedSolution] = d;
        const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/${problemName}.json`).toString());
        const z = glpk().solve(lp, {
            cb: {
                call: res => {
                console.log(res.z);
                },
                each: 10
            }
        }).result.z;
        t.ok(almostEqual(z, expectedSolution, almostEqual.FLT_EPSILON), `Solved ${problemName}`);
    })
    t.end();
});

tape('The time limit should kill the solver before finding optimal solution', { timeout: 99999 }, t => {

    const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/mip2.json`).toString());
        const sol = glpk().solve(lp, {
            tmlim: 0.001
        });

    t.equal(sol.result.status, 1, 'solution is undefined')
    t.equal(sol.result.vars.x1, 0, 'the variable has the value of zero')
    t.equal(sol.result.z, 0, 'objective function is zero')

    t.end();
});
