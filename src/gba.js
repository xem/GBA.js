/******
  GBA
*******/
GBA = {

  // Emulator globals
  canvas: 0,                                              // canvas 2D
  pixels: 0,                                              // pixels map
  worker: 0,                                              // Web Worker
  trace: "",                                              // debug
  loops: 0,                                               // loop counter
  thumb: 0,                                               // THUMB mode shortcut
  stopped: false,                                         // stopped (game over)

  // GBA globals
  r: [0,0,0,0,0,0,0,0,0,0,0,0,0,0x3007F00,0,0x8000000,0], // CPU registers R0 - R15 (R16 = void)
  cpsr: 0,                                                // CPU status register
  m: {2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 0xE:[]},        // GBA memory as byte arrays
  rom_arm: [],                                            // ROM converted in ARM instructions
  rom_thumb: [],                                          // ROM converted in THUMB instructions
  rom_halfword: [],                                       // ROM converted in 16-bit half-words
  rom_word: []                                            // ROM converted in 32-bit words

}

// CPSR operations
GBA.update_cpsr_n = function(rd){
  if(GBA.bit(GBA.r[rd],31) === 1){                        // if Rd.31 (sign bit) == 1
    GBA.cpsr |= 0x80000000;                               // CPSR.31 (negative flag) = 1
  }
  else{                                                   // else
    GBA.cpsr &= 0x7FFFFFFF;                               // CPSR.31 = 0
  }
}

GBA.update_cpsr_z = function(rd){
  if(GBA.r[rd] === 0){                                    // if Rd === 0 
    GBA.cpsr |= 0x40000000;                               // CPSR.30 (bit 30 of CPSR - Zero flag) = 1
  }
  else{                                                   // else
    GBA.cpsr &= 0xBFFFFFFF;                               // CPSR.30 = 0
  }
}

GBA.update_cpsr_c = function(rd){
  if(GBA.r[rd] > 0xFFFFFFFF){                             // if Rd > 32 bits
    GBA.cpsr |= 0x20000000;                               // CPSR.29 (bit 29 of CPSR - carry flag) = 1
    GBA.r[rd] = GBA.bit(GBA.r[rd], 0, 31);                // keep Rd 32-bit long
  }
  else{                                                   // else
    GBA.cpsr &= 0xDFFFFFFF;                               // CPSR.29 = 0
  }
}

GBA.update_cpsr_c_sub = function(v1, v2){
  var c = false;
  if(v1 === v2){
    c = true;
  }
  else if(v2 < v1){
    c = (v1 - v2) < (v1 + (Math.pow(2, v1.toString(2).length) - 1 - v2));
  }
  else if(v1 > v2){
    c = (v2 - v1) > (v2 + (Math.pow(2, v2.toString(2).length) - 1 - v1));
  }
  if(c)
  {
    GBA.cpsr |= 0x20000000;                               // CPSR.29 (bit 29 of CPSR - carry flag) = 1
  }
  else{                                                   // else
    GBA.cpsr &= 0xDFFFFFFF;                               // CPSR.29 = 0
  }
}

GBA.update_cpsr_v = function(rd){

}
