import {GLPKAsyncConstructor} from './glpk-async';

export interface LP {
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
    options?: LpOptions
}

export interface LpOptions {
    mipgap?: number,    /* set relative mip gap tolerance to mipgap, default 0.0 */
    tmlim?: number,     /* limit solution time to tmlim seconds, default INT_MAX */
    msglev?: number,    /* message level for terminal output, default GLP_MSG_ERR */
    presol?: boolean,   /* use presolver, default true */
    cb?: {              /* a callback called at each 'each' iteration (only simplex) */
        call(result: LpResult),
        each: number
    }
}

export interface LpResult {
    name: string;
    time: number;
    result: {
        status: number;
        z: number;
        vars: {[key:string]: number};
        dual?: { [key: string]: number }; /* simplex only */
    };
}

export interface GLPKBase {

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
    terminate(): void; /* terminates the GLPK worker */

}

export {GLPKAsync, GLPKAsyncConstructor} from './glpk-async';
export {GLPKSync, GLPKSyncConstructor} from './glpk-sync';

/**
 * Returns an async GLPK instance regardless of the runtime environment.
 * To use the sync GLPK instance, call `glpkSync()` from `glpk.js/node` instead.
 *
 * This mainly serves as the entry point where GLPK can be used either in browser or node.js.
 * If you know that the GLPK instance will only run in node.js, it's recommended to use `glpkSync` instead.
 */
export default GLPKAsyncConstructor;
