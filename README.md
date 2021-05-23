# standalone wasm from emscripten

This branch shows an example of using emscripten without the javascript glue.

It may not folow "best practices", but may be all we have to work with for now.

The trick here is to compile the code into a dynamic library in WASM, which can the be instantiated as a module (at least i think that's what is happening!).

here is a super simple example with two C functions that perform operations on an integer.

To compile with emscripten try:
```
emcc arithmetic.c -Os -s WASM=1 -s SIDE_MODULE=1 -s EXPORTED_FUNCTIONS=doubler,incrementer -o arithmetic.wasm
```

the SIDE_MODULE flag is what tells emscripten to make a dynamic lib.

Use `python -m http.server` or similar simple file server to view the webpage in a browser. 

The javascript here makes two instances of the module and calls exported functions from them upon button click.

glhf, talk to yall soon :)

some links i found useful / used here:

- https://github.com/emscripten-core/emscripten/wiki/WebAssembly-Standalone
- https://github.com/mikerourke/learn-webassembly/tree/master/chapter-05-create-load-module
- https://github.com/mdn/webassembly-examples/tree/master/js-api-examples
- https://emscripten.org/docs/getting_started/FAQ.html#can-i-use-multiple-emscripten-compiled-programs-on-one-web-page

eventually we will need:
- https://kripken.github.io/blog/wasm/2019/07/16/asyncify.html

... and I hope to have a demo like:
- https://blog.ttulka.com/learning-webassembly-10-image-processing-in-assemblyscript?ref=hackernoon.com
