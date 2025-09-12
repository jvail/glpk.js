import glpk from './glpk.js';

// Synchronous version of the constructor
export const glpkSync = () => glpk();

// Asynchronous version of the constructor
export const glpkAsync = () => Promise.resolve(glpk());

// Default export is still sync for backward compatibility
export default glpkAsync;
