import {GLPKBase, LP, LpOptions, LpResult} from './glpk-shared';

export interface GLPKAsync extends GLPKBase {
  write(lp: LP): Promise<string>; /* writes problem data in CPLEX LP */
  solve(lp: LP, options?: number | LpOptions): Promise<LpResult> /* options is either a glp message level or an options obj */
}

export declare function GLPKAsyncConstructor(): Promise<GLPKAsync>;
