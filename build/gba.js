/******************************************\
*   _____   ____                  _        *
*  / ____| |  _ \     /\         (_)       *
* | |  __  | |_) |   /  \         _   ___  *
* | | |_ | |  _ <   / /\ \       | | / __| *
* | |__| | | |_) | / ____ \   _  | | \__ \ *
*  \_____| |____/ /_/    \_\ (_) | | |___/ *
*                               _/ |       *
*  == A HTML5 GBA EMULATOR ==  |__/        *
\******************************************/

/** Shortcut functions **/

/*
 * debug mode
 * if the debug var is not defined, set it to false.
 */
 if(typeof debug === "undefined"){
  debug = false;
 }

/* 
 * $()
 * Select an element.
 * @param i: the element's id.
 */
function $(i){
  return document.getElementById(i);
}

/*
 * hex()
 * Write a number in hexadecimal.
 * @param n: the number.
 * @param i: the length of the hexadecimal value (default: auto).
 */
function hex(n,i){
  if(i){
    return ("0000000" + n.toString(16).toUpperCase()).slice(-i);
  }
  return n.toString(16).toUpperCase();
}

/*
 * lshift()
 * left shift.
 * lshift(a,b) returns the correct value of a << b.
 */
function lshift(number, shift){
  return number * Math.pow(2, shift);
}

/*
 * rshift()
 * right shift.
 * rshift(a,b) returns the correct value of a >> b.
 */
function rshift(number, shift){
  return Math.floor(number / Math.pow(2, shift));
}

/*
 * bit()
 * Extracts some bits in the binary representation of a number.
 */
function bit(number, start, end){
  return rshift(number, start) & (Math.pow(2, (end || start) - start + 1) - 1);
}

/*
 * ror()
 * perform a right rotation in the binary representation of a number.
 */
function ror(number, length, bits){
  return lshift((number & Math.pow(2, bits) - 1), length - bits) + rshift(number, bits);
}

/** CPU **/

/*
 * Registers
 * The GBA's CPU has 16 registers (unsigned, 32-bit).
 * r0-r12: general purpose.
 * r13: stack pointer (SP).
 * r14: link register (LR).
 * r15: program counter (PC).
 * r16: used here to store the result of void operations.
 */
r = new Uint16Array(new ArrayBuffer(32));
r[13] = 0x3007F00;
r[15] = 0x8000000;

/*
 * Current program status register,
 * Stored program status register.
 */
cpsr = 0;
spsr = 0;

/** Memory **/

/*
 * The memory (m) contains 8 useful parts.
 * Each part is an ArrayBuffer representing an address range:
 * m2: on-board WRAM. (256kb)
 * m3: on-chip WRAM. (32kb)
 * m4: I/O registers. (1kb)
 * m5: palette RAM. (1kb)
 * m6: VRAM. (96kb)
 * m7: OBJ attributes. (1kb)
 * m8: Game Pak ROM. (32mb)
 * mE: Game Pak SRAM. (64kb)
 *
 * m8, m16 and m32 will contain 8-bit, 16-bit and 32-bit views of the memory.
 */
m = [
  ,,
  new ArrayBuffer(256 * 1024),
  new ArrayBuffer(32 * 1024),
  new ArrayBuffer(1024),
  new ArrayBuffer(1024),
  new ArrayBuffer(96 * 1024),
  new ArrayBuffer(1024),
  ,,,,,,
  new ArrayBuffer(64 * 1024)
];

m8 = [];
m16 = [];
m32 = [];

/*
 * mem()
 * read or write data in the memory.
 * @param address: the address to read or write.
 * @param bytes: the length of the value to read or write, in bytes (1, 2 or 4).
 * @param value (optional): the value to write.
 * @param mask (optional): the bit mask to apply to the written value.
 * @return: if a value is specified, it is written in memory.
 *          Else, the the read value is returned.
 */
function mem(address, bytes, value, mask){

  // Vars
  var i, prefix, write, view;

  // Detect write operations
  write = value !== undefined;

  // Select the right view
  if(bytes === 1){
    view = m8;
  }

  if(bytes === 2){
    view = m16;
  }

  if(bytes === 4){
    view = m32;
  }

  // Get prefix (bits 24-27 of address)
  prefix = rshift(address, 24);

  // Get the prefix-free address, handle the mirrors
  switch(prefix){
    case 2:
      address = (address - 0x2000000) % 0x40000;
      break;

    case 3:
      address = (address - 0x3000000) % 0x8000;
      break;

    case 4:
      address = (address - 0x4000000);
      if(write){
        //io(address, value);
      }
      break;

    case 5:
      address = (address - 0x5000000) % 0x400;
      break;

    case 6:
      address = (address - 0x6000000) % 0x20000;
      if(address > 0x17FFF && address < 0x20000){
        address -= 8000;
      }
      if(write){
        //vram(address, value, bytes);
      }
      break;

    case 7:
      address = (address - 0x7000000) % 0x400;
      break;

    case 8:
    case 9:
    case 0xa:
    case 0xb:
    case 0xc:
    case 0xd:
      prefix = 8;
      address = address % 0x2000000;
      break;

    case 0xE:
    case 0xF:
      prefix = 0xE;
      address = address % 0x1000000;
      break;
  }

  // Write a value
  if(write){
    view[prefix][address / bytes] = value;
  }

  // Read a value
  else {
    return view[prefix][address / bytes] || 0;
  }
}

/** Screen **/

/*
 * The GBA's screen has four layers, each of them is represented by a canvas.
 * There are four ImageData to edit each canvas as a bitmap.
 */
canvas = [];
imagedata = [];
for(i = 0; i < 4; i++){
  canvas.push($("canvas" + i).getContext("2d"));
  imagedata.push(canvas[i].createImageData(240, 160));
}

/** ROM loader **/

/*
 * load()
 * Load a ROM, save it in the memory and create different views
 * @param p: the ROM's path
 */
function load(p){

  // Vars
  var i, xhr;

  // Use AJAX to read the ROM as an arraybuffer
  xhr = new XMLHttpRequest;
  xhr.open('GET', p);
  xhr.responseType = 'arraybuffer';
  xhr.send();
  
  // When it is loaded:
  xhr.onload = function(){

    // Add it in the memory
    m[8] = xhr.response;

    // Create 8-bits, 16-bits and 32-bits views of the 8 memory sections
    for(i = 0; i < 16; i++){
      if(m[i]){
        m8[i] = new Uint8Array(m[i]);
        m16[i] = new Uint16Array(m[i]);
        m32[i] = new Uint32Array(m[i]);
      }
    }
  }
}

/** ROM conversion **/

/*
 * The ROM is interpreted as:
 * ARM instructions (32-bit).
 * THUMB instructions (16-bit).
 * These arrays contain each opcode's function, params and assembler code.
 * ARM opcodes are conditional, their conditions are stored in a fourth array.
 */
arm_opcode = [];
arm_params = [];
arm_asm = [];
arm_cond = [];

thumb_opcode = [];
thumb_params = [];
thumb_asm = [];

/*
 * convert_all()
 * For debug purpose only, optional.
 * Try to convert all the ROM in ARM and THUMB instructions.
 * Invalid results when it's used on data or on the wrong instruction set. 
 */
function convert_all(){
  // Vars
  var i;
  
  // ARM
  for(i = 0; i < m32[8].length; i++){
    convert_ARM(i);
  }
  
  // THUMB
  for(i = 0; i < m16[8].length; i++){
    convert_THUMB(i);
  }
}

/*
 * convert_ARM(a,t)
 * Convert a 32-bit instruction to ARM and Assembler code.
 * @param i: the instruction to convert (as an index of m32).
 */
function convert_ARM(i){

  // Vars
  var cond, condname, opcode, mask, op2;

  // Default ASM value: unknown.
  arm_asm[i] = "?";

  // Read the instruction.
  instr = m32[8][i];

  // Read the instruction's condition.
  cond = arm_cond[i] = bit(instr, 28, 31);
  condname = "";
  if(cond === 0) condname = "EQ";
  if(cond === 1) condname = "NE";
  if(cond === 2) condname = "CS";
  if(cond === 3) condname = "CC";
  if(cond === 4) condname = "MI";
  if(cond === 5) condname = "PL";
  if(cond === 6) condname = "VS";
  if(cond === 7) condname = "VC";
  if(cond === 8) condname = "HI";
  if(cond === 9) condname = "LS";
  if(cond === 0xA) condname = "GE";
  if(cond === 0xB) condname = "LT";
  if(cond === 0xC) condname = "GT";
  if(cond === 0xD) condname = "LE";
  if(cond === 0xF) condname = "NV";

  // ARM3 opcodes
  if(bit(instr, 8, 27) === 0x012FFF){

    // BX Rn
    arm_opcode[i] = arm_bx;
    arm_params[i] = [bit(instr, 0, 3)];
    arm_asm[i] = "BX" + condname + " r" + arm_params[i][0];
  }

  // ARM4 opcodes
  else if(bit(instr, 25, 27) === 0x5){
    opcode = bit(instr, 24);
    arm_params[i] = [0x8000000 + i * 4 + 8 + bit(instr, 0, 23) * 4];

    // BL address (if opcode = 1)
    if(opcode){
      arm_opcode[i] = arm_bl;
      arm_asm[i] = "BL";
    }

    // B address (if opcode = 0)
    else{
      arm_opcode[i] = arm_b;
      arm_asm[i] = "B";
    }

    arm_asm[i] += condname + " 0x" + hex(arm_params[i][0]);

    if(arm_params[i][0] < 0x8000000 + i * 4){
      arm_asm[i] += " ;↑"
    }
    if(arm_params[i][0] > 0x8000000 + i * 4){
      arm_asm[i] += " ;↓"
    }
    if(arm_params[i][0] === 0x8000000 + i * 4){
      arm_asm[i] += " ;←"
    }
  }

  // ARM9 opcodes
  else if(bit(instr, 26, 27) === 0x1){

    // LDR / STR Rd, Imm (if Rn = PC)
    if(bit(instr, 16, 19) === 15){

      // Params
      arm_params[i] = [bit(instr, 12, 15), mem(0x8000000 + i * 4 + 8 + bit(instr, 0, 11),4)];

      // LDR Rd, Imm (if L = 1)
      if(bit(instr, 20)){
        arm_opcode[i] = arm_ldr_ri;
        arm_asm[i] = "LDR";
      }

      // STR Rd, Imm (if L = 0)
      else{
        arm_opcode[i] = arm_str_ri;
        arm_asm[i] = "STR";
      }

      // Assembler
      arm_asm[i] += condname + " r" + arm_params[i][0] + ",=#0x" + hex(arm_params[i][1].toString(16));
    }

    // LDR / STR Rd, Rn, nn (if Rn != PC)
    else{

      // Params
      arm_params[i] = [bit(instr, 12, 15), bit(instr, 16, 19), bit(instr, 0, 11)];

      // LDR Rd, [Rn, nn] (if L = 1)
      if(bit(instr, 20)){
        arm_opcode[i] = arm_ldr_rrn;
        arm_asm[i] = "LDR";
      }

      // STR Rd, [Rn, nn] (if L = 0)
      else{
        arm_opcode[i] = arm_str_rrn;
        arm_asm[i] = "STR";
      }

      // Assembler
      arm_asm[i] += condname + " r" + arm_params[i][0] + ",[r" + arm_params[i][1] + ",0x" + hex(arm_params[i][2]) + "]";
    }
  }

  // ARM7 opcodes
  else if(bit(instr, 25, 27) === 0x0 && bit(instr, 7) === 0x0 && bit(instr, 12, 15) != 0xF){
    arm_opcode[i] = null;
    arm_params[i] = [];
    arm_asm[i] = "ARM7";
  }

  // ARM5/6 opcodes
  else{

    // Reset mask
    mask = 0;

    // ARM6 opcodes
    if(!bit(instr, 18) && bit(instr, 21, 24) >= 8 && bit(instr, 21, 24) <= 0xB){

      // allow to write on flags (bits 24-31) (if f = 1)
      if(bit(instr, 19) === 1){
        mask += 0xFF000000;
      }

      // allow to write on controls (bits 0-7) (if c = 1)
      if(bit(instr, 16) === 1){
        mask += 0xFF;
      }

      // MSR params
      arm_params[i] = [bit(instr, 0, 3), bit(instr, 19), bit(instr, 16), mask];

      // MSR spsr{f}{c}, op (if psr = 1)
      if(bit(instr, 22)){
        arm_opcode[i] = arm_msr_spsr;
        arm_asm[i] = "MSR" + condname + " spsr_" + (arm_params[i][1] ? "f" : "") + (arm_params[i][2] ? "c" : "") + ",r" + arm_params[i][0];
      }

      // MSR cpsr{f}{c}, op (if psr = 0)
      else{
        arm_opcode[i] = arm_msr_cpsr;
        arm_asm[i] = "MSR" + condname + " cpsr_" + (arm_params[i][1] ? "f" : "") + (arm_params[i][2] ? "c" : "") + ",r" + arm_params[i][0];
      }
    }

    // ARM5 opcodes
    else{

      // Reset Op2
      op2 = 0;

      // Compute Op2 (if I = 1)
      if(bit(instr, 25)){
        is = bit(instr, 8, 11) * 2;
        nn = bit(instr, 0, 7);
        op2 = ror(nn, 32, is);
      }

      // Opcodes
      switch(bit(instr, 21, 24)){
        case 0x0:
          break;

        case 0x1:
          break;

        case 0x2:
          break;

        case 0x3:
          break;

        // ADD
        case 0x4:

          // ADD rd, Imm (if Rn = PC)
          if(bit(instr, 16, 19) === 15){
            arm_opcode[i] = arm_add_ri;
            arm_params[i] = [bit(instr, 12, 15), 0x8000000 + i * 4 + 8 + op2];
            arm_asm[i] = "ADD r" + arm_params[i][0] + ",=#0x" + hex(arm_params[i][1]);
          }

          // ADD Rd, Rn, Op2 (if Rn != PC)
          else{
            arm_opcode[i] = arm_add_rrn;
            arm_params[i] = [bit(instr, 12, 15), bit(instr, 16, 19), op2];
            arm_asm[i] = "ADD r" + arm_params[i][0] + ",r" + arm_params[i][1] + ",0x" + hex(arm_params[i][2]);
          }
          break;

        case 0x5:
          break;

        case 0x6:
          break;

        case 0x7:
          break;

        case 0x8:
          break;

        case 0x9:
          break;

        case 0xA:
          break;

        case 0xB:
          break;

        case 0xC:
          break;

        // MOV Rd, Op2
        case 0xD:
          arm_opcode[i] = arm_mov;
          arm_params[i] = [bit(instr, 12, 15), op2];
          arm_asm[i] = "MOV r" + arm_params[i][0] + ",0x" + hex(arm_params[i][1]);
          break;

        case 0xE:
          break;

        case 0xF:
          break;
      }
    }
  }

  if(debug && $("armvalue" + hex(0x8000000 + i * 4))){
    $("armvalue" + hex(0x8000000 + i * 4)).innerHTML = hex(m32[8][i], 8);
    $("armname" + hex(0x8000000 + i * 4)).innerHTML = arm_asm[i];
  }
}

/*
 * convert_THUMB(a,t)
 * Convert a 16-bit instruction to THUMB and Assembler code.
 * @param i: the instruction to convert (as an index of m16).
 */
function convert_THUMB(a){

}

/** Trace **/

/*
 * trace()
 * For debug purpose only.
 * Decode and execute the next instruction, update the debug interface.
 */
function trace(){

}

/** Play **/

/*
 * play()
 * Launch the ROM
 */
function play(){

}

/** Opcodes **/

// ARM3
arm_bx = function(p){                                     // THUMB mode
}

arm_blx = function(p){
}

//ARM4
arm_b = function(p){                                   // PC = label
}

arm_bl = function(p){
}

// ARM5
arm_add_rrn = function(p){
}

arm_add_ri = function(p){
}

arm_mov = function(p){
}

// ARM6
arm_msr_cpsr = function(p){
}

arm_msr_spsr = function(p){

}

// ARM7
arm7 = function(){}

// ARM9
arm_str_rrn = function(p){
}

arm_ldr_rrn = function(p){
}

arm_str_ri = function(p){
}

arm_ldr_ri = function(p){
}