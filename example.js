// example.js
const binaryen = require("binaryen");
 
// Create a module from text.
const ir = new binaryen.parseText(`
  (module
    (memory 1 1)
    (import "env" "before" (func $before))
    (import "env" "sleep" (func $sleep (param i32)))
    (import "env" "after" (func $after))
    (export "memory" (memory 0))
    (export "main" (func $main))
    (func $main
      (call $before)
      (call $sleep (i32.const 2000))
      (call $after)
    )
  )
`);

// Run the Asyncify pass, with (minor) optimizations.
binaryen.setOptimizeLevel(1);
ir.runPasses(['asyncify']);

// Get a WebAssembly binary and compile it to an instance.
const binary = ir.emitBinary();
const compiled = new WebAssembly.Module(binary);
const instance = new WebAssembly.Instance(compiled, {
  env: {
    before: function() {
      console.log('before!');
      setTimeout(function() {
        console.log('(an event that happens during the sleep)');
      }, 1000);
    },
    sleep: function(ms) {
      if (!sleeping) {
        // We are called in order to start a sleep/unwind.
        console.log('sleep...');
        // Fill in the data structure. The first value has the stack location,
        // which for simplicity we can start right after the data structure itself.
        view[DATA_ADDR >> 2] = DATA_ADDR + 8;
        // The end of the stack will not be reached here anyhow.
        view[DATA_ADDR + 4 >> 2] = 1024;
        wasmExports.asyncify_start_unwind(DATA_ADDR);
        sleeping = true;
        // Resume after the proper delay.
        setTimeout(function() {
          console.log('timeout ended, starting to rewind the stack');
          wasmExports.asyncify_start_rewind(DATA_ADDR);
          // The code is now ready to rewind; to start the process, enter the
          // first function that should be on the call stack.
          wasmExports.main();
        }, ms);
      } else {
        // We are called as part of a resume/rewind. Stop sleeping.
        console.log('...resume');
        wasmExports.asyncify_stop_rewind();
        sleeping = false;
      }
    },
    after: function() {
      console.log('after!');
    }
  }
});
const wasmExports = instance.exports;
const view = new Int32Array(wasmExports.memory.buffer);

// Global state for running the program.
const DATA_ADDR = 16; // Where the unwind/rewind data structure will live.
let sleeping = false;

// Run the program. When it pauses control flow gets to here, as the
// stack has unwound.
wasmExports.main();
console.log('stack unwound');
wasmExports.asyncify_stop_unwind();