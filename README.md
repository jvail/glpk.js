# glpk.js

JavaScript/WebAssembly port of GLPK (GNU Linear Programming Kit) for browser & node. Rather than porting the complete GLPK library (including GLPSOL) this project aims at creating a simple JSON interface to setup and solve LP/MILP with JavaScript.

## Install

```sh
npm install glpk.js
```

## Examples

Minimal live example: https://jvail.github.io/glpk.js/examples/lp.html

```js
import GLPK from 'glpk.js';

const glpk = await GLPK();
const options = {
    msglev: glpk.GLP_MSG_ALL,
    presol: true
};
const result = await glpk.solve({
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

Large LP with simplex callback (600x600 transportation problem):

* https://jvail.github.io/glpk.js/examples/lp-large.html

Some (slightly outdated) examples using glpk.js:

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


For full TypeScript definitions (`Options`, `Result`, `GLPK`, `GLPKSync`), see [src/glpk.d.ts](src/glpk.d.ts).

## Building

### emsdk

Built with emsdk 4.0.x.

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
