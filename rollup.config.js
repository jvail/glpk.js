import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

const cpShared = copy({
    targets: [
        { src: 'src/glpk-shared.d.ts', dest: 'dist' },
        { src: 'src/glpk-sync.d.ts', dest: 'dist' },
        { src: 'src/glpk-async.d.ts', dest: 'dist' },
        { src: 'src/.build/glpk.wasm', dest: 'dist' },
    ]
});

const cpWeb = copy({
    targets: [
        { src: 'src/glpk-web.d.ts', dest: 'dist' },
    ]
});

const cpNode = copy({
    targets: [
        { src: 'src/glpk-node.d.ts', dest: 'dist' },
    ]
});

const pluginsWeb = [nodeResolve(), commonjs(), terser(), cpShared, cpWeb];
const pluginsNode = [nodeResolve(), commonjs(), terser(), cpShared, cpNode];

export default args => {

    if (args.worker) {
        delete args.worker;
        return {
            input: 'src/glpk-worker.js',
            output: [
                { file: 'src/.build/worker.js', format: 'es', preferConst: true }
            ],
            plugins: [nodeResolve(), commonjs(), terser()]
        };
    }

    return [
        {
            input: 'src/glpk-web.js',
            output: [
                { file: 'dist/web.js', format: 'es', preferConst: true }
            ],
            plugins: pluginsWeb
        },
        {
            input: 'src/glpk-node.js',
            output: [
                { file: 'dist/node.js', format: 'cjs', preferConst: true, exports: 'auto' }
            ],
            plugins: pluginsNode
        }
    ];

};
