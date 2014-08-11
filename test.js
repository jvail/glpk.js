var glpk = require('./glpk.js')
  , GLP = glpk.glpConstants()
  ;

/* linear problem */
(function () {
  /*
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
    name: 'LP',
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
          { name: 'x2', coef: 2.0 }
        ],
        bnds: { type: GLP.GLP_UP, ub: 1.0, lb: 0.0 } 
      },
      { 
        name: 'cons2',
        vars: [ 
          { name: 'x1', coef: 3.0 },
          { name: 'x2', coef: 1.0 }
        ],
        bnds: { type: GLP.GLP_UP, ub: 2.0, lb: 0.0 } 
      }      
    ]
  };

  var result = glpk.solve(LP, GLP.GLP_MSG_ALL);
  console.log(result);

}());

/* mixed integer */
(function () {
  /*

    Maximize
      obj: x1 + 2 x2 + 3 x3 + x4
    Subject To
      c1: - x1 + x2 + x3 + 10 x4 <= 20
      c2: x1 - 3 x2 + x3 <= 30
      c3: x2 - 3.5 x4 = 0
    Bounds
      0 <= x1 <= 40
      2 <= x4 <= 3
    General
      x4
    End

    Rows:       3
    Columns:    4 (1 integer, 0 binary)
    Non-zeros:  9
    Status:     INTEGER OPTIMAL
    Objective:  obj = 122.5 (MAXimum)

       No.   Row name        Activity     Lower bound   Upper bound
    ------ ------------    ------------- ------------- -------------
         1 c1                         20                          20 
         2 c2                         28                          30 
         3 c3                          0             0             = 

       No. Column name       Activity     Lower bound   Upper bound
    ------ ------------    ------------- ------------- -------------
         1 x1                         40             0            40 
         2 x2                       10.5             0               
         3 x3                       19.5             0               
         4 x4           *              3             2             3 
  */

  var LP = {
    name: 'MIP',
    objective: {
      direction: GLP.GLP_MAX,
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
        bnds: { type: GLP.GLP_UP, ub: 20.0, lb: 0.0 } 
      },
      { 
        name: 'c2',
        vars: [ 
          { name: 'x1', coef: 1.0 },
          { name: 'x2', coef: -3.0 },
          { name: 'x3', coef: 1.0 }
        ],
        bnds: { type: GLP.GLP_UP, ub: 30.0, lb: 0.0 } 
      },
      { 
        name: 'c3',
        vars: [ 
          { name: 'x2', coef: 1.0 },
          { name: 'x4', coef: -3.5 }
        ],
        bnds: { type: GLP.GLP_FX, ub: 0.0, lb: 0.0 } 
      }      
    ],
    bounds: [
      { 
        name: 'x1', 
        type: GLP.GLP_DB,
        ub: 40.0,
        lb: 0.0
      },
      { 
        name: 'x4',
        type: GLP.GLP_DB,
        ub: 3.0,
        lb: 2.0
      }
    ],
    generals: ['x4']
  };
     
  var result = glpk.solve(LP, GLP.GLP_MSG_ALL);
  console.log(result);

}());

/* binaries */
(function () {

  /*

    Minimize
      obj: - x1 - 2 x2 + 0.1 x3 + 3 x4
    Subject To
      c1: x1 + x2 <= 5
      c2: 2 x1 - x2 >= 0
      c3: -x1 + 3 x2 >= 0
      c4: x3 + x4 >= 0.5
    Binaries
      x3
      x4
    End

    Rows:       4
    Columns:    4 (2 integer, 2 binary)
    Non-zeros:  8
    Status:     INTEGER OPTIMAL
    Objective:  obj = -8.233333333 (MINimum)

       No.   Row name        Activity     Lower bound   Upper bound
    ------ ------------    ------------- ------------- -------------
         1 c1                          5                           5 
         2 c2                          0             0               
         3 c3                    8.33333             0               
         4 c4                          1           0.5               

       No. Column name       Activity     Lower bound   Upper bound
    ------ ------------    ------------- ------------- -------------
         1 x1                    1.66667             0               
         2 x2                    3.33333             0               
         3 x3           *              1             0             1 
         4 x4           *              0             0             1   

  */

  var LP = {
    name: 'MIP with binaries',
    objective: {
      direction: GLP.GLP_MIN,
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
        bnds: { type: GLP.GLP_UP, ub: 5.0, lb: 0.0 } 
      },
      { 
        name: 'c2',
        vars: [ 
          { name: 'x1', coef: 2.0 },
          { name: 'x2', coef: -1.0 }
        ],
        bnds: { type: GLP.GLP_LO, ub: 0.0, lb: 0.0 } 
      },
      { 
        name: 'c3',
        vars: [ 
          { name: 'x1', coef: -1.0 },
          { name: 'x2', coef: 3.0 }
        ],
        bnds: { type: GLP.GLP_LO, ub: 0.0, lb: 0.0 } 
      },
      { 
        name: 'c4',
        vars: [ 
          { name: 'x3', coef: 1.0 },
          { name: 'x4', coef: 1.0 }
        ],
        bnds: { type: GLP.GLP_LO, ub: 0.0, lb: 0.5 } 
      }      
    ],
    binaries: ['x3', 'x4']
  };
     
  var result = glpk.solve(LP, GLP.GLP_MSG_ALL);
  console.log(result);
  
}());
