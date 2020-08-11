const _ = require('lodash')
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
			const settings = json.settings
			let z1, z2 = glpkjs.solve(json, settings).result.z;

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
    const problem = 'mip2'
    let json = JSON.parse(fs.readFileSync(`${__dirname}/data/${problem}.json`).toString());
    const settings = _.defaults({tmLim: 1}, json.settings)
    
    const sol = glpkjs.solve(json, settings);

    t.equal(1, sol.result.status, 'solution is undefined')
    t.equal(0, sol.result.vars.x1, 'the variable has the value of zero')
    t.equal(0, sol.result.z, 'objective function is zero')
    
    t.end();
  });

});
