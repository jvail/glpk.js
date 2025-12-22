/**
 * Large LP example demonstrating simplex callback progress
 *
 * 600x600 balanced transportation problem
 * - Cost matrix: cost(i,j) = ((i*7 + j*13 + 17) % 100) + 1
 * - Verified optimal: 60,000 (glpsol)
 * - 104 iterations, max objective ~3,480,000
 *
 * @typedef {import('../dist/glpk.d.ts').GLPK} GLPK
 * @typedef {import('../dist/glpk.d.ts').LP} LP
 */

import GLPK from '../dist/index.js';

const N = 600;
const MAX_Z = 3500000; // Fixed scale based on observed max

const STATUS = { 1: 'UNDEF', 2: 'FEAS', 3: 'INFEAS', 4: 'NOFEAS', 5: 'OPT', 6: 'UNBND' };

(async () => {
    const glpk = await GLPK();

    const iterEl = document.getElementById('iterations');
    const objEl = document.getElementById('objective');
    const statusEl = document.getElementById('status');
    const chartEl = document.getElementById('chart');
    const outEl = document.getElementById('out');

    const values = [];

    function updateChart(z) {
        values.push(z);
        chartEl.innerHTML = values
            .map(
                (v) => `<div class="bar" style="height: ${Math.max(1, (v / MAX_Z) * 195)}px"></div>`
            )
            .join('');
    }

    let iter = 0;
    function onProgress(p) {
        iter++;
        iterEl.textContent = iter;
        objEl.textContent = p.z;
        statusEl.textContent = STATUS[p.status];
        updateChart(p.z);
    }

    outEl.textContent = 'Generating problem...';

    await new Promise((r) => setTimeout(r, 50));

    // Generate problem
    const cost = (i, j) => ((i * 7 + j * 13 + 17) % 100) + 1;
    const vars = [];
    const subjectTo = [];
    const bounds = [];

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const name = `x_${i}_${j}`;
            vars.push({ name, coef: cost(i, j) });
            bounds.push({ name, type: glpk.GLP_LO, lb: 0, ub: 0 });
        }
    }

    for (let i = 0; i < N; i++) {
        const cv = [];
        for (let j = 0; j < N; j++) cv.push({ name: `x_${i}_${j}`, coef: 1.0 });
        subjectTo.push({
            name: `supply_${i}`,
            vars: cv,
            bnds: { type: glpk.GLP_FX, lb: 100, ub: 100 }
        });
    }

    for (let j = 0; j < N; j++) {
        const cv = [];
        for (let i = 0; i < N; i++) cv.push({ name: `x_${i}_${j}`, coef: 1.0 });
        subjectTo.push({
            name: `demand_${j}`,
            vars: cv,
            bnds: { type: glpk.GLP_FX, lb: 100, ub: 100 }
        });
    }

    /** @type {LP} */
    const lp = {
        name: 'LargeTransportation',
        objective: { direction: glpk.GLP_MIN, name: 'cost', vars },
        subjectTo,
        bounds
    };

    outEl.textContent = 'Solving...  (expected solution: 60000)';

    const result = await glpk.solve(lp, {
        msglev: glpk.GLP_MSG_OFF,
        presol: false,
        cb: { call: onProgress, each: 1 }
    });

    outEl.textContent = `Solved: ${result.result.z} (expected solution: 60000)`;

    // Terminate worker and free shared resources
    glpk.terminate();
})();
