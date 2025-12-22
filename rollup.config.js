import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';

const cp = copy({
    targets: [
        { src: 'src/glpk.d.ts', dest: 'dist' },
        { src: 'src/.build/glpk.wasm', dest: 'dist' }
    ]
});

const plugins = [nodeResolve(), commonjs(), terser(), cp];

export default (args) => {
    if (args.worker) {
        delete args.worker;
        return {
            input: 'src/glpk-worker.js',
            output: [{ file: 'src/.build/worker.js', format: 'es' }],
            plugins: [
                // Replace import.meta.url for worker context - Emscripten 4.x uses it
                // to locate WASM files, but it's not available in Blob URL workers.
                // See src/glpk-worker.js for full explanation.
                replace({
                    preventAssignment: true,
                    'import.meta.url': 'self.location.href'
                }),
                ...plugins
            ]
        };
    }

    return [
        {
            input: 'src/glpk-web.js',
            output: [{ file: 'dist/index.js', format: 'es' }],
            plugins
        },
        {
            input: 'src/glpk-node.js',
            output: [{ file: 'dist/glpk.js', format: 'es' }],
            plugins
        }
    ];
};
