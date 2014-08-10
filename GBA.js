/************/
/** GBA.js **/
/************/

/********** Debug tools **********/ {
// Debug mode, disabled by default
debug_mode = false;

// Trace mode (step-by-step execution), disabled by default
trace_mode = false

// x(): write a number in hexadecimal
// @param n: the number
// @param i (optional): the length of the hexadecimal value, with leading zeros (max: 8)
x = function(n,i){return((i?1e7:"")+n.toString(16).toUpperCase()).slice(-i)}

// Debug page initialization
init_debugger = function(){

  var html;

  // Enable debug mode
  debug_mode = true;

  // Populate ARM debugger
  html = "<b>ARM</b><br>";
  for(i=0x8000000;i<=0x8001000;i+=4){
    if((i>0x8000000&&i<0x80000C0)||(i>0x80000C0&&i<0x80000E0)){continue}
    html+="<span id=debug_arm_"+x(i)+">"+x(i)+" <span id=debug_arm_value_"+x(i)+">????????</span> <span id=debug_arm_name_"+x(i)+">?</span></span>\n";
    if(i==0x8000000||i==0x80000C0){html += "...\n"}
  }
  debug_arm.innerHTML = html;

  // Populate THUMB debugger
  html = "<b>THUMB</b><br>";
  for(i=0x8000000;i<=0x8001000;i+=2){
    if(i==0x8000000){
      html+="...\n";
    }
    if(i>=0x80000E0){
      html+="<span id=debug_thumb_"+x(i)+"><span id=debug_thumb_address_"+x(i)+">"+x(i)+"</span> <span id=debug_thumb_value_"+x(i)+">????</span> <span id=debug_thumb_name_"+x(i)+">?</span></span>\n";
    }
  }
  debug_thumb.innerHTML = html;

  // Populate IWRAM debugger
  html = "<b>WRAM</b><br>";
  for(i=0x3008000;i>=0x3000000;i-=4)
    html+=x(i)+" <span id=memory"+x(i)+">00000000</span>\n";
  debug_wram.innerHTML = html;

  // Highlight first ARM instruction
  debug_arm_8000000.className = "debug_highlight";
}

// update_r(): update the value of a register
// @param rd: the register
update_r = function(rd){
  if(debug_mode){
    top["r" + rd].innerHTML = x(r[rd], 8);
  }
}

// convert_all()
// Try to read all the ROM as ARM and THUMB instructions
convert_all = function(){

  // Vars
  var i, pc_backup;

  // Backup PC
  pc_backup = r[15];

  // ARM
  for(i = 0; i < m32[8].length; i++){
    r[15] = 0x8000000 + i * 4;
    convert_ARM(i);
  }

  // THUMB
  for(i = 0; i < m16[8].length; i++){
    r[15] = 0x8000000 + i * 2;
    convert_THUMB(i);
  }

  // Restore PC
  r[15] = pc_backup;
}

// branch_comment()
// Assembler comment for branching functions
// @param l: label (branch target address)
// @return: an Unicode arrow
branch_comment = function(l){

  // Up
  if(l < r[15]){
    return " ;&uarr;"
  }

  // Down
  if(l > r[15]){
    return " ;&darr;"
  }

  // Or left
  return " ;&larr;"
}

// update_debug_interface()
// update ROM, RAM, CPU flags and registers
update_debug_interface = function(){
  // Var
  var instr;

  // Disable current highlight
  document.getElementsByClassName("debug_highlight")[0].className = "";

  if(thumb_mode){
    instr = top["debug_thumb_" + x(r[15])];
    instr.className = "debug_highlight";
  }
  else{
    instr = top["debug_arm_" + x(r[15])];
    instr.className = "debug_highlight";
  }
  instr.parentNode.scrollTop = instr.offsetTop - 100;

  // Update registers
  for(i = 0; i <= 16; i++){
    top["debug_r" + i].innerHTML = x(r[i], 8);
  }

  // Update cpsr
  debug_cpsr.innerHTML = x(cpsr[0], 8);

  // Update spsr
  debug_spsr.innerHTML = x(spsr[0], 8);

  // Update flags
  debug_flag_n.checked = !!b(cpsr[0], 31);
  debug_flag_z.checked = !!b(cpsr[0], 30);
  debug_flag_c.checked = !!b(cpsr[0], 29);
  debug_flag_v.checked = !!b(cpsr[0], 28);
  debug_flag_i.checked = !!b(cpsr[0], 7);
  debug_flag_f.checked = !!b(cpsr[0], 6);
  debug_flag_t.checked = !!b(cpsr[0], 5);
  debug_flag_q.checked = !!b(cpsr[0], 27);
}

// trace()
// For debug purpose only
// Decode and execute the next instruction, update the debug interface
trace = function(){

  // Vars
  var i, instr;

  // Instruction subaddress
  i = r[15] % 0x2000000;

  // THUMB
  if(thumb_mode){

    // Get the next instruction's index
    i /= 2;

    // Execute it
    thumb_opcode[i](thumb_params[i]);
  }

  // ARM
  else{

    // Get the next instruction's index
    i /= 4;

    // Execute it
    arm_opcode[i](arm_params[i], arm_cond[i]);
  }
  
  // Update debug interface and screen
  if(debug_mode){
    update_debug_interface();
    canvas[0].putImageData(imagedata[0], 0, 0);
  }

  // Next instruction subaddress
  i = r[15] - 0x8000000;

  // Convert it if needed
  if(thumb_mode){
    i /= 2;
    if(!thumb_opcode[i]){
      convert_THUMB(i);
    }
  }
  else{
    i /= 4;
    if(!arm_opcode[i]){
      convert_ARM(i);
    }
  }
}
}

/********** Binary tools **********/ {

// lshift()
// @params a, b
// @return a << b
lshift = function(number, shift){return number * Math.pow(2, shift)}

// rshift()
// @params a, b
// @return a >> b
rshift = function(number, shift){return Math.floor(number / Math.pow(2, shift))}

// b()
// @params number, start, end
// @return a number representing the bits of number read from start to end
// end param is optional. By default, one bit is read.
b = function(number, start, end){return rshift(number, start) & (Math.pow(2, (end || start) - start + 1) - 1)}

// ror()
// @params number, length, bits
// @return the number (which is "length" bits long) after a right rotation (make the "bits" first bits of the number, last) 
ror = function(number, length, bits){return lshift((number & Math.pow(2, bits) - 1), length - bits) + rshift(number, bits)}
}

/********** Screen **********/ {

// canvas, imagedata
// The GBA's screen has four layers, each of them is represented by a canvas
// The ImageData are used to edit each canvas as a bitmap
canvas = [];
imagedata = [];
for(i = 0; i < 4; i++){
  canvas.push(top["canvas" + i].getContext("2d"));
  imagedata.push(canvas[i].createImageData(240, 160));
}

// vram
// update an imagedata
// @param address: address offset
// @param value: color to set
// @param bytes: number of bytes to write
var vram = function(address, value, bytes){
  var pr, pg, pb, pr2, pg2, pb2;                          // temp color values

  pr = b(value, 0, 4) * 8;                          // get red value of pixel (bits 0-4)
  pg = b(value, 5, 9) * 8;                          // get green value of pixel (bits 5-9)
  pb = b(value, 10, 14) * 8;                        // get blue value of pixel (bits 10-14)

  if(bytes == 4){                                         // If 4 bytes are set, 2 pixels are drawn
    pr2 = b(value, 0, 4) * 8;                       // get red value of pixel 2 (bits 0-4)
    pg2 = b(value, 5, 9) * 8;                       // get green value of pixel 2 (bits 5-9)
    pb2 = b(value, 10, 14) * 8;                     // get blue value of pixel 2 (bits 10-14)
  }

  //switch(dispcnt_m){
  //  case 0x3:                                           // in mode 3
      imagedata[0].data[address * 2] = pr;                  // set the pixel's red value
      imagedata[0].data[address * 2 + 1] = pg;              // set the pixel's green value
      imagedata[0].data[address * 2 + 2] = pb;              // set the pixel's blue value
      imagedata[0].data[address * 2 + 3] = 255;             // set the pixel's alpha value (totally opaque)

      if(bytes == 4){                                     // if we draw 2 pixels
        imagedata[0].data[address * 2 + 4] = pr2;           // set the pixel 2's red value
        imagedata[0].data[address * 2 + 5] = pg2;           // set the pixel 2's green value
        imagedata[0].data[address * 2 + 6] = pb2;           // set the pixel 2's blue value
        imagedata[0].data[address * 2 + 7] = 255;           // set the pixel 2's alpha value (totally opaque)
  //    }
  //    break;
  }
}


}

/********** CPU **********/ {
// r
// The GBA's CPU registers (unsigned, 32 bits)
// r[0-12]: general purpose
// r[13]: stack pointer (SP). Initial value: 0x3007F00
// r[14]: link register (LR)
// r[15]: program counter (PC). Initial value: 0x8000000
// r[16]: used here to store the result of void operations
r = new Uint32Array(new ArrayBuffer(4 * 17));
r[13] = 0x3007F00;
r[15] = 0x8000000;

// cpsr
// Current program status register (32 bits)
cpsr = new Uint32Array(new ArrayBuffer(4));

// spsr
// Stored program status register (32 bits)
spsr = new Uint32Array(new ArrayBuffer(4));

// thumb
// THUMB mode, off by default
thumb_mode = 0;

/*
 * update_cpsr_n
 * set the CPSR flag n according to the value of a register
 * @param rd: register to test
 */
update_cpsr_n = function(rd){

  // If Rd is negative (bit 31 is set)
  if(b(r[rd], 31) === 1){

    // Set CPSR flag n (bit 31)
    cpsr[0] |= 0x80000000;
    //cpsr = ((cpsr * 8) | 0x80000000) / 8;

    // Update checkbox
    if(debug_mode){
      top["debug_flag_n"].checked = true;
    }
  }
  else{

    // Unset CPSR flag n
    cpsr[0] &= 0x7FFFFFFF;

    // Update checkbox
    if(debug_mode){
      top["debug_flag_n"].checked = false;
    }
  }
}

// update_cpsr_z
// set the CPSR flag z according to the value of a register
// @param rd: register to test
update_cpsr_z = function(rd){

  // If Rd is zero
  if(r[rd] === 0){

    // Set CPSR flag z (bit 30)
    cpsr[0] |= 0x40000000;

    // Update checkbox
    if(debug_mode){
      top["debug_flag_z"].checked = true;
    }
  }
  else{

    // Unset CPSR flag z
    cpsr[0] &= 0xBFFFFFFF;

    // Update checkbox
    if(debug_mode){
      top["debug_flag_z"].checked = false;
    }
  }
}

// update_cpsr_c
// set the CPSR flag c according to the value of a register
// @param rd: register to test
// @param val: value stored in the register
// @param sub (optional): to set if the instruction is a substraction (or a comparison)
update_cpsr_c = function(rd, val, sub){

  // If the value is different from the register
  if((sub && val > 0 && val != r[rd]) || (sub && !val && !r[rd]) || (!sub && val != r[rd])){

    // Set CPSR flag c (bit 29)
    cpsr[0] |= 0x20000000;

    // Update checkbox
    if(debug_mode){
      top["debug_flag_c"].checked = true;
    }
  }
  else{

    // Unset CPSR flag z
    cpsr[0] &= 0xDFFFFFFF;

    // Update checkbox
    if(debug_mode){
      top["debug_flag_c"].checked = false;
    }
  }
}

// update_cpsr_v
// set the CPSR flag v according to the value of a register
// @param rd: the register to test
update_cpsr_v = function(rd){

}
}

/********** Memory **********/ {
// m
// The GBA's memory
// m[2]: on-board WRAM. (256kb)
// m[3]: on-chip WRAM. (32kb)
// m[4]: I/O registers. (1kb)
// m[5]: palette RAM. (1kb)
// m[6]: VRAM. (96kb)
// m[7]: OBJ attributes. (1kb)
// m[8]: Game Pak ROM. (up to 32mb)
// m[0xE]: Game Pak SRAM. (64kb)
m = [,,new ArrayBuffer(256 * 1024), new ArrayBuffer(32 * 1024), new ArrayBuffer(1024), new ArrayBuffer(1024), new ArrayBuffer(96 * 1024), new ArrayBuffer(1024),,,,,,, new ArrayBuffer(64 * 1024)];

// mirrors
// the size of the mirrors for each section of the memory
mirrors = [,, 0x40000, 0x8000,, 0x400, 0x20000, 0x400, 0x2000000,,,,,, 0x1000000];

// m8, m16, m32, mviews
// 8-bit, 16-bit and 32-bit views of the memory
m8 = [];
m16 = [];
m32 = [];
mviews = [, m8, m16,, m32];

// mem()
// read or write data in the memory
// @param address: the address to read or write
// @parambytes: the length of the value to read or write, in bytes (1, 2 or 4)
// @param value (optional): the value to write
// @param mask (optional): thebit mask to apply to the written value
// @return: if a value is specified, it is written in memory
//          else, the the read value is returned
mem = function(address, bytes, value, mask){

  // Vars
  var i, prefix, write;

  // Detect write operations
  write = value !== undefined;

  // Get prefix (bits 24-27 of address)
  prefix = rshift(address, 24);

  // Remove prefix from address
  if(prefix < 8){
    address &= 0x00FFFFFF;
  }

  else if(prefix > 0xE){
    prefix = 0xE;
  }

  else{
    prefix = 8;
  }

  // Handle mirrors
  address %= mirrors[prefix];

  // Handle writes on I/O
  if(prefix === 4 && write){
    //io(address, value);
  }

  // Handle mirrors and writes on VRAM
  if(prefix === 6){
    if(address > 0x17FFF && address < 0x20000){
      address -= 8000;
    }
    if(write){
      vram(address, value, bytes);
    }
  }

  // Write a value
  if(write){
    mviews[bytes][prefix][address / bytes] = value;
  }

  // Read a value
  else {
    return mviews[bytes][prefix][address / bytes] || 0;
  }
}
}

/********** ROM **********/ {

// load()
// Load a ROM, save it in the memory and create different views
// @param p: the ROM's path/URL
// @param c (optional): the function to call when the ROM is loaded (usually, "play")
load = function(p, c){

  // Vars
  var i, xhr;

  // Load and read the ROM as an arraybuffer
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

    // Convert the first ARM instruction
    convert_ARM(0);

    // Temp
    /*convert_all();
    debug=false;
    for(i = 400000; i--;){
      trace();
    }
    debug=true;
    trace();*/

    // Callback
    if(c){
      c();
    }
  }
}
}

/********** Disassembler **********/ {

// arm_opcode, arm_params, arm_asm, arm_cond, thumb_opcode, thumb_params, thumb_asm
// The ROM is read as ARM (32-bit) and THUMB (16-bit) instructions
// These arrays contain each opcode's function, params and assembler code
// ARM opcodes are conditional, their conditions are stored in arm_cond
arm_opcode = [];
arm_params = [];
arm_asm = [];
arm_cond = [];

thumb_opcode = [];
thumb_params = [];
thumb_asm = [];

// condnames
// suffix for conditional instructions
condnames = ["EQ","NE","CS","CC","MI","PL","VS","VC","HI","LS","GE","LT","GT","LE","","NV"];

// convert_ARM()
// Convert a 32-bit instruction to ARM and Assembler code
// @param i: the instruction to convert (as an index of m32)
convert_ARM = function(i){

  // Vars
  var pc, instr, condname, opcode, rn, nn, rd, l, psr, mask, f, c, op2, name;

  // Value of PC during execution
  pc = r[15] + 8;

  // Default ASM value: unknown
  arm_asm[i] = "?";

  // Read the instruction
  instr = m32[8][i];

  // Read the instruction's condition
  arm_cond[i] = b(instr, 28, 31);
  condname = condnames[arm_cond[i]];

  // ARM3 opcodes
  if(b(instr, 8, 27) === 0x012FFF){

    // Read opcode
    opcode = b(instr, 4, 7);

    // BX Rn (if opcode = 1)
    if(opcode === 1){

      // Set instruction
      arm_opcode[i] = arm_bx;

      // Set param
      arm_params[i] = [b(instr, 0, 3)];

      // Set ASM code
      arm_asm[i] = "BX" + condname + " r" + arm_params[i][0];
    }

    // BLX Rn (if opcode = 3)
    else if(opcode === 3){
      // todo
    }

    // Set ASM comment
    arm_asm[i] += branch_comment(arm_params[i][0]);
  }

  // ARM4 opcodes
  // B label / BL label
  else if(b(instr, 25, 27) === 0x5){

    // Read opcode
    opcode =b(instr, 24);

    // Set param
    arm_params[i] = [pc + b(instr, 0, 23) * 4];

    // Set instruction
    arm_opcode[i] = (opcode ? arm_bl : arm_b);

    // Set ASM
    arm_asm[i] = (opcode ? "BL" : "B") + condname + " 0x" + x(arm_params[i][0]);

    // Set ASM comment
    arm_asm[i] += opcode ? " ;&rarr;" : branch_comment(arm_params[i][0]);
  }

  // ARM9 opcodes
  else if(b(instr, 26, 27) === 0x1){

    // Bit fields:
    // i: b(instr, 25),
    // p: b(instr, 24),
    // u: b(instr, 23),
    // b: b(instr, 22),
    l = b(instr, 20);
    rn = b(instr, 16, 19);
    rd = b(instr, 12, 15);
    // wt: b(instr, 21),
    // is: b(instr, 7, 11),
    // st: b(instr, 5, 6),
    // rm: b(instr, 0, 3),
    nn = b(instr, 0, 11);

    // Set params
   arm_params[i] = (rn === 15 ? [rd, mem(pc + nn, 4)] : [rd, rn, nn]);

    // LDR
    if(l){

      // Set instruction
      arm_opcode[i] = (rn === 15 ? arm_ldr_ri: arm_ldr_rrn);

      // Set ASM
      arm_asm[i] = "LDR";
    }

    // STR
    else{

      // Set instruction
      arm_opcode[i] = (rn === 15 ? arm_str_ri: arm_str_rrn);

      // Set ASM
      arm_asm[i] = "STR";
    }

    // Set ASM
    arm_asm[i] += condname + " r" + arm_params[i][0] + (rn === 15 ? ",=#0x" + x(arm_params[i][1]) : ",[r" + arm_params[i][1] + ",0x" + x(arm_params[i][2]) + "]");
  }

  // ARM7 opcodes (todo)
  else if(!b(instr, 25, 27) && !b(instr, 7) && b(instr, 12, 15) != 0xF){
    arm_opcode[i] = null;
    arm_params[i] = [];
    arm_asm[i] = "ARM7";
  }

  // ARM5/6 opcodes
  else{

    // Bit fields:
    opcode = b(instr, 21, 24);
    // opcode6: b(instr, 21),
    // i: b(instr, 25),
    // s: b(instr, 20),
    rn = b(instr, 16, 19);
    rd = b(instr, 12, 15);
    // is: b(instr, 8, 11) * 2,
    // nn: b(instr, 0, 7),
    // r: b(instr, 4),
    // rs: b(instr, 8, 11),
    // is: b(instr, 7, 11),
    // st: b(instr, 5, 6),
    // rm: b(instr, 0, 3),
    // psr: b(instr, 22),
    f = b(instr, 19);
    // s: b(instr, 18),
    // x: b(instr, 17),
    c = b(instr, 16);
    // imms: b(instr, 8, 11),
    // imm: b(instr, 0, 7)
    psr = b(instr, 22);

    // Reset mask
    mask = 0;

    // ARM6 opcodes
    if(!b(instr, 18) && opcode >= 8 && opcode <= 0xB){

      // Read opcode
      opcode = b(instr, 21);

      // MSR (if opcode = 1)
      if(opcode){

        // allow to write on flags (bits 24-31) (if f = 1)
        if(f){
          mask += 0xFF000000;
        }

        // allow to write on controls (bits 0-7) (if c = 1)
        if(c){
          mask += 0xFF;
        }

        // Set params
        arm_params[i] = [b(instr, 0, 3), mask];

        // Set instruction
        arm_opcode[i] = (psr ? arm_msr_spsr : arm_msr_cpsr);

        // Set ASM
        arm_asm[i] = "MSR" + condname + (psr ? " spsr_ " : " cpsr_") + (f ? "f" : "") + (c ? "c" : "") + ",r" + arm_params[i][0];
      }
    }

    // ARM5 opcodes
    else{

      // Reset Op2
      op2 = 0;

      // Compute Op2 (if I = 1)
      if(b(instr, 25)){
        is = b(instr, 8, 11) * 2;
        nn = b(instr, 0, 7);
        op2 = ror(nn, 32, is);
      }

      // Opcodes
      switch(b(instr, 21, 24)){
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
          if(rn === 15){

            // Set instruction
            arm_opcode[i] = arm_add_ri;

            // Set params
            arm_params[i] = [rd, pc + op2];

            // Set ASM
            arm_asm[i] = "ADD r" +arm_params[i][0] + ",=#0x" + x(arm_params[i][1]);
          }

          // ADD Rd, Rn, Op2 (if Rn != PC)
          else{

            // Set instruction
            arm_opcode[i] = arm_add_rrn;

            // Set params
            arm_params[i] = [rd, rn, op2];

            // Set ASM
            arm_asm[i] = "ADD r" + arm_params[i][0] + ",r" + arm_params[i][1] + ",0x" + x(arm_params[i][2]);
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

          // Set instruction
          arm_opcode[i] = arm_mov_ri;

          // Set params
          arm_params[i] = [rd, op2];

          // Set ASM
          arm_asm[i] = "MOV r" + arm_params[i][0] + ",#0x" + x(arm_params[i][1]);
          break;

        case 0xE:
          break;

        case 0xF:
          break;
      }
    }
  }

  // Update debug interface
  if(debug_mode){
    name = top["debug_arm_value_" + x(r[15])];
    if(name){
      name.innerHTML = x(m32[8][i], 8);
      top["debug_arm_name_" + x(r[15])].innerHTML = arm_asm[i];
    }
  }
}

// convert_THUMB
// Convert a 16-bit instruction to THUMB and Assembler code
// @param i: the instruction to convert (as an index of m16)
convert_THUMB = function(i){

  // Vars
  var pc, instr, opcode, a, t, u, v, w, z, rd, rs, rb, bits0_7, bits6_10, bits6_8, bits8_10, cond, label, name;

  // Value of PC during execution
  pc = r[15] + 4;

  // Default ASM value: unknown
  thumb_asm[i] = "?";

  // Read the instruction
  instr = m16[8][i];

  // Bit fields
  t = b(instr, 8, 15);
  u = b(instr, 10, 15);
  v = b(instr, 11, 15);
  w = b(instr, 12, 15);
  z = b(instr, 13, 15);
  rd = b(instr, 0, 2);
  rs = b(instr, 3, 5);
  rb = b(instr, 3, 5);
  bits0_7 = b(instr, 0, 7);
  bits6_10 =b(instr, 6, 10);
  bits6_8 =b(instr, 6, 8);
  bits8_10 =b(instr, 8, 10);

  // THUMB 1/2 instructions
  if(z === 0x0){
    opcode = b(instr, 11, 12);

    // THUMB 2 instructions
    if(opcode === 0x3){

      // Read opcode
      opcode = b(instr, 9, 10);

      // MOV Rd, Rs
      if(opcode === 2 && !bits6_8){

        // Set instruction
        thumb_opcode[i] = thumb2_mov_rr;

        // Set params
        thumb_params[i] = [rd, rs];

        // Set ASM
        thumb_asm[i] = "MOV r" + thumb_params[i][0] + ",r" + thumb_params[i][1];
      }

      // ADD Rd, Rs, Rn
      else if(opcode === 0x0){

        // Set instruction
        thumb_opcode[i] = thumb_add_rrr;

        // Set params
        thumb_params[i] = [rd, rs,bits6_8];

        // Set ASM
        thumb_asm[i] = "ADD r" + thumb_params[i][0] + ",r" + thumb_params[i][1] + ",r" + thumb_params[i][2];
      }

      // SUB Rd, Rs, Rn
      else if(opcode === 0x1){

        // Set instruction
        thumb_opcode[i] = thumb_sub_rrr;

        // Set params
        thumb_params[i] = [rd, rs, bits6_8];

        // Set ASM
        thumb_asm[i] = "SUB r" + thumb_params[i][0] + ",r" + thumb_params[i][1] + ",r" + thumb_params[i][2];
      }

      // ADD Rd, Rs, nn
      else if(opcode === 0x2){

        // Set instruction
        thumb_opcode[i] = thumb_add_rrn;

        // Set params
        thumb_params[i] = [rd, rs, bits6_8];

        // Set ASM
        thumb_asm[i] = "ADD r" + thumb_params[i][0] + ",r" + thumb_params[i][1] + ",#0x" + x(thumb_params[i][2]);
      }

      // SUB Rd, Rs, nn
      else if(opcode === 0x3){

        // Set instruction
        thumb_opcode[i] = thumb_sub_rrn;

        // Set params
        thumb_params[i] = [rd, rs, bits6_8];

        // Set ASM
        thumb_asm[i] = "SUB r" + thumb_params[i][0] + ",r" + thumb_params[i][1] + ",#0x" + x(thumb_params[i][2]);
      }
    }

    // THUMB 1 instructions
    else{

      thumb_params[i] = [rd, rs, bits6_10];

      // LSL Rd, Rs, Offset
      if(opcode === 0x0){

        // Set instruction
        thumb_opcode[i] = thumb_lsl_rrn;

        // Set ASM
        thumb_asm[i] = "LSL";
      }

      // LSR Rd, Rs, Offset
      else if(opcode === 0x1){
        if(bits6_10 === 0){
         bits6_10 = 32;
        }

        // Set instruction
        thumb_opcode[i] = thumb_lsr;

        // Set ASM
        thumb_asm[i] = "LSR";
      }

      // ASR Rd, Rs, Offset
      else if(opcode === 0x2){
        if(bits6_10 === 0){
         bits6_10 = 32;
        }

        // Set instruction
        thumb_opcode[i] = thumb_asr;

        // Set ASM
        thumb_asm[i] = "ASR";
      }

      // Set ASM params
      thumb_asm[i] += " r" + thumb_params[i][0] + ",r" + thumb_params[i][1] + ",#0x" + x(thumb_params[i][2]);
    }
  }

  // THUMB 3 instructions
  else if(z === 0x1){

    // Read opcode
    opcode =b(instr, 11, 12);

    // Set params
    thumb_params[i] = [bits8_10, bits0_7];

    // MOV Rd, nn
    if(opcode === 0){

      // Set instruction
      thumb_opcode[i] = thumb_mov_rn;

      // Set ASM
      thumb_asm[i] = "MOV";
    }

    // CMP Rd, nn
    else if(opcode === 1){

      // Set instruction
      thumb_opcode[i] = thumb_cmp_rn;

      // Set ASM
      thumb_asm[i] = "CMP";
    }

    // ADD Rd, nn
    else if(opcode === 2){

      // Set instruction
      thumb_opcode[i] = thumb_add_rn;

      // Set ASM
      thumb_asm[i] = "ADD";
    }

    // SUB Rd, nn
    else if(opcode === 3){

      // Set instruction
      thumb_opcode[i] = thumb_sub_rn;

      // Set ASM
      thumb_asm[i] = "SUB";
    }

    // Set ASM params
    thumb_asm[i] += " r" + thumb_params[i][0] + ",#0x" + x(thumb_params[i][1]);
  }

  // THUMB 4 instructions
  else if(u === 0x10){

    // Read opcode
    opcode =b(instr, 6, 9);

    // Set params
    thumb_params[i] = [rd, rs];

    // AND Rd, Rs
    if(opcode === 0x0){

      // Set instruction
      thumb_opcode[i] = thumb_and_rr;

      // Set ASM
      thumb_asm[i] = "AND";
    }

    // TST Rd, Rs
    if(opcode === 0x8){

      // Set instruction
      thumb_opcode[i] = thumb_tst_rr;

      // Set ASM
      thumb_asm[i] = "TST";
    }

    // NEG Rd, Rs
    if(opcode === 0x9){

      // Set instruction
      thumb_opcode[i] = thumb_neg_rr;

      // Set ASM
      thumb_asm[i] = "NEG";
    }

    // CMP Rd, Rs
    if(opcode === 0xA){

      // Set instruction
      thumb_opcode[i] = thumb_cmp_rr;

      // Set ASM
      thumb_asm[i] = "CMP";
    }

    // ORR Rd, Rs
    if(opcode === 0xC){

      // Set instruction
      thumb_opcode[i] = thumb_orr;

      // Set ASM
      thumb_asm[i] = "ORR";
    }

    // MUL Rd, Rs
    if(opcode === 0xD){

      // Set instruction
      thumb_opcode[i] = thumb_mul;

      // Set ASM
      thumb_asm[i] = "MUL";
    }

    // BIC Rd, Rs
    if(opcode === 0xE){

      // Set instruction
      thumb_opcode[i] = thumb_bic;

      // Set ASM
      thumb_asm[i] = "BIC";
    }

    // Set ASM params
    thumb_asm[i] += " r" + thumb_params[i][0] + ",r" + thumb_params[i][1];
  }

  // THUMB 5 instructions
  else if(u === 0x11){

    // Read opcode
    opcode =b(instr, 8, 9);

    // Read Rd
    rd = lshift(b(instr, 7), 3) + rd;

    // Read Rs
    rs = lshift(b(instr, 6), 3) + rs;

    // ADD Rd, Rs
    if(opcode === 0){

      // Set instruction
      thumb_opcode[i] = thumb_add_rr;

      // Set params
      thumb_params[i] = [rd, rs];

      // Set ASM
      thumb_asm[i] = "ADD r" + thumb_params[i][0] + ",r" + thumb_params[i][1];
    }

    else if(opcode === 2){

      // NOP
      if(rd === 8 && rs === 8){

        // Set instruction
        thumb_opcode[i] = thumb_nop;

        // Set params
        thumb_params[i] = [];

        // Set ASM
        thumb_asm[i] = "NOP";
      }

      // MOV Rd, Rs
      else{

        // Set instruction
        thumb_opcode[i] = thumb5_mov_rr;

        // Set params
        thumb_params[i] = [rd, rs];

        // Set ASM
        thumb_asm[i] = "MOV r" + thumb_params[i][0] + ",r" + thumb_params[i][1];
      }
    }

    else if(opcode === 3){

      // Set instruction
      thumb_opcode[i] = thumb_bx;

      // Set params
      thumb_params[i] = [rs];

      // Set ASM
      thumb_asm[i] = "BX r" + thumb_params[i][0];
    }
  }

  // THUMB 6 instruction
  // LDR Rd, nn
  else if(v === 0x9){

    // Set instruction
    thumb_opcode[i] = thumb_ldr_rn;

    // Set params
    thumb_params[i] = [bits8_10, mem((pc & 0xFFFFFFFC) + bits0_7 * 4, 4)];

    // Set ASM
    thumb_asm[i] = "LDR r" + thumb_params[i][0] + ",=#0x" + x(thumb_params[i][1]);
  }

  // THUMB 7/8 instructions
  else if(w === 0x5){

    // Read opcode
    opcode =b(instr, 10, 11);

    // Set params
    thumb_params[i] = [rd, rb, bits6_8];

    // THUMB 8
    if(b(instr, 9)){

      // STRH Rd, Rb, Ro
      if(opcode === 0){

        // Set instruction
        thumb_opcode[i] = thumb_strh_rrr;

        // Set ASM
        thumb_asm[i] = "STRH";
      }

      else if(opcode === 1){

      }

      else if(opcode === 2){

      }

      else if(opcode === 3){

      }
    }

    // THUMB 7
    else{

      // STR Rd, Rb, Ro
      if(opcode === 0){

        // Set instruction
        thumb_opcode[i] = thumb_str_rrr;

        // Set ASM
        thumb_asm[i] = "STR";
      }

      else if(opcode === 1){

      }

      else if(opcode === 2){

      }

      // LDRB Rd, Rb, Ro
      else if(opcode === 3){

        // Set instruction
        thumb_opcode[i] = thumb_ldrb_rrr;

        // Set ASM
        thumb_asm[i] = "LDRB";
      }
    }

    // Set ASM params
    thumb_asm[i] += " r" + thumb_params[i][0] + ",[r" + thumb_params[i][1] + ",r" + thumb_params[i][2] + "]";
  }

  // THUMB 9 instructions
  else if(z === 0x3){

    // Read opcode
    opcode = b(instr, 11, 12);

    // Set params
    thumb_params[i] = [rd, rb,bits6_10];

    // STR Rd, Rb, nn
    if(opcode === 0){

      // Set instruction
      thumb_opcode[i] = thumb_str_rrn;

      // Set ASM
      thumb_asm[i] = "STR";
    }

    // LDR Rd, Rb, nn
    else if(opcode === 1){

      // Set instruction
      thumb_opcode[i] = thumb_ldr_rrn;

      // Set ASM
      thumb_asm[i] = "LDR";
    }

    // STRB Rd, Rb, nn
    else if(opcode === 2){

      // Set instruction
      thumb_opcode[i] = thumb_strb_rrn;

      // Set ASM
      thumb_asm[i] = "STRB";
    }

    // LDRB Rd, Rb, nn
    else if(opcode === 3){

      // Set instruction
      thumb_opcode[i] = thumb_ldrb_rrn;

      // Set ASM
      thumb_asm[i] = "LDRB";
    }

    // Set param nn (nn * 4) for opcodes 1 and 2
    if(opcode > 1){
      thumb_params[i][2] *= 4;
    }

    // Set ASM params
    thumb_asm[i] += " r" + thumb_params[i][0] + ",[r" + thumb_params[i][1] + (thumb_params[i][2] ? ",#0x" + x(thumb_params[i][2]) : "") + "]";
  }

  // THUMB 10 instructions
  else if(w === 0x8){

    // Read opcode
    opcode = b(instr, 11);

    // Set params
    thumb_params[i] = [rd, rb, bits6_10];

    // STRH Rd, Rb, nn
    if(opcode === 0){

      // Set instruction
      thumb_opcode[i] = thumb_strh_rrn;

      // Set ASM
      thumb_asm[i] = "STRH";
    }

    // LDRH Rd, Rb, nn
    else if(opcode === 1){

      // Set instruction
      thumb_opcode[i] = thumb_ldrh_rrn;

      // Set ASM
      thumb_asm[i] = "LDRH";
    }

    // Set ASM params
    thumb_asm[i] += " r" + thumb_params[i][0] + ",[r" + thumb_params[i][1] + (thumb_params[i][2] ? ",#0x" + x(thumb_params[i][2]) : "") + "]";
  }

  // THUMB 11 instructions
  else if(w === 0x9){

    // Set params
    thumb_params[i] = [bits8_10, bits0_7 * 4];

    // LDR Rd, nn
    if(b(instr, 11)){

      // Set instruction
      thumb_opcode[i] = thumb_ldr_spn;

      // Set ASM
      thumb_asm[i] = "LDR";
    }

    // STR Rd, nn
    else{

      // Set instruction
      thumb_opcode[i] = thumb_str_spn;

      // Set ASM
      thumb_asm[i] = "STR";
    }

    // Set ASM params
    thumb_asm[i] += " r" + thumb_params[i][0] + ",[SP" + (thumb_params[i][1] ? ",#0x" + x(thumb_params[i][1]) : "") + "]";
  }

  // THUMB 12 instructions
  else if(w === 0xA){

  }

  // THUMB 13 instruction
  // ADD SP, nn
  else if(t === 0xB0){

    // Read nn
    nn = b(instr, 0, 6) * 4;

    // Read nn sign
    if(b(instr, 7) === 1){
      nn = -nn;
    }

    // Set instruction
    thumb_opcode[i] = thumb_add_spn;

    // Set params
    thumb_params[i] = [nn];

    // Set ASM
    thumb_asm[i] = "ADD SP," + (thumb_params[i][0] < 0 ? "-" : "") + "#0x" + x(Math.abs(thumb_params[i][0]));
  }

  // THUMB 17 BKPT instruction
  else if(t === 0xBE){

  }

  // THUMB 14 instructions
  else if(w === 0xB){

    // Read opcode
    opcode =b(instr, 11);

    // Set params
    thumb_params[i] = [bits0_7, b(instr, 8)];

    // POP Rlist
    if(opcode){

      // Set instruction
      thumb_opcode[i] = thumb_pop;

      // Set ASM
      thumb_asm[i] = "POP";
    }

    // PUSH Rlist
    else{

      // Set instruction
      thumb_opcode[i] = thumb_push;

      // Set ASM
      thumb_asm[i] = "PUSH";
    }

    // Set ASM params
    thumb_asm[i] += " {";
    for(a = 0; a < 8; a++){
      if(b(thumb_params[i][0], a)){
        thumb_asm[i] += "r" + a + ",";
      }
    }
    if(thumb_params[i][1]){
      thumb_asm[i] += (opcode ? "r13," : "r14,");
    }
    thumb_asm[i] = thumb_asm[i].slice(0, -1) + "}";
  }

  // THUMB 15 instructions
  else if(w === 0xC){

    // Read opcode
    opcode = b(instr, 11);

    // Set params
    thumb_params[i] = [bits8_10, bits0_7];

    // STMIA Rb, Rlist
    if(opcode === 0){

      // Set instruction
      thumb_opcode[i] = thumb_stmia;

      // Set ASM
      thumb_asm[i] = "STMIA";
    }

    // LDMIA Rd, Rlist
    else if(opcode === 1){

      // Set instruction
      thumb_opcode[i] = thumb_ldmia;

      // Set ASM
      thumb_asm[i] = "LDMIA";
    }

    // Set ASM params
    thumb_asm[i] += " r" + thumb_params[i][0] + "!,{";
    for(a = 0; a < 8; a++){
      if(b(thumb_params[i][1], a)){
        thumb_asm[i] += "r" + a + ",";
      }
    }
    thumb_asm[i] = thumb_asm[i].slice(0, -1) + "}";
  }

  // THUMB 17 SWI instruction
  else if(t === 0xDF){

  }

  // THUMB 16/18 instructions
  else if(w === 0xD || v === 0x1C){

    // Set ASM
    thumb_asm[i] = "B";

    // Compute label
    bits0_7 *= 2;
    if(bits0_7 > 254){
      bits0_7 -= 512;
    }

    // Set params
    thumb_params[i] = [pc + bits0_7];

    // THUMB 18: B label
    if(v === 0x1C){

      // Set instruction
     thumb_opcode[i] = thumb_b;
    }

    // THUMB 16: B{cond} label
    else{

      // Read condition
      cond = b(instr, 8, 11);

      // Set instruction
      thumb_opcode[i] = [thumb_beq, thumb_bne, thumb_bcs, thumb_bcc, thumb_bmi, thumb_bpl, thumb_bvs, thumb_bvc, thumb_bhi, thumb_bls, thumb_bge, thumb_blt, thumb_bgt, thumb_ble][cond];

      // Set ASM
      thumb_asm[i] += condnames[cond];
    }

    // Set ASM param
    thumb_asm[i] += " 0x" + x(thumb_params[i][0]);

    // Set ASM comment
    thumb_asm[i] += branch_comment(thumb_params[i][0]);
  }

  // THUMB 19 instruction
  else if(v === 0x1E){

    // Read instruction 2
    instr2 = mem(r[15] + 2, 2);

    // Read instruction 2's opcode
    opcode = b(instr2, 11, 15);

    // Compute label
    label = lshift(b(instr, 0, 10), 12) +  lshift(b(instr2, 0, 10), 1);
    if(label > 0x400000){
      label -= 0x800000;
    }

    // Set params
    thumb_params[i] = [pc + label, pc | 1];

    // BL label
    if(opcode === 0x1F){

      // Set instruction
      thumb_opcode[i] = thumb_bl;

      // Set ASM
      thumb_asm[i] = "BL 0x" + x(thumb_params[i][0]) + " ;&rarr;";
    }
  }

  // Update debug interface
  if(debug_mode){
    name = top["debug_thumb_value_" + x(r[15])];
    if(name){
      name.innerHTML = x(m16[8][i], 4);
      top["debug_thumb_name_" + x(r[15])].innerHTML = thumb_asm[i];
    }
  }
}

}

/********** ARM **********/ {

// ARM3
arm_bx = function(p){

  // PC = Rn
  r[15] = r[p[0]] - 1;

  // CPSR.t = 1
  cpsr[0] |= 0x20;

  // THUMB mode
  thumb_mode = true;
}

arm_blx = function(p){
  // trace += "BLX";
}

// ARM4
arm_b = function(p){

  // PC = label
  r[15] = p[0];
}

arm_bl = function(p){
  // trace += "BL";
}

// ARM5
arm_add_rrn = function(p){
  // trace += "ADD r" + p[0] + ",=0x" + (r[p[1]] + (p[1] === 15 ? 8 : 0) + p[2]).toString(16);
  // r[p[0]] = r[p[1]] + (p[1] === 15 ? 8 : 0) + p[2];// Rd = Rn + Op2
  // r[15] += 4;
}

arm_add_ri = function(p){

  // Rd = Rn + Op2
  r[p[0]] = p[1];

  // Next
  r[15] += 4;
}

arm_mov_ri = function(p){

  // Rd = Op2
  r[p[0]] = p[1];

  // Next
  r[15] += 4;
}

// ARM6
arm_msr_cpsr = function(p){

  // CPSR[field] = Op (with a bit mask)
  cpsr[0] = r[p[0]] & p[1];

  // Next
  r[15] += 4;
}

arm_msr_spsr = function(p){

}

// ARM7
arm7 = function(){}

// ARM9
arm_str_rrn = function(p){

  // [Rn +/- offset] = Rd
  mem(r[p[1]] + p[2], 4, r[p[0]]);

  // Next
  r[15] += 4;
}

arm_ldr_rrn = function(p){
  // r[p[0]] =
  // mem(r[p[1]] + ((p[1] == 15) ? 8 : 0) + p[2], 4);// Rd = [Rn +/- offset]
  // r[15] += 4;
}

arm_str_ri = function(p){
}

arm_ldr_ri = function(p){

  // Rd = Imm
  r[p[0]] = p[1];

  // Next
  r[15] += 4;
}

}

/********** THUMB **********/ {

// THUMB 1
thumb_lsl_rrn = function(p){

  // Rd = Rs << nn
  var val = r[p[0]] = lshift(r[p[1]], p[2]);

  // if not LSL #0, update flag C
  if(p[2]){
    update_cpsr_c(p[0], val);
  }

  // update flags N, Z
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_lsr = function(p){

  // Rd = Rs >> nn
  var val = r[p[0]] = rshift(r[p[1]], p[2]);

  // Update flags
  update_cpsr_c(p[0], val);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_asr = function(p){

  // Rd = Rs >> nn
  var val = r[p[0]] = r[p[1]] >> p[2];

  // Update flags
  update_cpsr_c(p[0], val);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

// THUMB 2

thumb_add_rrr = function(p){

  // Rd = Rs + Rn
  var val = r[p[0]] = r[p[1]] + r[p[2]];

  // update flags
  update_cpsr_c(p[0], val);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);
  update_cpsr_v(p[0]);

  // Next
  r[15] += 2;
}

thumb_sub_rrr = function(p){

  // Rd = Rs - Rn
  var val = r[p[0]] = r[p[1]] - r[p[2]];

  // Update flags
  update_cpsr_c(p[0], val, true);
  update_cpsr_v(p[0]);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_add_rrn = function(p){

  // Rd = Rs + nn
  var val = r[p[0]] = r[p[1]] + p[2];

  // Update flags
  update_cpsr_c(p[0], val);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);
  update_cpsr_v(p[0]);

  // Next
  r[15] += 2;
}

thumb_sub_rrn = function(p){

  // Rd = Rs - nn
  var val = r[p[0]] = r[p[1]] - p[2];
  // if(r[p[0]] < 0){                                    // write negarive numbers on 32bits signed
    // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
  // }
  // Update flags
  update_cpsr_c(r[p[0]], val, true);
  update_cpsr_v(p[0]);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb2_mov_rr = function(p){

  // Rd = Rs
  var val = r[p[0]] = r[p[1]];

  // Update flags
  update_cpsr_c(p[0], val);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);
  update_cpsr_v(p[0]);

  // Next
  r[15] += 2;
}

// THUMB 3

thumb_mov_rn = function(p){

  // Rd = nn
  r[p[0]] = p[1];

  // update N flag
  update_cpsr_n(p[0]);

  // update Z flag
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_cmp_rn = function(p){

  // void = Rd - nn
  var val = r[16] = r[p[0]] - p[1];

  // Update flags
  update_cpsr_c(r[16], val);
  update_cpsr_v(16);
  update_cpsr_n(16);
  update_cpsr_z(16);

  // Next
  r[15] += 2;
}

thumb_add_rn = function(p){

  // Rd = Rd + nn
  var val = r[p[0]] += p[1];

  // Update flags
  update_cpsr_c(p[0], val);
  update_cpsr_v(p[0]);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_sub_rn = function(p){

  // Rd = Rd - nn
  var val = r[p[0]] = r[p[0]] - p[1];

  // Update flags
  update_cpsr_c(r[p[0]], val, true);
  update_cpsr_v(p[0]);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

// THUMB 4

thumb_neg_rr = function(p){

  // Rd = - Rs
  var val = r[p[0]] = 0xFFFFFFFF - r[p[1]] + 1;

  // update flags
  update_cpsr_c(p[0], val);
  update_cpsr_v(p[0]);
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_cmp_rr = function(p){

  // void = Rd - Rs
  var val = r[16] = r[p[0]] - r[p[1]];

  // Update flags
  update_cpsr_c(16, val, true);
  update_cpsr_v(16);
  update_cpsr_n(16);
  update_cpsr_z(16);

  // Next
  r[15] += 2;
}

thumb_orr = function(p){

  // Rd = Rd OR Rs
  r[p[0]] |= r[p[1]];

  // Update flags
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_mul = function(p){

  // Rd = Rd * Rs
  r[p[0]] *= r[p[1]];

  // Update flags
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

thumb_bic = function(p){

  // Rd = Rd AND NOT Rs
  r[p[0]] = r[p[0]] & (0xFFFFFFFF - r[p[1]]);

  // Update flags
  update_cpsr_n(p[0]);
  update_cpsr_z(p[0]);

  // Next
  r[15] += 2;
}

// THUMB 5

thumb_add_rr = function(p){

  // Rd = Rd + Rs
  r[p[0]] += r[p[1]];

  // Next
  r[15] += 2;
}

thumb5_mov_rr = function(p){

  // Rd = Rs
  r[p[0]] = r[p[1]];

  // Next
  r[15] += 2;
}

thumb_nop = function(){

  // Next
  r[15] += 2;
}

thumb_bx = function(p){

  // PC = Rd
  r[15] = r[p[0]] - 1;
}

// THUMB 6

thumb_ldr_rn = function(p){

  // Rd = nn
  r[p[0]] = p[1];

  // Next
  r[15] += 2;
}

// THUMB 7

thumb_str_rrr = function(p){
  // trace += "STR rrr";
  //trace += "STR r" + p[0] + ",=#0x" + p[1].toString(16);
  //r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
  //r[15] += 2;
}

thumb_strb_rrr = function(p){

}

thumb_ldr_rrr = function(p){
  //trace += "LDR r" + p[0] + ",=#0x" + p[1].toString(16);
  //r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
  //r[15] += 2;
}

thumb_ldrb_rrr = function(){

}

// THUMB 8

thumb_strh_rrr = function(p){

  // HALFWORD[Rb+Ro] = Rd
  mem(r[p[1]] + r[p[2]], 2, r[p[0]]);

  // Next
  r[15] += 2;
}

// THUMB 9

thumb_str_rrn = function(p){

  // WORD[Rb+nn] = Rd
  mem(r[p[1]] + p[2], 4, r[p[0]]);

  // Next
  r[15] += 2;
}

thumb_ldr_rrn = function(p){

  // Rd = WORD[Rb+nn]
  r[p[0]] = mem(r[p[1]] + p[2], 4);

  // Next
  r[15] += 2;
}

thumb_strb_rrn = function(p){
}

thumb_ldrb_rrn = function(p){
}

// THUMB 10

thumb_strh_rrn = function(p){

  // HALFWORD[Rb+nn] = Rd
  mem(r[p[1]] + p[2], 2, r[p[0]]);

  // Next
  r[15] += 2;
}

thumb_ldrh_rrn = function(p){
}

// THUMB 11

thumb_str_spn = function(p){

  // WORD[SP+nn] = Rd
  mem(r[13] + p[1], 4, r[p[0]]);

  // Next
  r[15] += 2;
}

thumb_ldr_spn = function(p){

  // Rd = WORD[SP+nn]
  r[p[0]] = mem(r[13] + p[1], 4);

  // Next
  r[15] += 2;
}

// THUMB 12

// THUMB 13

thumb_add_spn = function(p){

  // SP = SP +/- nn
  r[13] += p[0];

  // Next
  r[15] += 2;
}

// THUMB 14

thumb_push = function(p){

  // If LR is set
  if(p[1]){

    // Decrement R13
    r[13] -= 4;

    // Push LR
    mem(r[13], 4, r[14]);
  }

  // For Ri in Rlist
  for(i = 7; i >= 0; i--){

    // If it's set
    if(b(p[0], i)){

      // decrement R13
      r[13] -= 4;

      // Push Ri
      mem(r[13], 4, r[i]);
    }
  }

  // Next
  r[15] += 2;
}

thumb_pop = function(p){

  // For Ri in Rlist
  for(i = 0; i < 8; i++){

    // If it's set
    if(b(p[0], i)){

      // Pop SP
      r[i] = mem(r[13], 4);

      // increment R13
      r[13] += 4;
    }
  }

  // If PC is set
  if(p[1]){

    // Pop PC
    mem(r[13], 4, r[14]);

    // increment R13
    r[13] += 4;
  }

  // Next
  r[15] += 2;
}

// THUMB 15

thumb_stmia = function(p){

  // For each register Ri in Rlist
  for(i = 0; i < 8; i++){

    // If it is set
    if(b(p[1], i)){

      // [Rb] = Ri
      mem(r[p[0]], 4, r[i]);
    }
  }

  // Increment Rb
  r[p[0]] += 4;

  // Next
  r[15] += 2;
}

thumb_ldmia = function(p){

  // For each register Ri in Rlist
  for(i = 0; i < 8; i++){

    // If it is set
    if(b(p[1], i)){

      // Ri = [Rb]
      r[i] = mem(r[p[0]], 4);

      // increment Rb
      r[p[0]] += 4;
    }
  }

  // Next
  r[15] += 2;
}

// THUMB 16

thumb_beq = function(p){

  // If CPSR flag Z is set
  if(b(cpsr[0], 30)){

    // PC = address
    r[15] = p[0];
  }
  else{

    // Next
    r[15] += 2;
  }
}

thumb_bne = function(p){

  // If CPSR flag Z isn't set
  if(!b(cpsr[0], 30)){

    // detect loops
    detect_loop(p[0]);

    // PC = address
    r[15] = p[0];
  }

  else {

    // End loop
    loop_end();

    // Next
    r[15] += 2;
  }
}

thumb_bcs = function(p){

  // If CPSR flag C is set
  if(b(cpsr[0], 29)){

    // detect loops
    if(p[0] < r[15] && p[0] > r[15] - 20){
      loops++;
    }

    // Branch
    r[15] = p[0];
  }
  else{

    // Stop loop
    if(loops > 0){
      loops = -1;
    }

    // Next
    r[15] += 2;
  }
}

thumb_bcc = function(p){}

thumb_bmi = function(p){}

thumb_bpl = function(p){}

thumb_bvs = function(p){}

thumb_bvc = function(p){}

thumb_bhi = function(p){}

thumb_bls = function(p){}

thumb_bge = function(p){}

thumb_blt = function(p){

  // if CPSR.N != CPSR.V:
  if(b(cpsr[0], 31) !== b(cpsr[0], 28)){

    // detect loops
    detect_loop(p[0]);

    // PC = address
    r[15] = p[0];
  }
  else{

    // End loop
    loop_end();

    // Next
    r[15] += 2;
  }
}

thumb_bgt = function(p){}

thumb_ble = function(p){

  // if CPSR.Z is set or CPSR.N != CPSR.V
  if(b(cpsr[0], 30) || (b(cpsr[0], 31) !== b(cpsr[0], 28))){

    // detect loops
    detect_loop(p[0]);

    // PC = address
    r[15] = p[0];
  }
  else {

    // End loop
    loop_end();

    // Next
    r[15] += 2;
  }
}

// THUMB 17

// THUMB 18

thumb_b = function(p){

  // PC = PC + 4 + offset
  r[15] = p[0];
}

// THUMB 19

thumb_bl = function(p){

  // LR = PC
  r[14] = (r[15] + 4) | 0x1;

  // PC = address
  r[15] = p[0];
}

}

/********** Play **********/ {

// play()
// Launch the ROM
play = function(){

  // Vars
  var i, pc_backup;

  // Loop
  while(pc_backup != r[15])
  {
    // Backup pc
    pc_backup = r[15];

    // Instruction subaddress
    i = r[15] % 0x2000000;

    // THUMB
    if(thumb_mode){

      // Get the next instruction's index
      i /= 2;

      // Convert it if needed
      if(!thumb_opcode[i]){
        convert_THUMB(i);
      }

      // Execute it
      thumb_opcode[i](thumb_params[i]);
    }

    // ARM
    else{

      // Get the next instruction's index
      i /= 4;

      // Convert it if needed
      if(!arm_opcode[i]){
        convert_ARM(i);
      }

      // Execute it
      arm_opcode[i](arm_params[i], arm_cond[i]);
    }
  }

  // Game over, update debug interface
  if(debug_mode){
    update_debug_interface();
  }

  // Update screen
  canvas[0].putImageData(imagedata[0], 0, 0);
}
}

/********** Loops optimization **********/ {

// loops: a loop counter.
// Values:
// -1: no loop detected
// 0: loop suspected
// >= 1: loop confirmed, number of loops made

loops = -1;

// detect_loop
// if an instruction branches to a near, lower address (between N-10 and N),
// a loop can be suspected. It is confirmed if the same branch is made twice.
// This information can be use for debug purpose, and to make optimizations.
// @param a: the address, that will be compared to PC.
detect_loop = function(a){

  // Count loops
  if(a < r[15] && a > r[15] - 20){
    loops ++;
  }

  // Debug
  if(debug_mode){
    debug_end_loop.disabled = false;
  }
}

// loop_end
// Call this function when a loop ends.
// If a loop is running and the looping branch isn't made, the loop counter is reset to -1.
loop_end = function(){

  // reset loop counter
  loops = -1;

  // Debug
  if(debug_mode){
    debug_end_loop.disabled = true;
  }
}

// end_current_loop
// For debug purpose only
// Executes the next instructions while until the end of the current loop.
end_current_loop = function(){

  // Vars
  var i, debug_backup;

  // Backup and disable debug mode
  debug_backup = debug_mode;
  debug_mode = false;

  // Loop
  while(loops > -1){
    trace();
  }

  // End loop
  loop_end();

  // Restore debug mode
  debug_mode = debug_backup;

  // Get next instruction subaddress
  i = r[15] % 0x2000000;

  // Convert it if needed
  if(thumb_mode){
    i /= 2;
    convert_THUMB(i);
  }
  else{
    i /= 4;
    convert_ARM(i);
  }

  // Debug
  if(debug_mode){
    update_debug_interface();
  }
}

}

