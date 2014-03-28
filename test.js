var glpk = require('./glpk.js')
  , GLP = glpk.glpConstants()
  ;

/*
  http://en.wikibooks.org/wiki/GLPK/Using_the_GLPK_callable_library
  
  maximize    0.6x1 + 0.5x2
  subject to  x1 + 2x2 <= 1
              3x1 + x2 <= 2

  GLPK Simplex Optimizer, v4.53
  2 rows, 2 columns, 4 non-zeros
  *     0: obj =   0.000000000e+00  infeas =  0.000e+00 (0)
  *     2: obj =   4.600000000e-01  infeas =  0.000e+00 (0)
  OPTIMAL LP SOLUTION FOUND
  z = 0.46; x1 = 0.6; x2 = 0.2
*/

var LP = {
  name: 'test',
  objective: {
    direction: GLP.GLP_MAX,
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
        { name: 'x2', coef: 2.0 },
      ],
      bnds: { type: GLP.GLP_UP, ub: 1.0, lb: 0.0 } 
    },
    { 
      name: 'cons2',
      vars: [ 
        { name: 'x1', coef: 3.0 },
        { name: 'x2', coef: 1.0 },
      ],
      bnds: { type: GLP.GLP_UP, ub: 2.0, lb: 0.0 } 
    }      
  ],
  bounds: [
    { 
      vars: [ 
        { name: 'x1', coef: 1.0 }
      ], 
      bnds: { type: GLP.GLP_LO, ub: 0.0, lb: 0.0 }
    },
    { 
      vars: [ 
        { name: 'x2', coef: 1.0 }
      ], 
      bnds: { type: GLP.GLP_LO, ub: 0.0, lb: 0.0 }
    }
  ]
};

var result = glpk.solve(LP, GLP.GLP_MSG_ALL);
console.log(result);      
