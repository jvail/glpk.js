import type { LP, Options, Result, GLPKConstants } from './types.js';
export type { LP, Options, Result };

/** Asynchronous GLPK interface (Browser with web worker) */
export interface GLPK extends GLPKConstants {
    /** Write problem data in CPLEX LP format */
    write(lp: LP): Promise<string>;
    /** Solve LP/MIP problem asynchronously */
    solve(lp: LP, options?: number | Options): Promise<Result>;
    /** Terminate the web worker. Set cleanup=false to keep shared resources for reuse. */
    terminate(cleanup?: boolean): void;
}

/** Factory function for browser (async, uses web worker) */
declare const GLPK: () => Promise<GLPK>;
export default GLPK;
