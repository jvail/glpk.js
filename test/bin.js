const glpk = require('../glpk.js');
const assert = require('assert');

assert.deepStrictEqual(
glpk.solve(
{
	name: 'MIP with binaries',
	objective: {
		direction: glpk.GLP_MIN,
		name: 'obj',
		vars: [
			{ name: 'x1', coef: -1.0 },
			{ name: 'x2', coef: -2.0 },
			{ name: 'x3', coef: 0.1 },
			{ name: 'x4', coef: 3.0 }
		]
	},
	subjectTo: [
		{
			name: 'c1',
			vars: [
				{ name: 'x1', coef: 1.0 },
				{ name: 'x2', coef: 1.0 }
			],
			bnds: { type: glpk.GLP_UP, ub: 5.0, lb: 0.0 }
		},
		{
			name: 'c2',
			vars: [
				{ name: 'x1', coef: 2.0 },
				{ name: 'x2', coef: -1.0 }
			],
			bnds: { type: glpk.GLP_LO, ub: 0.0, lb: 0.0 }
		},
		{
			name: 'c3',
			vars: [
				{ name: 'x1', coef: -1.0 },
				{ name: 'x2', coef: 3.0 }
			],
			bnds: { type: glpk.GLP_LO, ub: 0.0, lb: 0.0 }
		},
		{
			name: 'c4',
			vars: [
				{ name: 'x3', coef: 1.0 },
				{ name: 'x4', coef: 1.0 }
			],
			bnds: { type: glpk.GLP_LO, ub: 0.0, lb: 0.5 }
		}
	],
	binaries: ['x3', 'x4']
},
glpk.GLP_MSG_ALL
).result,
{ vars: { x1: 1.6666666666666667, x2: 3.3333333333333335, x3: 1, x4: 0 }, z: -8.233333333333334, status: 5 }
);
