/**
 * @typedef {import('./glpk.d.ts').GLPK} GLPK
 * @typedef {import('./glpk.d.ts').LP} LP
 * @typedef {import('./glpk.d.ts').Options} Options
 * @typedef {import('./glpk.d.ts').Result} Result
 */

/**
 * @typedef {Object} SolveResult
 * @property {number} status - Solution status
 * @property {number} z - Objective value
 * @property {{[key: string]: number}} vars - Variable values
 * @property {{[key: string]: number}} [dual] - Dual values (LP only)
 * @property {{[key: string]: number}} [rows] - Row/constraint values
 */

/**
 * @typedef {Object} InternalOptions
 * @property {number} presol - Presolve flag (0 or 1)
 * @property {number} msglev - Message level
 * @property {number} tmlim - Time limit in ms
 * @property {number} mipgap - MIP gap tolerance
 * @property {boolean} rows - Include row values in result
 * @property {Options['cb']} [cb] - Callback configuration
 */

/**
 * @typedef {Object} ModuleOptions
 * @property {ArrayBuffer} [wasmBinary] - WebAssembly binary
 * @property {function} [locateFile] - Function to locate files
 */

import GLPKModule from './.build/glpk.js';

/**
 * Factory function to create a GLPK instance
 * @param {ArrayBuffer|ModuleOptions|null} [options=null] - WASM binary or module options
 * @returns {Promise<GLPK>} GLPK instance
 */
const glpk = async function (options = null) {
    const moduleOptions =
        options && typeof options === 'object' ? options : { wasmBinary: options };

    const Module = await GLPKModule(moduleOptions);

    const { cwrap, _free, _malloc, FS, writeArrayToMemory } = Module;

    const glp_version = cwrap('glp_version', 'string', []),
        glp_create_prob = cwrap('glp_create_prob', 'void', []),
        glp_erase_prob = cwrap('glp_erase_prob', 'void', ['number']),
        glp_delete_prob = cwrap('glp_delete_prob', 'void', ['number']),
        glp_create_index = cwrap('glp_create_index', 'void', ['number']),
        glp_set_prob_name = cwrap('glp_set_prob_name', 'void', ['number', 'string']),
        glp_get_prob_name = cwrap('glp_get_prob_name', 'string', ['number']),
        glp_set_obj_dir = cwrap('glp_set_obj_dir', 'void', ['number', 'number']),
        glp_find_col = cwrap('glp_find_col', 'number', ['number', 'string']),
        glp_set_col_bnds = cwrap('glp_set_col_bnds', 'void', [
            'number',
            'number',
            'number',
            'number',
            'number'
        ]),
        glp_set_row_bnds = cwrap('glp_set_row_bnds', 'void', [
            'number',
            'number',
            'number',
            'number',
            'number'
        ]),
        glp_set_obj_coef = cwrap('glp_set_obj_coef', 'void', ['number', 'number', 'number']),
        glp_add_rows = cwrap('glp_add_rows', 'number', ['number', 'number']),
        glp_add_cols = cwrap('glp_add_cols', 'number', ['number', 'number']),
        glp_set_row_name = cwrap('glp_set_row_name', 'void', ['number', 'number', 'string']),
        glp_set_col_name = cwrap('glp_set_col_name', 'void', ['number', 'number', 'string']),
        glp_set_mat_row = cwrap('glp_set_mat_row', 'void', [
            'number',
            'number',
            'number',
            'number',
            'number'
        ]),
        glp_set_col_kind = cwrap('glp_set_col_kind', 'void', ['number', 'number', 'number']),
        glp_get_col_lb = cwrap('glp_get_col_lb', 'number', ['number', 'number']),
        glp_get_col_ub = cwrap('glp_get_col_ub', 'number', ['number', 'number']),
        glp_delete_index = cwrap('glp_delete_index', 'void', ['number']),
        glp_sort_matrix = cwrap('glp_sort_matrix', 'void', ['number']),
        glp_get_num_int = cwrap('glp_get_num_int', 'number', ['number']),
        glp_get_num_bin = cwrap('glp_get_num_bin', 'number', ['number']),
        glp_get_num_cols = cwrap('glp_get_num_cols', 'number', ['number']),
        glp_get_num_rows = cwrap('glp_get_num_rows', 'number', ['number']),
        glp_mip_obj_val = cwrap('glp_mip_obj_val', 'number', ['number']),
        glp_mip_status = cwrap('glp_mip_status', 'number', ['number']),
        glp_get_col_name = cwrap('glp_get_col_name', 'string', ['number', 'number']),
        glp_get_row_name = cwrap('glp_get_row_name', 'string', ['number', 'number']),
        glp_mip_col_val = cwrap('glp_mip_col_val', 'number', ['number', 'number']),
        glp_get_obj_val = cwrap('glp_get_obj_val', 'number', ['number']),
        glp_get_status = cwrap('glp_get_status', 'number', ['number']),
        glp_get_col_prim = cwrap('glp_get_col_prim', 'number', ['number', 'number']),
        glp_get_row_prim = cwrap('glp_get_row_prim', 'number', ['number', 'number']),
        glp_get_row_dual = cwrap('glp_get_row_dual', 'number', ['number', 'number']),
        glp_mip_row_val = cwrap('glp_mip_row_val', 'number', ['number', 'number']),
        glp_write_lp = cwrap('glp_write_lp', 'number', ['number', 'number', 'string']),
        solve_lp = cwrap('solve_lp', 'number', ['number', 'number', 'number', 'number']),
        solve_mip = cwrap('solve_mip', 'number', [
            'number',
            'number',
            'number',
            'number',
            'number'
        ]),
        get_glp_smcp = cwrap('get_glp_smcp', 'number', ['number', 'number', 'number', 'number']),
        solve_lp_itlim = cwrap('solve_lp_itlim', 'number', ['number', 'number']);

    const DBL_MAX = Number.MAX_VALUE;
    const INT_MAX = 2147483647;

    /* kind of structural variable: */
    const GLP_IV = 2; /* integer variable */
    const GLP_BV = 3; /* binary variable */

    /* direction: */
    const GLP_MIN = 1; /* minimization */
    const GLP_MAX = 2; /* maximization */

    /* type of auxiliary/structural variable: */
    const GLP_FR = 1; /* free (unbounded) variable */
    const GLP_LO = 2; /* variable with lower bound */
    const GLP_UP = 3; /* variable with upper bound */
    const GLP_DB = 4; /* double-bounded variable */
    const GLP_FX = 5; /* fixed variable */

    /* message level: */
    const GLP_MSG_OFF = 0; /* no output */
    const GLP_MSG_ERR = 1; /* warning and error messages only */
    const GLP_MSG_ON = 2; /* normal output */
    const GLP_MSG_ALL = 3; /* full output */
    const GLP_MSG_DBG = 4; /* debug output */

    /* solution status: */
    const GLP_UNDEF = 1; /* solution is undefined */
    const GLP_FEAS = 2; /* solution is feasible */
    const GLP_INFEAS = 3; /* solution is infeasible */
    const GLP_NOFEAS = 4; /* no feasible solution exists */
    const GLP_OPT = 5; /* solution is optimal */
    const GLP_UNBND = 6; /* solution is unbounded */

    /**
     * Find or create a column by name
     * @param {number} P - Problem pointer
     * @param {string} name - Column name
     * @returns {number} Column index
     */
    const find_col = (P, name) => {
        let j = glp_find_col(P, name);
        if (j === 0) {
            j = glp_add_cols(P, 1);
            glp_set_col_name(P, j, name);
            glp_set_col_bnds(P, j, GLP_FX, +DBL_MAX, -DBL_MAX);
        }
        return j;
    };

    /**
     * Set up the LP problem from the input structure
     * @param {LP} lp - Linear program definition
     * @returns {number} Problem pointer
     */
    const setup = (lp) => {
        let j, jj, ub, lb, type;
        const P = glp_create_prob();
        glp_erase_prob(P);
        glp_create_index(P);
        glp_set_prob_name(P, lp.name);
        glp_set_obj_dir(P, lp.objective.direction);

        lp.objective.vars.forEach((o) => {
            let col = find_col(P, o.name);
            glp_set_col_bnds(P, col, GLP_LO, 0, 0);
            glp_set_obj_coef(P, col, o.coef);
        });

        lp.subjectTo.forEach((c) => {
            let vars = c.vars,
                bnds = c.bnds,
                ind = [null],
                val = [null],
                row;
            vars.forEach((v, i) => {
                ind[i + 1] = find_col(P, v.name);
                val[i + 1] = v.coef;
            });

            const ind_ptr = _malloc(ind.length * 4);
            const val_ptr = _malloc(val.length * 8);

            writeArrayToMemory(new Uint8Array(new Int32Array(ind).buffer), ind_ptr);
            writeArrayToMemory(new Uint8Array(new Float64Array(val).buffer), val_ptr);

            row = glp_add_rows(P, 1);
            glp_set_row_name(P, row, c.name);
            glp_set_mat_row(P, row, vars.length, ind_ptr, val_ptr);
            glp_set_row_bnds(P, row, bnds.type, bnds.lb, bnds.ub);

            _free(ind_ptr);
            _free(val_ptr);
        });

        if (lp.bounds) {
            lp.bounds.forEach((b) => {
                glp_set_col_bnds(P, find_col(P, b.name), b.type, b.lb, b.ub);
            });
        }

        if (lp.generals) {
            lp.generals.forEach((name) => {
                glp_set_col_kind(P, find_col(P, name), GLP_IV);
            });
        }

        if (lp.binaries) {
            lp.binaries.forEach((name) => {
                glp_set_col_kind(P, find_col(P, name), GLP_BV);
            });
        }

        /* set bounds of variables */
        for (j = 1, jj = glp_get_num_cols(P); j <= jj; j++) {
            lb = glp_get_col_lb(P, j);
            ub = glp_get_col_ub(P, j);
            if (lb === +DBL_MAX) lb = 0.0; /* default lb */
            if (ub === -DBL_MAX) ub = +DBL_MAX; /* default ub */
            if (lb === -DBL_MAX && ub === +DBL_MAX) type = GLP_FR;
            else if (ub === +DBL_MAX) type = GLP_LO;
            else if (lb === -DBL_MAX) type = GLP_UP;
            else if (lb !== ub) type = GLP_DB;
            else type = GLP_FX;
            glp_set_col_bnds(P, j, type, lb, ub);
        }

        /* problem data has been successfully read */
        glp_delete_index(P);
        glp_sort_matrix(P);

        return P;
    };

    /**
     * Solve the LP/MIP problem
     * @param {number} P - Problem pointer
     * @param {SolveResult} ret - Result object to populate
     * @param {InternalOptions} opt - Solver options
     */
    const solve = (P, ret, opt) => {
        // this condition checks if the problem has binary or int columns
        if (glp_get_num_int(P) || glp_get_num_bin(P)) {
            solve_mip(P, opt.msglev, opt.tmlim, opt.presol, opt.mipgap);
            ret.status = glp_mip_status(P);
            ret.z = glp_mip_obj_val(P);
            for (let i = 1, ii = glp_get_num_cols(P); i < ii + 1; i++) {
                ret.vars[glp_get_col_name(P, i)] = glp_mip_col_val(P, i);
            }
            if (opt.rows) {
                ret.rows = get_mip_rows(P);
            }
            delete ret.dual;
        } else {
            if (opt.cb && opt.cb.call && typeof opt.cb.call === 'function') {
                const call = opt.cb.call;
                const each = +opt.cb.each > 0 ? +opt.cb.each : 1;
                // Presolve must be disabled for iterative solving with callbacks
                const glp_smcp = get_glp_smcp(each, opt.msglev, opt.tmlim, 0);
                try {
                    while (1) {
                        solve_lp_itlim(P, glp_smcp, each);
                        const status = glp_get_status(P);
                        const _ret = {
                            status,
                            z: glp_get_obj_val(P),
                            vars: get_vars(P),
                            dual: get_dual(P),
                            rows: opt.rows ? get_rows(P) : undefined
                        };
                        call(_ret);
                        if (
                            status === GLP_OPT ||
                            status === GLP_NOFEAS ||
                            status === GLP_UNBND ||
                            status === GLP_UNDEF
                        ) {
                            ret.status = _ret.status;
                            ret.z = _ret.z;
                            ret.vars = _ret.vars;
                            ret.dual = _ret.dual;
                            if (opt.rows) {
                                ret.rows = _ret.rows;
                            }
                            break;
                        }
                    }
                } finally {
                    _free(glp_smcp);
                }
            } else {
                solve_lp(P, opt.msglev, opt.tmlim, opt.presol);
                ret.status = glp_get_status(P);
                ret.z = glp_get_obj_val(P);
                ret.vars = get_vars(P);
                ret.dual = get_dual(P);
                if (opt.rows) {
                    ret.rows = get_rows(P);
                }
            }
        }
    };

    /**
     * Get primal variable values from solution
     * @param {number} P - Problem pointer
     * @returns {{[key: string]: number}} Variable values by name
     */
    function get_vars(P) {
        const vars = {};
        for (let i = 1, ii = glp_get_num_cols(P); i < ii + 1; i++) {
            vars[glp_get_col_name(P, i)] = glp_get_col_prim(P, i);
        }
        return vars;
    }

    /**
     * Get dual values from solution (LP only)
     * @param {number} P - Problem pointer
     * @returns {{[key: string]: number}} Dual values by constraint name
     */
    function get_dual(P) {
        const dual = {};
        for (let i = 1, ii = glp_get_num_rows(P); i < ii + 1; i++) {
            dual[glp_get_row_name(P, i)] = glp_get_row_dual(P, i);
        }
        return dual;
    }

    /**
     * Get row/constraint primal values from LP solution
     * @param {number} P - Problem pointer
     * @returns {{[key: string]: number}} Row values by constraint name
     */
    function get_rows(P) {
        const rows = {};
        for (let i = 1, ii = glp_get_num_rows(P); i < ii + 1; i++) {
            rows[glp_get_row_name(P, i)] = glp_get_row_prim(P, i);
        }
        return rows;
    }

    /**
     * Get row/constraint values from MIP solution
     * @param {number} P - Problem pointer
     * @returns {{[key: string]: number}} Row values by constraint name
     */
    function get_mip_rows(P) {
        const rows = {};
        for (let i = 1, ii = glp_get_num_rows(P); i < ii + 1; i++) {
            rows[glp_get_row_name(P, i)] = glp_mip_row_val(P, i);
        }
        return rows;
    }

    /**
     * Clean up problem resources
     * @param {number} P - Problem pointer
     */
    function housekeeping(P) {
        glp_delete_prob(P);
    }

    return Object.freeze({
        /* direction: */
        GLP_MIN,
        GLP_MAX,

        /* type of auxiliary/structural variable: */
        GLP_FR,
        GLP_LO,
        GLP_UP,
        GLP_DB,
        GLP_FX,

        /* message level: */
        GLP_MSG_OFF,
        GLP_MSG_ERR,
        GLP_MSG_ON,
        GLP_MSG_ALL,
        GLP_MSG_DBG,

        /* solution status: */
        GLP_UNDEF,
        GLP_FEAS,
        GLP_INFEAS,
        GLP_NOFEAS,
        GLP_OPT,
        GLP_UNBND,

        version: glp_version(),

        /**
         * Write problem data in CPLEX LP format
         * @param {LP} lp - Linear program definition
         * @returns {string} Problem in CPLEX LP format
         */
        write: (lp) => {
            const name = lp.name + '.lp';
            const P = setup(typeof lp === 'string' ? JSON.parse(lp) : lp);
            try {
                glp_write_lp(P, null, name);
            } finally {
                housekeeping(P);
            }
            const file = FS.readFile(name, { encoding: 'utf8' });
            FS.unlink(name);
            return file;
        },

        /**
         * Solve a linear or mixed-integer program
         * @param {LP} lp - Linear program definition
         * @param {number|Options} [opt] - Message level or options object
         * @returns {Result} Solution result
         */
        solve: (lp, opt) => {
            const lp_ = typeof lp === 'string' ? JSON.parse(lp) : lp;
            /** @type {Partial<Options>} */
            const opt_ = Number.isInteger(opt) ? { msglev: opt } : { ...lp.options, ...opt };

            const defaults = {
                presol: 1,
                msglev: GLP_MSG_ERR,
                tmlim: INT_MAX,
                mipgap: 0.0,
                rows: false
            };

            /** @type {InternalOptions} */
            const options = {
                presol: opt_.presol != null ? +!!opt_.presol : defaults.presol,
                msglev: opt_.msglev ?? defaults.msglev,
                tmlim: opt_.tmlim >= 0 ? opt_.tmlim * 1000 : defaults.tmlim,
                mipgap: opt_.mipgap >= 0 ? opt_.mipgap : defaults.mipgap,
                rows: opt_.rows ?? defaults.rows,
                cb: opt_.cb
            };

            const P = setup(lp_);
            const ret = {
                name: '',
                time: 0,
                result: {
                    vars: {},
                    dual: {},
                    z: null,
                    status: 1
                }
            };
            const start = new Date().getTime();

            try {
                solve(P, ret.result, options);
                ret.name = glp_get_prob_name(P);
                ret.time = (new Date().getTime() - start) / 1000;
                return ret;
            } finally {
                housekeeping(P);
            }
        }
    });
};

export default glpk;
