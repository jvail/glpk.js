import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

const cp = copy({
    targets: [
        { src: 'src/glpk.d.ts', dest: 'dist' },
        { src: 'src/.build/glpk.wasm', dest: 'dist' }
    ]
});

const plugins = [nodeResolve(), commonjs(), terser(), cp];

export default args => {

    if (args.worker) {
        delete args.worker;
        return {
            input: 'src/glpk-worker.js',
            output: [
                { file: 'src/.build/worker.js', format: 'es', preferConst: true }
            ],
            plugins
        };
    }

    return [
        {
            input: 'src/glpk-web.js',
            output: [
                { file: 'dist/index.js', format: 'es', preferConst: true }
            ],
            plugins
        },
        {
            input: 'src/glpk-node.js',
            output: [
                { file: 'dist/glpk.js', format: 'cjs', preferConst: true, exports: 'auto' }
            ],
            plugins
        }
    ];

};
