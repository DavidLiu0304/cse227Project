const fs = require('fs')
const metering = require('../')
const binaryen = require("binaryen");

// Combining Metering with Asyncify
const ir = new binaryen.parseText(`
  (module
    (memory 1 1)
    (import "env" "fun1" (func $fun1))
    (import "env" "fun2" (func $fun2))
    (import "env" "fun3" (func $fun3))
    (export "memory" (memory 0))
    (export "main" (func $main))
    (func $main
      (call $fun1)
      (call $fun2)
      (call $fun3)
    )
  )
`);

binaryen.setOptimizeLevel(1);
ir.runPasses(['asyncify']);
const wasm = ir.emitBinary();

//const wasm = fs.readFileSync(`${__dirname}/fac.wasm`)
const meteredWasm = metering.meterWASM(wasm, {
  meterType: 'i32'
})

const limit = 4000 //90000000
let totalGas = 0
let gasUsed = 0

const mod = new WebAssembly.Module(meteredWasm)
const instance = new WebAssembly.Instance(mod, {
  'metering': {
    'usegas': (gas) => {
      gasUsed += gas
      totalGas += gas
      if (gasUsed > limit) {
        gasUsed = 0
        console.log("event")
        ms = 2000
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
        //throw new Error('out of gas!')
      }
    }
  },
  env: {
    fun1: function() {
      console.log('First Function');
    },
    fun2: function() {
      console.log("Second Function");
    },
    fun3: function() {
      console.log('Third Function');
    }
  }
})
const wasmExports = instance.exports;
const view = new Int32Array(wasmExports.memory.buffer);

// Global state for running the program.
const DATA_ADDR = 16; // Where the unwind/rewind data structure will live.
let sleeping = false;

wasmExports.main();
console.log('stack unwound');
wasmExports.asyncify_stop_unwind();

//const result = instance.exports.fac(6)
console.log(`gas used ${gasUsed * 1e-4}`) 
console.log(`Total gas used ${totalGas * 1e-4}`) 
