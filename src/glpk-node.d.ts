import {GLPKSyncConstructor} from './glpk-sync';
import {GLPKAsyncConstructor} from './glpk-async';


/**
 * Synchronous constructor for GLPK Node.js version.
 * Returns a GLPK instance running directly in Node.js.
 */
export declare const glpkSync: typeof GLPKSyncConstructor;

/**
 * Asynchronous constructor for GLPK Node.js version.
 * Returns a Promise that resolves to a GLPK instance running directly in Node.js.
 *
 * This only wraps the synchronous creation of the GLPK instance.
 * Despite the typing of the main functions like `solve()` is async, it's actually called synchronously.
 *
 * If the runtime will be node.js only,
 * it's recommended to call `glpkSync()` for creating the GLPK instance explicitly.
 */
export declare const glpkAsync: typeof GLPKAsyncConstructor;

export default GLPKSyncConstructor;
