require('../glpk.js').then(glpk => {

	let lp = {
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
	};

	console.log(
		glpk.solve(lp, glpk.GLP_MSG_ALL)
	);

});

