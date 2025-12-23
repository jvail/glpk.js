import type { LP, Options, Result, GLPKConstants } from './types.js';
export type { LP, Options, Result };

/** Synchronous GLPK interface (Node.js) */
export interface GLPK extends GLPKConstants {
    /** Write problem data in CPLEX LP format */
    write(lp: LP): string;
    /** Solve LP/MIP problem synchronously */
    solve(lp: LP, options?: number | Options): Result;
}

/** Factory function for Node.js (sync) */
declare const GLPK: () => Promise<GLPK>;
export default GLPK;
