# glpk.js

JavaScript/WebAssembly port of GLPK (GNU Linear Programming Kit) for browser & node. Rather than porting the complete GLPK library (including GLPSOL) this project aims at creating a simple JSON interface to setup and solve LP/MILP with JavaScript.

## Install

```sh
npm install glpk.js
```

## Examples

Minimal live example: https://jvail.github.io/glpk.js/examples/lp.html

```js
const GLPK = require('glpk.js');
const glpk = GLPK();
const options = {
    msglev: glpk.GLP_MSG_ALL,
    presol: true,
    cb: {
        call: progress => console.log(progress),
        each: 1
    }
};
const res = glpk.solve({
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
}, options);
```
## Other Examples

glpk.js and Mixed-Integer Programming with a lot of background information:

* https://observablehq.com/@tomlarkworthy/mip

Simple LP in the browser:

* https://jvail.github.io/glpk.js/examples/lp.html

Some (slighty outdated) examples using glpk.js:

* https://jvail.github.io/dairy.js
* https://jvail.github.io/solid-dss


## API

```typescript
interface LP {
    name: string,
    objective: {
        direction: number,
        name: string,
        vars: { name: string, coef: number }[]
    },
    subjectTo: {
        name: string,
        vars: { name: string, coef: number }[],
        bnds: { type: number, ub: number, lb: number }
    }[],
    bounds?: {
        name: string,
        type: number,
        ub: number,
        lb: number
    }[],
    binaries?: string[],
    generals?: string[],
    options?: Options
}
```

Optionally the "kind of structural variable"

* continuous variable (default)
* integer variable
* binary variable

may be specified with an array of variable names:

```js
  /* integer */
  lp.generals = ['x1', 'x2'];

  /* binary */
  lp.binaries = ['x3', 'x4'];
```


```typescript
interface Options {
    mipgap?: number,    /* set relative mip gap tolerance to mipgap, default 0.0 */
    tmlim?: number,     /* limit solution time to tmlim seconds, default INT_MAX */
    msglev?: number,    /* message level for terminal output, default GLP_MSG_ERR */
    presol?: boolean,   /* use presolver, default true */
    cb?: {              /* a callback called at each 'each' iteration (only simplex) */
        call(result: Result),
        each: number
    }
}

interface Result {
    name: string;
    time: number;
    result: {
        status: number;
        z: number;
        vars: {[key:string]: number};
        dual?: { [key: string]: number }; /* simplex only */
    };
}

interface GLPK {

    /* direction */
    readonly GLP_MIN: number;  /* minimization */
    readonly GLP_MAX: number;  /* maximization */

    /* type of auxiliary/structural variable: */
    readonly GLP_FR: number;  /* free (unbounded) variable */
    readonly GLP_LO: number;  /* variable with lower bound */
    readonly GLP_UP: number;  /* variable with upper bound */
    readonly GLP_DB: number;  /* double-bounded variable */
    readonly GLP_FX: number;  /* fixed variable */

    /* message level: */
    readonly GLP_MSG_OFF: number;  /* no output */
    readonly GLP_MSG_ERR: number;  /* warning and error messages only */
    readonly GLP_MSG_ON: number;   /* normal output */
    readonly GLP_MSG_ALL: number;  /* full output */
    readonly GLP_MSG_DBG: number;  /* debug output */

    /* solution status: */
    readonly GLP_UNDEF: number;   /* solution is undefined */
    readonly GLP_FEAS: number;    /* solution is feasible */
    readonly GLP_INFEAS: number;  /* solution is infeasible */
    readonly GLP_NOFEAS: number;  /* no feasible solution exists */
    readonly GLP_OPT: number;     /* solution is optimal */
    readonly GLP_UNBND: number;   /* solution is unbounded */

    version: string;  /* GLPK version */
    write(lp: LP): string; /* writes problem data in CPLEX LP */
    solve(lp: LP, options?: number | Options): Result /* options is either a glp message level or an options obj */
}
```

## Building

### emsdk

Built with emsdk 2.0.34 (quite outdated - but more recent 3.x versions would require some refactoring...).

```sh
git clone https://github.com/jvail/glpk.js.git
cd glpk.js
git submodule update --init --recursive
npm install
source ~/emsdk/emsdk_env.sh
npm run build && npm run test
```

### docker

Uses official docker images for [emscripten/emsdk](https://hub.docker.com/r/emscripten/emsdk/tags).

```sh
docker build . -t glpk.js
docker run -v $PWD:/app glpk.js
```
