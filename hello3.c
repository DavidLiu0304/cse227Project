#include <stdio.h>
#include <emscripten/emscripten.h>

int main() {
    printf("Hello World\n");
}


EMSCRIPTEN_KEEPALIVE void myFunction(int argc, char ** argv) {
    printf("MyFunction Called\n");
}

