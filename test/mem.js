/**
 * Node.js memory test runner
 *
 * Usage: node test/mem.js [iterations] [--generate]
 *
 * Options:
 *   iterations  Number of iterations (default: 100)
 *   --generate  Generate LP instead of using mem.json
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import GLPK from '../dist/glpk.js';
import { runMemoryTest, generateLargeLP } from './mem-test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const iterations = parseInt(args.find((a) => !a.startsWith('--')) ?? '100', 10);
const useGenerated = args.includes('--generate');

const glpk = await GLPK();

let lp;
if (useGenerated) {
    console.log('Generating large LP problem...');
    lp = generateLargeLP(glpk, 200, 200);
} else {
    console.log('Loading mem.json...');
    lp = JSON.parse(fs.readFileSync(`${__dirname}/data/mem.json`).toString());
}

const result = await runMemoryTest(glpk, { iterations, lp });

process.exit(result.success ? 0 : 1);
