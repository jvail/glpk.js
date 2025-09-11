import {GLPKBase, LP, LpOptions, LpResult} from './glpk-shared';

export interface GLPKWebWorker extends GLPKBase {

  write(lp: LP): Promise<string>; /* writes problem data in CPLEX LP */
  solve(lp: LP, options?: number | LpOptions): Promise<LpResult> /* options is either a glp message level or an options obj */
  terminate(): void; /* terminates the GLPK worker */

}

/**
 * Constructor for GLPK web worker version.
 * Returns a Promise that resolves to a GLPK instance running in a web worker.
 */
declare const GLPKWebWorkerConstructor: () => Promise<GLPKWebWorker>;
export default GLPKWebWorkerConstructor;
