import {GLPKBase, LP, LpOptions, LpResult} from './glpk-shared';

export interface GLPKSync extends GLPKBase {
  write(lp: LP): string; /* writes problem data in CPLEX LP */
  solve(lp: LP, options?: number | LpOptions): LpResult /* options is either a glp message level or an options obj */
}

export declare function GLPKSyncConstructor(): GLPKSync;
