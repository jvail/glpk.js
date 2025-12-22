/**
 * @typedef {import('./glpk.d.ts').GLPK} GLPK
 */

import glpk from './glpk.js';

/**
 * Factory function to create a GLPK instance for Node.js
 * @returns {Promise<GLPK>} GLPK instance
 */
export default () => glpk();
