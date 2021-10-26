const fs = require('fs');
const assert = require('assert');
const GLPK = require('../dist/glpk.js');

const glpk = GLPK();
const lp = JSON.parse(fs.readFileSync(__dirname + '/data/mem.json').toString());

// should never give an out of memory error
for (let i = 0; i < 100; i++) {
    console.log(i);
    assert(glpk.solve(lp, glpk.GLP_MSG_OFF).result.status == glpk.GLP_OPT);
}
