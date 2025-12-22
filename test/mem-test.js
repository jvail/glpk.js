/**
 * Memory test module - works in Node.js and browser
 *
 * Tests for memory leaks by running a large LP problem multiple times.
 * Reports memory usage to help diagnose issue #45.
 */

/**
 * @typedef {import('../src/types.d.ts').LP} LP
 * @typedef {import('../src/types.d.ts').GLPKConstants} GLPKConstants
 */

/**
 * @typedef {Object} GenerateOptions
 * @property {number} [numVars=200] - Number of variables
 * @property {number} [numConstraints=200] - Number of constraints
 * @property {boolean} [mip=false] - Generate MIP (with binary/integer vars) instead of LP
 * @property {number} [binaryRatio=0.3] - Ratio of binary variables (0-1) when mip=true
 * @property {number} [integerRatio=0.2] - Ratio of integer variables (0-1) when mip=true
 */

/**
 * Generate a large LP or MIP problem
 * @param {GLPKConstants} glpk - GLPK instance for constants
 * @param {GenerateOptions} [options] - Generation options
 * @returns {LP} Generated problem
 */
export function generateLargeProblem(glpk, options = {}) {
    const {
        numVars = 200,
        numConstraints = 200,
        mip = false,
        binaryRatio = 0.3,
        integerRatio = 0.2
    } = options;

    const vars = [];
    for (let i = 0; i < numVars; i++) {
        vars.push({ name: `x${i}`, coef: Math.random() });
    }

    const subjectTo = [];
    for (let i = 0; i < numConstraints; i++) {
        const constraintVars = [];
        // Each constraint uses a random subset of variables
        for (let j = 0; j < numVars; j++) {
            if (Math.random() > 0.5) {
                constraintVars.push({ name: `x${j}`, coef: Math.random() * 10 });
            }
        }
        // Ensure at least one variable per constraint
        if (constraintVars.length === 0) {
            constraintVars.push({ name: `x0`, coef: 1 });
        }
        subjectTo.push({
            name: `c${i}`,
            vars: constraintVars,
            bnds: { type: glpk.GLP_UP, ub: Math.random() * 100, lb: 0 }
        });
    }

    const problem = {
        name: mip ? 'large_mip' : 'large_lp',
        objective: {
            direction: glpk.GLP_MAX,
            name: 'obj',
            vars
        },
        subjectTo
    };

    // Add binary and integer variables for MIP
    if (mip) {
        const binaries = [];
        const generals = [];
        const numBinary = Math.floor(numVars * binaryRatio);
        const numInteger = Math.floor(numVars * integerRatio);

        for (let i = 0; i < numBinary; i++) {
            binaries.push(`x${i}`);
        }
        for (let i = numBinary; i < numBinary + numInteger; i++) {
            generals.push(`x${i}`);
        }

        problem.binaries = binaries;
        problem.generals = generals;
    }

    return problem;
}

/**
 * Generate a large LP problem (legacy wrapper)
 * @param {GLPKConstants} glpk - GLPK instance for constants
 * @param {number} numVars - Number of variables
 * @param {number} numConstraints - Number of constraints
 * @returns {LP} Generated LP problem
 */
export function generateLargeLP(glpk, numVars = 200, numConstraints = 200) {
    return generateLargeProblem(glpk, { numVars, numConstraints, mip: false });
}

/**
 * Get memory usage in MB (works in Node and Chrome)
 * @returns {{ heapUsed: number, heapTotal: number } | null}
 */
export function getMemoryUsage() {
    // Node.js
    if (typeof process !== 'undefined' && process.memoryUsage) {
        const mem = process.memoryUsage();
        return {
            heapUsed: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
            heapTotal: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
        };
    }
    // Chrome (non-standard)
    // @ts-ignore
    if (typeof performance !== 'undefined' && performance.memory) {
        // @ts-ignore
        const mem = performance.memory;
        return {
            heapUsed: Math.round((mem.usedJSHeapSize / 1024 / 1024) * 100) / 100,
            heapTotal: Math.round((mem.totalJSHeapSize / 1024 / 1024) * 100) / 100
        };
    }
    return null;
}

/**
 * Run memory test
 * @param {GLPKConstants} glpk - GLPK instance
 * @param {object} options - Test options
 * @param {number} [options.iterations=100] - Number of iterations
 * @param {number} [options.numVars=200] - Variables per problem
 * @param {number} [options.numConstraints=200] - Constraints per problem
 * @param {LP} [options.lp] - Pre-generated LP (optional, overrides numVars/numConstraints)
 * @param {function} [options.log=console.log] - Logging function
 * @returns {Promise<{ success: boolean, iterations: number, memoryGrowth: number | null }>}
 */
export async function runMemoryTest(glpk, options = {}) {
    const {
        iterations = 100,
        numVars = 200,
        numConstraints = 200,
        lp = null,
        log = console.log
    } = options;

    const problem = lp ?? generateLargeLP(glpk, numVars, numConstraints);
    const initialMemory = getMemoryUsage();

    log(`Starting memory test: ${iterations} iterations`);
    log(
        `Problem size: ${problem.objective.vars.length} vars, ${problem.subjectTo.length} constraints`
    );
    if (initialMemory) {
        log(
            `Initial memory: ${initialMemory.heapUsed} MB used / ${initialMemory.heapTotal} MB total`
        );
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < iterations; i++) {
        try {
            // Handle both sync (Node) and async (browser worker) APIs
            const result = await Promise.resolve(glpk.solve(problem, glpk.GLP_MSG_OFF));
            if (result.result.status === glpk.GLP_OPT || result.result.status === glpk.GLP_FEAS) {
                successCount++;
            } else {
                failCount++;
            }

            // Log progress every 10 iterations
            if ((i + 1) % 10 === 0) {
                const mem = getMemoryUsage();
                const memStr = mem ? ` | Memory: ${mem.heapUsed} MB` : '';
                log(`Iteration ${i + 1}/${iterations}${memStr}`);
            }
        } catch (err) {
            failCount++;
            log(`Error at iteration ${i + 1}: ${err.message}`);
        }
    }

    const finalMemory = getMemoryUsage();
    let memoryGrowth = null;

    if (initialMemory && finalMemory) {
        memoryGrowth = Math.round((finalMemory.heapUsed - initialMemory.heapUsed) * 100) / 100;
        log(`Final memory: ${finalMemory.heapUsed} MB used / ${finalMemory.heapTotal} MB total`);
        log(`Memory growth: ${memoryGrowth} MB`);
    }

    log(`Results: ${successCount} success, ${failCount} failed`);

    return {
        success: failCount === 0,
        iterations,
        memoryGrowth
    };
}

/**
 * @typedef {Object} ParallelTestOptions
 * @property {number} [numWorkers=4] - Number of parallel workers to spawn
 * @property {number} [iterations=50] - Iterations per worker
 * @property {number} [numVars=100] - Variables per problem
 * @property {number} [numConstraints=100] - Constraints per problem
 * @property {boolean} [mip=false] - Use MIP instead of LP
 * @property {function} [log=console.log] - Logging function
 */

/**
 * @typedef {Object} WorkerResult
 * @property {number} workerId - Worker ID
 * @property {boolean} success - Whether all iterations succeeded
 * @property {number} iterations - Number of iterations run
 * @property {number|null} memoryGrowth - Memory growth in MB
 * @property {number} solveTime - Total solve time in ms
 * @property {Error|null} error - Error if worker failed
 */

/**
 * @typedef {Object} ParallelTestResult
 * @property {boolean} success - Whether all workers succeeded
 * @property {number} numWorkers - Number of workers used
 * @property {WorkerResult[]} workerResults - Results per worker
 * @property {number} totalTime - Total test time in ms
 */

/**
 * Run memory test with multiple parallel workers
 * Tests whether multiple GLPK instances can run independently without memory overlap
 *
 * @param {function(): Promise<GLPKConstants>} GLPKFactory - Factory function to create GLPK instances
 * @param {ParallelTestOptions} [options] - Test options
 * @returns {Promise<ParallelTestResult>} Test results
 */
export async function runParallelWorkerTest(GLPKFactory, options = {}) {
    const {
        numWorkers = 4,
        iterations = 50,
        numVars = 100,
        numConstraints = 100,
        mip = false,
        log = console.log
    } = options;

    log(`Starting parallel worker test: ${numWorkers} workers, ${iterations} iterations each`);
    log(`Problem: ${numVars} vars, ${numConstraints} constraints, ${mip ? 'MIP' : 'LP'}`);

    const startTime = performance.now();
    const initialMemory = getMemoryUsage();
    if (initialMemory) {
        log(`Initial memory: ${initialMemory.heapUsed} MB used`);
    }

    /**
     * Run test on a single worker
     * @param {number} workerId - Worker identifier
     * @returns {Promise<WorkerResult>}
     */
    const runWorkerTest = async (workerId) => {
        const workerStart = performance.now();
        try {
            log(`[Worker ${workerId}] Initializing...`);
            const glpk = await GLPKFactory();
            log(`[Worker ${workerId}] GLPK version: ${glpk.version}`);

            // Generate a unique problem for this worker (different random seed effect)
            const lp = generateLargeProblem(glpk, { numVars, numConstraints, mip });

            let optimalCount = 0;
            let feasibleCount = 0;
            let failCount = 0;

            for (let i = 0; i < iterations; i++) {
                try {
                    const result = await Promise.resolve(glpk.solve(lp, glpk.GLP_MSG_OFF));
                    if (result.result.status === glpk.GLP_OPT) {
                        optimalCount++;
                    } else if (result.result.status === glpk.GLP_FEAS) {
                        feasibleCount++;
                    } else {
                        failCount++;
                    }

                    // Log progress every 25 iterations
                    if ((i + 1) % 25 === 0 || i + 1 === iterations) {
                        log(`[Worker ${workerId}] Iteration ${i + 1}/${iterations}`);
                    }
                } catch (err) {
                    failCount++;
                    log(`[Worker ${workerId}] Error at iteration ${i + 1}: ${err.message}`);
                }
            }

            const solveTime = performance.now() - workerStart;

            // Terminate worker
            if (glpk.terminate) {
                glpk.terminate();
            }

            const statusParts = [];
            if (optimalCount > 0) statusParts.push(`${optimalCount} optimal`);
            if (feasibleCount > 0) statusParts.push(`${feasibleCount} feasible`);
            if (failCount > 0) statusParts.push(`${failCount} failed`);

            log(
                `[Worker ${workerId}] Done: ${statusParts.join(', ')} in ${Math.round(solveTime)}ms`
            );

            return {
                workerId,
                success: failCount === 0,
                iterations,
                memoryGrowth: null,
                solveTime,
                error: null
            };
        } catch (err) {
            log(`[Worker ${workerId}] Fatal error: ${err.message}`);
            return {
                workerId,
                success: false,
                iterations: 0,
                memoryGrowth: null,
                solveTime: performance.now() - workerStart,
                error: err
            };
        }
    };

    // Launch all workers in parallel
    log(`Launching ${numWorkers} workers in parallel...`);
    const workerPromises = [];
    for (let i = 0; i < numWorkers; i++) {
        workerPromises.push(runWorkerTest(i));
    }

    // Wait for all workers to complete
    const workerResults = await Promise.all(workerPromises);

    const totalTime = performance.now() - startTime;
    const finalMemory = getMemoryUsage();

    // Summary
    log('');
    log('=== Parallel Worker Test Summary ===');
    const successfulWorkers = workerResults.filter((r) => r.success).length;
    log(`Workers: ${successfulWorkers}/${numWorkers} successful`);
    log(`Total time: ${Math.round(totalTime)}ms`);

    if (initialMemory && finalMemory) {
        const growth = Math.round((finalMemory.heapUsed - initialMemory.heapUsed) * 100) / 100;
        log(
            `Memory: ${initialMemory.heapUsed} MB -> ${finalMemory.heapUsed} MB (${growth >= 0 ? '+' : ''}${growth} MB)`
        );
    }

    // Check for any anomalies that might indicate shared state
    const objValues = workerResults
        .filter((r) => r.success)
        .map((r) => ({ id: r.workerId, time: r.solveTime }));
    if (objValues.length > 0) {
        const times = objValues.map((o) => o.time);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        log(
            `Solve times: min=${Math.round(minTime)}ms, avg=${Math.round(avgTime)}ms, max=${Math.round(maxTime)}ms`
        );
    }

    // Memory is freed after terminate() but GC timing is unpredictable
    if (initialMemory && finalMemory) {
        log('');
        const duringGrowth =
            Math.round((finalMemory.heapUsed - initialMemory.heapUsed) * 100) / 100;
        log(
            `Memory: ${initialMemory.heapUsed} MB -> ${finalMemory.heapUsed} MB (${duringGrowth >= 0 ? '+' : ''}${duringGrowth} MB during test)`
        );
        log('Note: Memory is freed after terminate() but GC timing is unpredictable.');
    }

    return {
        success: successfulWorkers === numWorkers,
        numWorkers,
        workerResults,
        totalTime
    };
}
