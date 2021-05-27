## glue demo

compile with emscripten:

```
emcc blue_red.c -O3 -s WASM=1 -s USE_SDL=2 -s MODULARIZE=1 -s EXPORT_NAME="blue_red_0" -s ASYNCIFY=1 -o blue_red.js
```

&

```
emcc green_yellow.c -O3 -s WASM=1 -s USE_SDL=2 -s MODULARIZE=1 -s EXPORT_NAME="green_yellow_busy" -s ASYNCIFY=1 -o green_yellow_busy.js
```
