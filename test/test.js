const tape = require('tape');
const fs = require('fs');
const almostEqual = require('almost-equal');
const glpk = require('glpk');

require('../glpk.js').then(glpkjs => {

    tape('test LP/MIP & compare against native node-glpk', { timeout: 99999 }, t => {
        [
            'lp',
            'diet_large',
            'mip',
            'mip2'
        ].map(d => {

            let json = JSON.parse(fs.readFileSync(`${__dirname}/data/${d}.json`).toString());
            let prob = new glpk.Problem();

            let z1, z2 = glpkjs.solve(json, glpkjs.GLP_MSG_ALL).result.z;

            prob.readLpSync(`${__dirname}/data/${d}.lp`);
            prob.scaleSync(glpk.SF_AUTO);
            prob.simplexSync({
                presolve: glpk.ON,
                msgLev: glpk.MSG_ERR
            });
            if (prob.getNumInt() > 0) {
                prob.intoptSync();
                z1 = prob.mipObjVal();
            } else {
                z1 = prob.getObjVal()
            }
            prob.delete();

            return [z1, z2, d];

        }).forEach(z => {
            t.ok(almostEqual(z[0], z[1], almostEqual.FLT_EPSILON), z[2]);
        })
        t.end();
    });

  tape('The time limit should kill the solver before finding optimal solution', { timeout: 99999 }, t => {

    const lp = JSON.parse(fs.readFileSync(`${__dirname}/data/mip2.json`).toString());
      const sol = glpkjs.solve(lp, {
          tmlim: 0.001
      });

    t.equal(sol.result.status, 1, 'solution is undefined')
    t.equal(sol.result.vars.x1, 0, 'the variable has the value of zero')
    t.equal(sol.result.z, 0, 'objective function is zero')

    t.end();
  });

});
