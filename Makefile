# run make

EMCC_FLAGS :=
EMCC_FLAGS += -s INLINING_LIMIT=50
# access emcc settings through Runtime.compilerSettings or Runtime.getCompilerSetting(name)
EMCC_FLAGS += -s RETAIN_COMPILER_SETTINGS=1
EMCC_FLAGS += -s EXPORTED_FUNCTIONS="['_do_solve']" 
EMCC_FLAGS += -s RESERVED_FUNCTION_POINTERS=20

# https://github.com/jsmess/jsmess/blob/master/makefile
# EMCC_FLAGS += -s TOTAL_MEMORY=16777216      # 16mb
# EMCC_FLAGS += -s TOTAL_MEMORY=33554432      # 32mb
# EMCC_FLAGS += -s TOTAL_MEMORY=67108864      # 64mb
# EMCC_FLAGS += -s TOTAL_MEMORY=134217728     # 128mb
EMCC_FLAGS += -s TOTAL_MEMORY=268435456     # 256mb
#EMCC_FLAGS += -s ALLOW_MEMORY_GROWTH=1

PWD=$(shell pwd)

all: glpk.js

glpk:
	cd $(PWD)/glpk-4.55; \
	emconfigure ./configure --host=none-none-none; \
	emmake make; \
	find $(PWD)/glpk-4.55/src -type f | grep '\.o\b' | EMCC_DEBUG=1 xargs emcc -O2 -o $(PWD)/glpk.bc # join all .o files

cson.bc:
	cd $(PWD); \
	emcc -O2 cson/cson_amalgamation_core.c -o cson.bc;

# seems odd, but..: include cson to avoid messing around with emscripten api
glpk.js: glpk cson.bc
	cd $(PWD); \
	EMDEBUG=1 em++ -O3 --memory-init-file 0 $(EMCC_FLAGS) \
	-Icson -Iglpk-4.55/src -Iglpk-4.55/src/env -Iglpk-4.55/src/misc glpk.js.c \
	--pre-js pre.js --post-js post.js  \
	cson.bc glpk.bc -o glpk.js \




