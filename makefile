dev:
	docker run -ti --rm \
	--name botw-chess \
	-u "node" \
	-v $(shell pwd):/usr/src/app \
	-w /usr/src/app \
	-p 8866:8866 \
	node:slim \
	npm run dev

build:
	docker run -ti --rm \
	-u "node" \
	-v $(shell pwd):/usr/src/app \
	-w /usr/src/app \
	node:slim \
	npm run build

install:
	docker run -ti --rm \
	-u "node" \
	-v $(shell pwd):/usr/src/app \
	-w /usr/src/app \
	-u "node" \
	node:slim \
	npm install

code:
	docker run -ti --rm \
	-v $(shell pwd):/usr/src/app \
	-w /usr/src/app \
	-p 8125\:8125 \
	-u "node" \
	node:slim \
	bash
