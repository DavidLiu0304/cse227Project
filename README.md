# cse227Project

Tutorial to compile C code into WASM
https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm

1. Download Enscripten<br>
https://emscripten.org/docs/getting_started/downloads.html#sdk-download-and-install

2. Locate emscripten folder and put project folder there.<br>
ex. cd /Users/davidliu/cse227/emsdk/upstream/emscripten<br>
Clone git repo<br>
git clone https://github.com/DavidLiu0304/cse227Project.git

3. Testing
Compile c code into wasm code<br>
**note** calling emcc is different from linux to window. It is located in the emscripten folder.<br>
./../emcc -o hello3.html hello3.c -O3 -s WASM=1 --shell-file html_template/shell_minimal.html -s NO_EXIT_RUNTIME=1  -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall']"<br><br>
Open new terminal and go to project folder<br>
ex. cd /Users/davidliu/cse227/emsdk/upstream/emscripten/project<br><br>
Open python simple server<br>
python3 -m http.server<br>
https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server<br><br>
Open chrome and go to http://localhost:8000/hello3.html<br>
You should see “Hello World” in the webpage
