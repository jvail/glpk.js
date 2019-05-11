# glpk.js

JavaScript/WebAssembly (emscripten) port of GLPK (GNU Linear Programming Kit).

Rather than porting the complete GLPK library (including GLPSOL) this project aims at creating a simple JSON interface to setup and solve LP/MILP with JavaScript.

## Usage

```javascript
require('glpk.js').then(glpk => {

  let lp = {
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
  };

  console.log(
    glpk.solve(lp, glpk.GLP_MSG_ALL)
  );

});
```

## Examples
* http://jvail.github.io/dairy.js/
* https://zalf-lse.github.io/solid-dss/

## Acknowledgements

The research leading to these results has received funding from the European Community’s Seventh Framework Programme (FP7/2007–2013) under grant agreement No. FP7-266367 (SOLID).
