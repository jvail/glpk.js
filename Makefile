GLPK_VERSION = 4.65

EMCC_FLAGS :=
# access emcc settings through Runtime.compilerSettings or Runtime.getCompilerSetting(name)
EMCC_FLAGS += -s RETAIN_COMPILER_SETTINGS=1
EMCC_FLAGS += -s ALLOW_MEMORY_GROWTH=1
EMCC_FLAGS += -s EXPORTED_FUNCTIONS="[ \
	'_glp_version', \
	'_glp_create_prob', \
	'_glp_erase_prob', \
	'_glp_delete_prob', \
	'_glp_create_index', \
	'_glp_set_prob_name', \
	'_glp_get_prob_name', \
	'_glp_set_obj_dir', \
	'_glp_find_col', \
	'_glp_set_col_bnds', \
	'_glp_set_row_bnds', \
	'_glp_set_obj_coef', \
	'_glp_add_rows', \
	'_glp_add_cols', \
	'_glp_set_row_name', \
	'_glp_set_col_name', \
	'_glp_set_mat_row', \
	'_glp_set_col_kind', \
	'_glp_get_col_lb', \
	'_glp_get_col_ub', \
	'_glp_delete_index', \
	'_glp_sort_matrix', \
	'_glp_get_num_int', \
	'_glp_get_num_bin', \
	'_glp_get_num_cols', \
	'_glp_get_num_rows', \
	'_glp_init_iocp', \
	'_glp_mip_obj_val', \
	'_glp_mip_status', \
	'_glp_get_col_name', \
	'_glp_get_row_name', \
	'_glp_mip_col_val', \
	'_glp_init_smcp', \
	'_glp_get_obj_val', \
	'_glp_get_status', \
	'_glp_get_col_prim', \
	'_glp_get_row_dual', \
	'_glp_delete_prob', \
	'_glp_free_env', \
	'_glp_write_lp', \
	'_solve_lp', \
	'_solve_mip' \
	]"

PWD=$(shell pwd)

all: glpk glpk.js glpk-worker.js

getglpk:
	cd $(PWD)/src/glpk && \
	wget -nc http://ftp.gnu.org/gnu/glpk/glpk-$(GLPK_VERSION).tar.gz && \
	tar -xf glpk-$(GLPK_VERSION).tar.gz

glpk: getglpk
	mkdir -p $(PWD)/src/glpk/glpk-$(GLPK_VERSION)/build && \
	cd $(PWD)/src/glpk/glpk-$(GLPK_VERSION)/build && \
	emconfigure ../configure --disable-shared && \
	emmake make -j4 \

glpk.js: src/pre.js src/post.js src/glpk.js.c
	cd $(PWD); \
	emcc -O3 --memory-init-file 0 $(EMCC_FLAGS) \
	-Isrc/glpk/glpk-$(GLPK_VERSION)/src \
	--pre-js src/pre.js --post-js src/post.js  \
	src/glpk/glpk-$(GLPK_VERSION)/build/src/.libs/libglpk.a \
	src/glpk.js.c -o glpk.js

glpk-worker.js: src/pre.js src/post-worker.js src/glpk.js.c
	cd $(PWD); \
	emcc -O3 --memory-init-file 0 $(EMCC_FLAGS) \
	-Isrc/glpk/glpk-$(GLPK_VERSION)/src \
	--pre-js src/pre.js --post-js src/post-worker.js  \
	src/glpk/glpk-$(GLPK_VERSION)/build/src/.libs/libglpk.a \
	src/glpk.js.c -o glpk-worker.js

clean:
	rm -f $(PWD)/glpk.js;
	rm -f $(PWD)/glpk.wasm;
	rm -f $(PWD)/glpk-worker.js;
	rm -f $(PWD)/glpk-worker.wasm;
	rm -rf $(PWD)/src/glpk/glpk-$(GLPK_VERSION);
