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
      console.log('Module 1: first function!');
      setTimeout(function() {
        console.log('Module 1: (an event that happens during the sleep)');
      }, 1000);
    },
    sleep: function(ms) {
      if (!sleeping) {
        // We are called in order to start a sleep/unwind.
        console.log('Module 1: sleep...');
        // Fill in the data structure. The first value has the stack location,
        // which for simplicity we can start right after the data structure itself.
        view[DATA_ADDR >> 2] = DATA_ADDR + 8;
        // The end of the stack will not be reached here anyhow.
        view[DATA_ADDR + 4 >> 2] = 1024;
        wasmExports.asyncify_start_unwind(DATA_ADDR);
        sleeping = true;
        // Resume after the proper delay.
        setTimeout(function() {
          console.log('Module 1: timeout ended, starting to rewind the stack');
          wasmExports.asyncify_start_rewind(DATA_ADDR);
          // The code is now ready to rewind; to start the process, enter the
          // first function that should be on the call stack.
          wasmExports.main();
        }, ms);
      } else {
        // We are called as part of a resume/rewind. Stop sleeping.
        console.log('Module 1: ...resume');
        wasmExports.asyncify_stop_rewind();
        sleeping = false;
      }
    },
    after: function() {
      console.log('Module 1: Ending!');
    }
  }
});
const wasmExports = instance.exports;
const view = new Int32Array(wasmExports.memory.buffer);

// second module
const compiled2 = new WebAssembly.Module(binary);
const instance2 = new WebAssembly.Instance(compiled2, {
  env: {
    before: function() {
      console.log('Module 2: first function!');
      setTimeout(function() {
        console.log('Module 2: (an event that happens during the sleep)');
      }, 1000);
    },
    sleep: function(ms) {
      if (!sleeping2) {
        // We are called in order to start a sleep/unwind.
        console.log('Module 2: sleep...');
        // Fill in the data structure. The first value has the stack location,
        // which for simplicity we can start right after the data structure itself.
        view2[DATA_ADDR >> 2] = DATA_ADDR + 8;
        // The end of the stack will not be reached here anyhow.
        view2[DATA_ADDR + 4 >> 2] = 1024;
        wasmExports2.asyncify_start_unwind(DATA_ADDR);
        sleeping2 = true;
        // Resume after the proper delay.
        setTimeout(function() {
          console.log('Module 2: timeout ended, starting to rewind the stack');
          wasmExports2.asyncify_start_rewind(DATA_ADDR);
          // The code is now ready to rewind; to start the process, enter the
          // first function that should be on the call stack.
          wasmExports2.main();
        }, ms);
      } else {
        // We are called as part of a resume/rewind. Stop sleeping.
        console.log('Module 2: ...resume');
        wasmExports2.asyncify_stop_rewind();
        sleeping2 = false;
      }
    },
    after: function() {
      console.log('Module 2: Ending!');
    }
  }
});
const wasmExports2 = instance2.exports;
const view2 = new Int32Array(wasmExports2.memory.buffer);



// Global state for running the program.
const DATA_ADDR = 16; // Where the unwind/rewind data structure will live.
let sleeping = false;

// Run the program. When it pauses control flow gets to here, as the
// stack has unwound.
wasmExports.main();
console.log('Module 1: stack unwound');
wasmExports.asyncify_stop_unwind();

// Global state for running the program.
// const DATA_ADDR = 16; // Where the unwind/rewind data structure will live.
sleeping2 = false;

// Run the program. When it pauses control flow gets to here, as the
// stack has unwound.
wasmExports2.main();
console.log('Module 2: stack unwound');
wasmExports2.asyncify_stop_unwind();