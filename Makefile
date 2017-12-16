GLPK_VERSION = 4.64

EMCC_FLAGS :=
EMCC_FLAGS += -s INLINING_LIMIT=50
# access emcc settings through Runtime.compilerSettings or Runtime.getCompilerSetting(name)
EMCC_FLAGS += -s RETAIN_COMPILER_SETTINGS=1
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
	'_glp_init_iocp', \
	'_glp_mip_obj_val', \
	'_glp_mip_status', \
	'_glp_get_col_name', \
	'_glp_mip_col_val', \
	'_glp_init_smcp', \
	'_glp_get_obj_val', \
	'_glp_get_status', \
	'_glp_get_col_prim', \
	'_glp_delete_prob', \
	'_glp_free_env', \
	'_glp_write_lp', \
	'_solve_lp', \
	'_solve_mip' \
	]"

# https://github.com/jsmess/jsmess/blob/master/makefile
# EMCC_FLAGS += -s TOTAL_MEMORY=16777216      # 16mb
# EMCC_FLAGS += -s TOTAL_MEMORY=33554432      # 32mb
EMCC_FLAGS += -s TOTAL_MEMORY=67108864      # 64mb
# EMCC_FLAGS += -s TOTAL_MEMORY=134217728     # 128mb
# EMCC_FLAGS += -s TOTAL_MEMORY=268435456     # 256mb
# EMCC_FLAGS += -s ALLOW_MEMORY_GROWTH=1

PWD=$(shell pwd)

all: glpk.bc glpk.js

getglpk:
	cd $(PWD)/src/glpk; \
	wget -nc http://ftp.gnu.org/gnu/glpk/glpk-$(GLPK_VERSION).tar.gz; \
	tar -xf glpk-$(GLPK_VERSION).tar.gz; \

glpk.bc: getglpk
	mkdir -p $(PWD)/src/glpk/glpk-$(GLPK_VERSION)/build
	cd $(PWD)/src/glpk/glpk-$(GLPK_VERSION)/build; \
	emconfigure ../configure --host=none-none-none; \
	emmake make; \
	find $(PWD)/src/glpk/glpk-$(GLPK_VERSION)/build -type f | grep '\.o\b' | EMCC_DEBUG=1 xargs emcc -O2 -o $(PWD)/bc/glpk.bc # join all .o files

glpk.js: src/pre.js src/post.js src/glpk.js.c
	cd $(PWD); \
	em++ -O3 --memory-init-file 0 $(EMCC_FLAGS) \
	-Isrc/glpk/glpk-$(GLPK_VERSION)/src -Isrc/glpk/glpk-$(GLPK_VERSION)/src/bflib \
	-Isrc/glpk/glpk-$(GLPK_VERSION)/src/env -Isrc/glpk/glpk-$(GLPK_VERSION)/src/misc \
	--pre-js src/pre.js --post-js src/post.js  \
	bc/glpk.bc src/glpk.js.c -o glpk.js \

glpk.debug.js: src/pre.js src/post.js src/glpk.js.c
	cd $(PWD); \
	EMDEBUG=1 em++ -O0 --memory-init-file 0 $(EMCC_FLAGS) -s ASSERTIONS=1 \
	-Isrc/glpk/glpk-$(GLPK_VERSION)/src -Isrc/glpk/glpk-$(GLPK_VERSION)/src/bflib \
	-Isrc/glpk/glpk-$(GLPK_VERSION)/src/env -Isrc/glpk/glpk-$(GLPK_VERSION)/src/misc \
	--pre-js src/pre.js --post-js src/post.js  \
	bc/glpk.bc src/glpk.js.c -o glpk.debug.js \

clean:
	rm -f $(PWD)/glpk.js;
	rm -f $(PWD)/glpk.debug.js;
	rm -f $(PWD)/bc/glpk.bc;


