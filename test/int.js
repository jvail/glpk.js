const glpk = require('../glpk.js');
const assert = require('assert');

assert.deepStrictEqual(
glpk.solve(
{
	name: 'MIP',
	objective: {
		direction: glpk.GLP_MAX,
		name: 'obj',
		vars: [
			{ name: 'x1', coef: 1.0 },
			{ name: 'x2', coef: 2.0 },
			{ name: 'x3', coef: 3.0 },
			{ name: 'x4', coef: 1.0 }
		]
	},
	subjectTo: [
		{
			name: 'c1',
			vars: [
				{ name: 'x1', coef: -1.0 },
				{ name: 'x2', coef: 1.0 },
				{ name: 'x3', coef: 1.0 },
				{ name: 'x4', coef: 10.0 }
			],
			bnds: { type: glpk.GLP_UP, ub: 20.0, lb: 0.0 }
		},
		{
			name: 'c2',
			vars: [
				{ name: 'x1', coef: 1.0 },
				{ name: 'x2', coef: -3.0 },
				{ name: 'x3', coef: 1.0 }
			],
			bnds: { type: glpk.GLP_UP, ub: 30.0, lb: 0.0 }
		},
		{
			name: 'c3',
			vars: [
				{ name: 'x2', coef: 1.0 },
				{ name: 'x4', coef: -3.5 }
			],
			bnds: { type: glpk.GLP_FX, ub: 0.0, lb: 0.0 }
		}
	],
	bounds: [
		{
			name: 'x1',
			type: glpk.GLP_DB,
			ub: 40.0,
			lb: 0.0
		},
		{
			name: 'x4',
			type: glpk.GLP_DB,
			ub: 3.0,
			lb: 2.0
		}
	],
	generals: ['x4']
},
glpk.GLP_MSG_ALL
).result,
{ vars: { x1: 40, x2: 10.5, x3: 19.5, x4: 3 }, z: 122.5, status: 5 }
);
