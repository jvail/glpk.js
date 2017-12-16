const glpk = require('../glpk.js');
const assert = require('assert');

assert.equal(
glpk.write(
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
}
).replace(/(\r\n|\n|\r)/gm,''),
(`\\* Problem: LP *\\

Maximize
 obj: + 0.6 x1 + 0.5 x2

Subject To
 cons1: + x1 + 2 x2 <= 1
 cons2: + 3 x1 + x2 <= 2

Bounds
 0 <= x1 <= 1.79769313486232e+308
 0 <= x2 <= 1.79769313486232e+308

End`).replace(/(\r\n|\n|\r)/gm,'')
);
