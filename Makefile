.PHONY: test
test: npm-shrinkwrap.json
	node_modules/.bin/tsc --module commonjs big.ts
	node_modules/.bin/mocha

npm-shrinkwrap.json: package.json
	npm install
	npm shrinkwrap
