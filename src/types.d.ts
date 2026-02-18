export interface LP {
    name: string;
    objective: {
        direction: number;
        name: string;
        vars: { name: string; coef: number }[];
    };
    subjectTo: {
        name: string;
        vars: { name: string; coef: number }[];
        bnds: { type: number; ub: number; lb: number };
    }[];
    bounds?: {
        name: string;
        type: number;
        ub: number;
        lb: number;
    }[];
    binaries?: string[];
    generals?: string[];
    options?: Options;
}

export interface Options {
    mipgap?: number; /* set relative mip gap tolerance to mipgap, default 0.0 */
    tmlim?: number; /* limit solution time to tmlim seconds, default INT_MAX */
    msglev?: number; /* message level for terminal output, default GLP_MSG_ERR */
    presol?: boolean; /* use presolver, default true */
    rows?: boolean; /* include constraint/row values in result, default false */
    cb?: {
        /* callback called at each 'each' iteration (LP only, ignored for MIP). Note: presol is disabled when cb is supplied. */
        call(result: Result): void;
        each: number;
    } | {
        /* Called when the MIP solver finds a better integer feasible solution */
        call(result: MIPCallbackResult): void;
        solutions?: boolean; /* if true, getSolution() is available in the callback */
    };
}

export interface Result {
    name: string;
    time: number;
    result: {
        status: number;
        z: number;
        vars: { [key: string]: number };
        dual?: { [key: string]: number }; /* simplex only */
        rows?: { [key: string]: number }; /* constraint values, when rows option is true */
    };
}

export interface MIPCallbackResult {
    reason: number; /* reason code (e.g. GLP_IBINGO) */
    status: number;
    z: number;
    mipgap: number; /* relative MIP gap */
    /** Returns the full solution (vars and optionally rows). Only available when solutions: true. Must be called synchronously during the callback. */
    getSolution?(): { vars: { [key: string]: number }; rows?: { [key: string]: number } };
}

/** Base GLPK constants */
export interface GLPKConstants {
    /* direction */
    readonly GLP_MIN: number; /* minimization */
    readonly GLP_MAX: number; /* maximization */

    /* type of auxiliary/structural variable: */
    readonly GLP_FR: number; /* free (unbounded) variable */
    readonly GLP_LO: number; /* variable with lower bound */
    readonly GLP_UP: number; /* variable with upper bound */
    readonly GLP_DB: number; /* double-bounded variable */
    readonly GLP_FX: number; /* fixed variable */

    /* message level: */
    readonly GLP_MSG_OFF: number; /* no output */
    readonly GLP_MSG_ERR: number; /* warning and error messages only */
    readonly GLP_MSG_ON: number; /* normal output */
    readonly GLP_MSG_ALL: number; /* full output */
    readonly GLP_MSG_DBG: number; /* debug output */

    /* solution status: */
    readonly GLP_UNDEF: number; /* solution is undefined */
    readonly GLP_FEAS: number; /* solution is feasible */
    readonly GLP_INFEAS: number; /* solution is infeasible */
    readonly GLP_NOFEAS: number; /* no feasible solution exists */
    readonly GLP_OPT: number; /* solution is optimal */
    readonly GLP_UNBND: number; /* solution is unbounded */

    /* reason codes for MIP callback: */
    readonly GLP_IROWGEN: number; /* request for row generation */
    readonly GLP_IBINGO: number; /* better integer solution found */
    readonly GLP_IHEUR: number; /* request for heuristic solution */
    readonly GLP_ICUTGEN: number; /* request for cut generation */
    readonly GLP_IBRANCH: number; /* request for branching */
    readonly GLP_ISELECT: number; /* request for subproblem selection */
    readonly GLP_IPREPRO: number; /* request for preprocessing */

    version: string; /* GLPK version */
}
