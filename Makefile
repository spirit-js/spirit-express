COLOR = \033[1;33m
COLOR_RESET = \033[0m

default: build

bench: build
	@NODE_ENV=production go run benchmarks/runner.go

clean:
	@if [ -a uploads/ ] ; \
	then \
		rm -r uploads/ ; \
	fi;
	@rm -r lib/

build:
	@echo "Building src..."
	@node_modules/.bin/babel src -d lib

release:
	@rm -r uploads/
	make clean
	make test

watch:
	@echo "Auto building..."
	node_modules/.bin/babel src -d lib

test: build
	@echo "\n$(COLOR)Running tests...$(COLOR_RESET)"
	@node_modules/.bin/jasmine ${file}
	@echo "\n"

test-ci: build
	@node_modules/.bin/babel examples/*.js -d examples/test
	@npm install --prefix ./examples
	@rm -r ./examples/etc
	@node_modules/.bin/istanbul cover -x "**/spec/**" -x "**/examples/**" node_modules/jasmine/bin/jasmine.js

.PHONY: default build test watch bench test-ci clean release
