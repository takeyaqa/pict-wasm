# To use another compiler, such clang++, set the CXX variable
# CXX=clang++
# variables used to generate a source snapshot of the GIT repo
COMMIT=$(shell git log --pretty=format:'%H' -n 1)
SHORT_COMMIT=$(shell git log --pretty=format:'%h' -n 1)
CXXFLAGS=-fPIC -pipe -std=c++11 -O2 -Iapi
TARGET=pict
TARGET_LIB_SO=libpict.so
TEST_OUTPUT = test/rel.log test/rel.log.failures test/dbg.log
TEST_OUTPUT += test/.stdout test/.stderr
OBJS = $(OBJS_API) $(OBJS_CLI)
OBJS_API = api/combination.o api/deriver.o api/exclusion.o
OBJS_API += api/model.o api/parameter.o api/pictapi.o
OBJS_API += api/task.o api/worklist.o
OBJS_CLI = cli/ccommon.o cli/cmdline.o
OBJS_CLI += cli/common.o cli/cparser.o cli/ctokenizer.o cli/gcd.o
OBJS_CLI += cli/gcdexcl.o cli/gcdmodel.o cli/model.o cli/mparser.o
OBJS_CLI += cli/pict.o cli/strings.o
IMAGE := pict:latest

# WebAssembly Settings
EXX=em++
EXXFLAGS=-std=c++11 -Oz -Iapi -flto -fwasm-exceptions -sSTRICT=1
EXXLINKFLAGS=-sALLOW_MEMORY_GROWTH=1 -sMALLOC=emmalloc -sWASMFS=1 -sFORCE_FILESYSTEM=1
EXXLINKFLAGS+=-sMODULARIZE=1 -sEXPORT_ES6=1 -sINVOKE_RUN=0
EXXLINKFLAGS+=-sINCOMING_MODULE_JS_API=print,printErr
EXXLINKFLAGS+=-sEXPORTED_RUNTIME_METHODS=callMain,FS
TARGET_WASM_DIR=dist
TARGET_JS=pict.mjs
TARGET_TSD=pict.d.ts
WASM_WORK_DIR=wasm-work
WASM_OBJS=$(WASM_OBJS_API) $(WASM_OBJS_CLI)
WASM_OBJS_API=$(WASM_WORK_DIR)/api/combination.o $(WASM_WORK_DIR)/api/deriver.o $(WASM_WORK_DIR)/api/exclusion.o
WASM_OBJS_API+=$(WASM_WORK_DIR)/api/model.o $(WASM_WORK_DIR)/api/parameter.o $(WASM_WORK_DIR)/api/pictapi.o
WASM_OBJS_API+=$(WASM_WORK_DIR)/api/task.o $(WASM_WORK_DIR)/api/worklist.o
WASM_OBJS_CLI=$(WASM_WORK_DIR)/cli/ccommon.o $(WASM_WORK_DIR)/cli/cmdline.o
WASM_OBJS_CLI+=$(WASM_WORK_DIR)/cli/common.o $(WASM_WORK_DIR)/cli/cparser.o $(WASM_WORK_DIR)/cli/ctokenizer.o $(WASM_WORK_DIR)/cli/gcd.o
WASM_OBJS_CLI+=$(WASM_WORK_DIR)/cli/gcdexcl.o $(WASM_WORK_DIR)/cli/gcdmodel.o $(WASM_WORK_DIR)/cli/model.o $(WASM_WORK_DIR)/cli/mparser.o
WASM_OBJS_CLI+=$(WASM_WORK_DIR)/cli/pict.o $(WASM_WORK_DIR)/cli/strings.o

pict: $(OBJS)
	$(CXX) $(OBJS) -o $(TARGET)

$(TARGET_LIB_SO): $(OBJS)
	$(CXX) -fPIC -shared $(OBJS) -o $(TARGET_LIB_SO)

test: $(TARGET)
	cd test; perl test.pl ../$(TARGET) rel.log

clean:
	rm -f $(TARGET) $(TARGET_LIB_SO) $(TEST_OUTPUT) $(OBJS)

all: pict $(TARGET_LIB_SO)

source: clean
	git archive --prefix="pict-$(COMMIT)/" -o "pict-$(SHORT_COMMIT).tar.gz" $(COMMIT)

.PHONY: all test clean source

image-build:
	@podman build --layers=true -t $(IMAGE) .

image-run:
	@podman run -it --rm -v ./doc/sample-models:/var/pict:Z $(IMAGE) create_volume.txt

# WebAssembly Build

wasm-prepare:
	mkdir -p $(WASM_WORK_DIR)/api
	mkdir -p $(WASM_WORK_DIR)/cli
	mkdir -p $(TARGET_WASM_DIR)

$(WASM_WORK_DIR)/%.o: %.cpp
	$(EXX) $(EXXFLAGS) -c $(OUTPUT_OPTION) $<

wasm: wasm-prepare $(WASM_OBJS)
	$(EXX) $(WASM_OBJS) -Oz --emit-tsd=$(TARGET_TSD) -flto -fwasm-exceptions $(EXXLINKFLAGS) -o $(TARGET_WASM_DIR)/$(TARGET_JS)

wasm-clean:
	rm -rf $(WASM_WORK_DIR)
	rm -rf $(TARGET_WASM_DIR)
