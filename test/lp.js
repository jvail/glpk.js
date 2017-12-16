const glpk = require('../glpk.js');
const assert = require('assert');

assert.deepStrictEqual(
glpk.solve(
{
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
},
glpk.GLP_MSG_ALL
).result,
{ vars: { x1: 0.6, x2: 0.2 }, z: 0.45999999999999996, status: 5 }
);
