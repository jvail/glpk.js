import {GLPKBase, LP, LpOptions, LpResult} from './glpk-shared';

export interface GLPKNode extends GLPKBase {

  write(lp: LP): string; /* writes problem data in CPLEX LP */
  solve(lp: LP, options?: number | LpOptions): LpResult /* options is either a glp message level or an options obj */
  terminate(): void; /* terminates the GLPK worker */

}

/**
 * Constructor for GLPK Node.js version.
 * Returns a GLPK instance running directly in Node.js.
 */
declare const GLPKNodeConstructor: () => GLPKNode;
export default GLPKNodeConstructor;
