
var glp_version = cwrap('glp_version', 'string', []),
	glp_create_prob = cwrap('glp_create_prob', 'void', []),
	glp_erase_prob = cwrap('glp_erase_prob', 'void', ['number']),
	glp_delete_prob = cwrap('glp_delete_prob', 'void', ['number']),
	glp_create_index = cwrap('glp_create_index', 'void', ['number']),
	glp_set_prob_name = cwrap('glp_set_prob_name', 'void', ['number', 'string']),
	glp_get_prob_name = cwrap('glp_get_prob_name', 'string', ['number']),
	glp_set_obj_dir = cwrap('glp_set_obj_dir', 'void', ['number', 'number']),
	glp_find_col = cwrap('glp_find_col', 'number', ['number', 'string']),
	glp_set_col_bnds = cwrap('glp_set_col_bnds', 'void', ['number', 'number', 'number', 'number', 'number']),
	glp_set_row_bnds = cwrap('glp_set_row_bnds', 'void', ['number', 'number', 'number', 'number', 'number']),
	glp_set_obj_coef = cwrap('glp_set_obj_coef', 'void', ['number', 'number', 'number']),
	glp_add_rows = cwrap('glp_add_rows', 'number', ['number', 'number']),
	glp_add_cols = cwrap('glp_add_cols', 'number', ['number', 'number']),
	glp_set_row_name = cwrap('glp_set_row_name', 'void', ['number', 'number', 'string']),
	glp_set_col_name = cwrap('glp_set_col_name', 'void', ['number', 'number', 'string']),
	glp_set_mat_row = cwrap('glp_set_mat_row', 'void', ['number', 'number', 'number', 'number', 'number']),
	glp_set_col_kind = cwrap('glp_set_col_kind', 'void', ['number', 'number', 'number']),
	glp_get_col_lb = cwrap('glp_get_col_lb', 'number', ['number', 'number']),
	glp_get_col_ub = cwrap('glp_get_col_ub', 'number', ['number', 'number']),
	glp_delete_index = cwrap('glp_delete_index', 'void', ['number']),
	glp_sort_matrix = cwrap('glp_sort_matrix', 'void', ['number']),
	glp_get_num_int = cwrap('glp_get_num_int', 'number', ['number']),
	glp_get_num_bin = cwrap('glp_get_num_bin', 'number', ['number']),
	glp_get_num_cols = cwrap('glp_get_num_cols', 'number', ['number']),
	glp_init_iocp = cwrap('glp_init_iocp', 'void', ['number']),
	glp_mip_obj_val = cwrap('glp_mip_obj_val', 'number', ['number']),
	glp_mip_status = cwrap('glp_mip_status', 'number', ['number']),
	glp_get_col_name = cwrap('glp_get_col_name', 'string', ['number', 'number']),
	glp_mip_col_val = cwrap('glp_mip_col_val', 'number', ['number', 'number']),
	glp_init_smcp = cwrap('glp_init_smcp', 'void', ['number']),
	glp_get_obj_val = cwrap('glp_get_obj_val', 'number', ['number']),
	glp_get_status = cwrap('glp_get_status', 'number', ['number']),
	glp_get_col_prim = cwrap('glp_get_col_prim', 'number', ['number', 'number']),
	glp_delete_prob = cwrap('glp_delete_prob', 'void', ['number']),
	glp_free_env = cwrap('glp_free_env', 'number', []),
	glp_write_lp = cwrap('glp_write_lp', 'number', ['number', 'number', 'string']),
	solve_lp = cwrap('solve_lp', 'number', ['number', 'number']),
	solve_mip = cwrap('solve_mip', 'number', ['number', 'number']),
	glp_create_prob = cwrap('glp_create_prob', 'number', []),
	glp_read_mps = cwrap('glp_read_mps', 'number', ['number', 'number', 'number', 'string']);

this['glpk'] = (function () {

	var DBL_MAX = Number.MAX_VALUE;

	var api = Object.freeze({
			/* direction: */
		'GLP_MIN': 1,  /* minimization */
		'GLP_MAX': 2,  /* maximization */

			/* kind of structural variable: */
		'GLP_CV':  1,  /* continuous variable */
		'GLP_IV':  2,  /* integer variable */
		'GLP_BV':  3,  /* binary variable */

			/* type of auxiliary/structural variable: */
		'GLP_FR':  1,  /* free (unbounded) variable */
		'GLP_LO':  2,  /* variable with lower bound */
		'GLP_UP':  3,  /* variable with upper bound */
		'GLP_DB':  4,  /* double-bounded variable */
		'GLP_FX':  5,  /* fixed variable */

			/* message level: */
		'GLP_MSG_OFF': 0,  /* no output */
		'GLP_MSG_ERR': 1,  /* warning and error messages only */
		'GLP_MSG_ON':  2,  /* normal output */
		'GLP_MSG_ALL': 3,  /* full output */
		'GLP_MSG_DBG': 4,  /* debug output */

			/* solution status: */
		'GLP_UNDEF':  1,  /* solution is undefined */
		'GLP_FEAS':   2,  /* solution is feasible */
		'GLP_INFEAS': 3,  /* solution is infeasible */
		'GLP_NOFEAS': 4,  /* no feasible solution exists */
		'GLP_OPT':    5,  /* solution is optimal */
		'GLP_UNBND':  6,  /* solution is unbounded */
		'version': glp_version(),
		'write': function (lp) {
			var name = lp.name + '.lp', P = setup(lp), str;
			glp_write_lp(P, null, name);
			str = FS.readFile(name, { encoding: 'utf8' });
			FS.unlink(name);
			housekeeping(P);
			return str;
		},
		'solve': function (lp, msg_lev, file) {

			var P = null, start,
				ret = {
					name: '',
					time: 0,
					result: {
						vars: {},
						z: null,
						status: 1
					}
				};

			if (file) {
				P = glp_create_prob();
				FS.writeFile('lp.mps', lp);
				glp_read_mps(P, 2 /*GLP_MPS_FILE*/ , null, 'lp.mps');
				FS.unlink('lp.mps');
			} else {
				P = setup(lp);
			}

			start = new Date().getTime();
			solve(P, ret.result, msg_lev);
			ret.time = (new Date().getTime() - start) / 1000;

			ret.name = glp_get_prob_name(P);

			housekeeping(P);

			return ret;
		}
	});

	function find_col(P, name) {

		var j = glp_find_col(P, name);
		if (j === 0) {
			j = glp_add_cols(P, 1);
			glp_set_col_name(P, j, name);
			/* TODO: default bounds? */
			glp_set_col_bnds(P, j, api.GLP_FX, +DBL_MAX, -DBL_MAX);
		}
		return j;

	}

	function setup(lp) {

		var j, jj, ub, lb, type;
		lp = (typeof lp === 'string' ? JSON.parse(lp) : lp);
		P = glp_create_prob();
		glp_erase_prob(P);
		glp_create_index(P);
		glp_set_prob_name(P, lp.name);
		glp_set_obj_dir(P, lp.objective.direction);

		lp.objective.vars.forEach(function (o) {
			var col = find_col(P, o.name);
			glp_set_col_bnds(P, col, api.GLP_LO, 0, 0);
			glp_set_obj_coef(P, col, o.coef);
		});

		lp.subjectTo.forEach(function (c) {
			var vars = c.vars, bnds = c.bnds, ind = [null], val = [null], row;
			vars.forEach(function (v, i) {
				ind[i+1] = find_col(P, v.name);
				val[i+1] = v.coef;
			});

			var ind_ = new Int32Array(ind);
			var ind_ptr = _malloc(ind_.length * ind_.BYTES_PER_ELEMENT);
			var ind_data = new Uint8Array(Module['HEAPU8'].buffer, ind_ptr, ind_.length * ind_.BYTES_PER_ELEMENT);
			ind_data.set(new Uint8Array(ind_.buffer));

			var val_ = new Float64Array(val);
			var val_ptr = _malloc(val_.length * val_.BYTES_PER_ELEMENT);
			var val_data = new Uint8Array(Module['HEAPU8'].buffer, val_ptr, val_.length * val_.BYTES_PER_ELEMENT);
			val_data.set(new Uint8Array(val_.buffer));

			row = glp_add_rows(P, 1);
			glp_set_row_name(P, row, c.name);
			glp_set_mat_row(P, row, vars.length, ind_ptr, val_ptr);
			glp_set_row_bnds(P, row, bnds.type, bnds.lb, bnds.ub);
		});

		if (lp.bounds) {
			lp.bounds.forEach(function (b) {
				glp_set_col_bnds(P, find_col(P, b.name), b.type, b.lb, b.ub);
			});
		}

		if (lp.generals) {
			lp.generals.forEach(function (name) {
				glp_set_col_kind(P, find_col(P, name), api.GLP_IV);
			});
		}

		if (lp.binaries) {
			lp.binaries.forEach(function (name) {
				glp_set_col_kind(P, find_col(P, name), api.GLP_BV);
			});
		}

		/* set bounds of variables */
		for (j = 1, jj = glp_get_num_cols(P); j <= jj; j++) {
			lb = glp_get_col_lb(P, j);
			ub = glp_get_col_ub(P, j);
			if (lb === +DBL_MAX) lb = 0.0; /* default lb */
			if (ub === -DBL_MAX) ub = +DBL_MAX; /* default ub */
			if (lb === -DBL_MAX && ub === +DBL_MAX)
			  type = api.GLP_FR;
			else if (ub === +DBL_MAX)
			  type = api.GLP_LO;
			else if (lb === -DBL_MAX)
			  type = api.GLP_UP;
			else if (lb !== ub)
			  type = api.GLP_DB;
			else
			  type = api.GLP_FX;
			glp_set_col_bnds(P, j, type, lb, ub);
		}

  		/* problem data has been successfully read */
		glp_delete_index(P);
		glp_sort_matrix(P);

		return P;

	};

	function solve(P, res, msg_lev) {

		var i, ii;

		if (glp_get_num_int(P) || glp_get_num_bin(P)) {
			solve_mip(P, msg_lev);
			res.status = glp_mip_status(P);
			res.z = glp_mip_obj_val(P);
			for (i = 1, ii = glp_get_num_cols(P); i < ii + 1; i++) {
				res.vars[glp_get_col_name(P, i)] = glp_mip_col_val(P, i);
			}
		} else {
			solve_lp(P, msg_lev);
			res.status = glp_get_status(P);
			res.z = glp_get_obj_val(P);
			for (i = 1, ii = glp_get_num_cols(P); i < ii + 1; i++) {
				res.vars[glp_get_col_name(P, i)] = glp_get_col_prim(P, i);
			}
		}

	};

	function housekeeping(P) {

		glp_delete_prob(P);
		glp_free_env();

	};

	return api;

}());

for (i in this['glpk']) {
  Module[i] = this['glpk'][i];
}

return this['glpk'];

}());
if (typeof module !== 'undefined') module.exports = glpk;
if (typeof define === 'function') define(glpk);
