/******************************************\
*   _____   ____                  _        *
*  / ____| |  _ \     /\         (_)       *
* | |  __  | |_) |   /  \         _   ___  *
* | | |_ | |  _ <   / /\ \       | | / __| *
* | |__| | | |_) | / ____ \   _  | | \__ \ *
*  \_____| |____/ /_/    \_\ (_) | | |___/ *
*                               _/ |       *
*  == A HTML5 GBA EMULATOR ==  |__/        *
*      ( in 49596 bytes )                  *
\******************************************/

(function(){

  /** DOM **/
  
  /*
   * $
   * Shortcut to select an element
   * @param i: the element's id
   */
  $ = function(i){
    return document.getElementById(i);
  }
  
  /*
   * canvas, imagedata
   * The GBA's screen has four layers, each of them is represented by a canvas
   * There are four ImageData to edit each canvas as a bitmap
   */
  var canvas = [];
  var imagedata = [];
  for(var i = 0; i < 4; i++){
    canvas.push($("canvas" + i).getContext("2d"));
    imagedata.push(canvas[i].createImageData(240, 160));
  }
  
  /*
   * update_debug_interface
   * for debug purpose only
   * update ROM, RAM, CPU flags and registers
   */
  var update_debug_interface = function(){
  
    // Disable current highlight
    if(debug){
      document.getElementsByClassName("highlight")[0].className = "";
    }
  
    if(thumb){
      instr = $("thumb" + x(r[15]));
      instr.className = "highlight";
    }
    else{
      instr = $("arm" + x(r[15]));
      instr.className = "highlight";
    }
    instr.parentNode.scrollTop = instr.offsetTop - 100;
  
    // Update registers
    for(i = 0; i <= 16; i++){
      $("r" + i).innerHTML = x(r[i], 8);
    }
  
    // Update cpsr
    $("cpsr").innerHTML = x(cpsr, 8);
  
    // Update spsr
    $("spsr").innerHTML = x(spsr, 8);
  
    // Update flags
    $("flagn").checked = !!b(cpsr, 31);
    $("flagz").checked = !!b(cpsr, 30);
    $("flagc").checked = !!b(cpsr, 29);
    $("flagv").checked = !!b(cpsr, 28);
    $("flagi").checked = !!b(cpsr, 7);
    $("flagf").checked = !!b(cpsr, 6);
    $("flagt").checked = !!b(cpsr, 5);
    $("flagq").checked = !!b(cpsr, 27);
  }/** CPU **/
  
  /*
   * r
   * The GBA's CPU has 16 registers (unsigned, 32 bits)
   * r0-r12: general purpose
   * r13: stack pointer (SP). Initial value: 0x3007F00
   * r14: link register (LR)
   * r15: program counter (PC). Initial value: 0x8000000
   * r16: used here to store the result of void operations
   */
  var r = new Uint32Array(new ArrayBuffer(17 * 4));
  r[13] = 0x3007F00;
  r[15] = 0x8000000;
  
  /*
   * cpsr
   * Current program status register
   */
  var cpsr = 0;
  
  /*
   * spsr
   * Stored program status register
   */
  var spsr = 0;
  
  /*
   * thumb
   * THUMB mode, off by default
   */
  var thumb = 0;
  
  /*
   * update_r
   * for debug purpose only
   * update the value of a register
   * @param rd: the register
   */
  var update_r = function(rd){
    if(debug){
      $("r" + rd).innerHTML = x(r[rd], 8);
    }
  }
  
  /*
   * update_cpsr_n
   * set the CPSR flag n according to the value of a register
   * @param rd: register to test
   */
  var update_cpsr_n = function(rd){
  
    // If Rd is negative (bit 31 is set)
    if(b(r[rd], 31) === 1){
  
      // Set CPSR flag n (bit 31)
      cpsr |= 0x80000000;
  
      // Update checkbox
      if(debug){
        $("flagn").checked = true;
      }
    }
    else{
  
      // Unset CPSR flag n
      cpsr &= 0x7FFFFFFF;
  
      // Update checkbox
      if(debug){
        $("flagn").checked = false;
      }
    }
  }
  
  /*
   * update_cpsr_z
   * set the CPSR flag z according to the value of a register
   * @param rd: register to test
   */
  var update_cpsr_z = function(rd){
  
    // If Rd is zero
    if(r[rd] === 0){
  
      // Set CPSR flag z (bit 30)
      cpsr |= 0x40000000;
  
      // Update checkbox
      if(debug){
        $("flagz").checked = true;
      }
    }
    else{
  
      // Unset CPSR flag z
      cpsr &= 0xBFFFFFFF;
  
      // Update checkbox
      if(debug){
        $("flagz").checked = false;
      }
    }
  }
  
  /*
   * update_cpsr_c
   * set the CPSR flag c according to the value of a register
   * @param rd: register to test
   * @param val: value stored in the register
   */
  var update_cpsr_c = function(rd, val){
  
    // If the value is different from the register
    if(val != r[rd]){
  
      // Set CPSR flag c (bit 29)
      cpsr |= 0x20000000;
  
      // Update checkbox
      if(debug){
        $("flagc").checked = true;
      }
    }
    else{
  
      // Unset CPSR flag z
      cpsr &= 0xDFFFFFFF;
  
      // Update checkbox
      if(debug){
        $("flagc").checked = false;
      }
    }
  }
  
  /*
   * update_cpsr_v
   * set the CPSR flag v according to the value of a register
   * @param rd: the register to test
   */
  update_cpsr_v = function(rd){
  
  }
  
  /** Memory **/
  
  /*
   * m
   * The GBA's memory contains 8 useful parts
   * Each part is an ArrayBuffer representing an address range:
   * m2: on-board WRAM. (256kb)
   * m3: on-chip WRAM. (32kb)
   * m4: I/O registers. (1kb)
   * m5: palette RAM. (1kb)
   * m6: VRAM. (96kb)
   * m7: OBJ attributes. (1kb)
   * m8: Game Pak ROM. (32mb)
   * mE: Game Pak SRAM. (64kb)
   */
  var m = [
    ,
    ,
    new ArrayBuffer(256 * 1024),
    new ArrayBuffer(32 * 1024),
    new ArrayBuffer(1024),
    new ArrayBuffer(1024),
    new ArrayBuffer(96 * 1024),
    new ArrayBuffer(1024),
    ,
    ,
    ,
    ,
    ,
    ,
    new ArrayBuffer(64 * 1024)
  ];
  
  /*
   * m8, m16 and m32
   * 8-bit, 16-bit and 32-bit views of the memory
   */
  var m8 = [];
  var m16 = [];
  var m32 = [];
  
  /*
   * mem()
   * read or write data in the memory
   * @param address: the address to read or write
   * @parambytes: the length of the value to read or write, inbytes (1, 2 or 4)
   * @param value (optional): the value to write
   * @param mask (optional): thebit mask to apply to the written value
   * @return: if a value is specified, it is written in memory
   *          else, the the read value is returned
   */
  var mem = function(address, bytes, value, mask){
  
    // Vars
    var i, prefix, write, view;
  
    // Detect write operations
    write = value !== undefined;
  
    // Select the right view
    if(bytes === 1){
      view = m8;
    }
  
    else if(bytes === 2){
      view = m16;
    }
  
    else if(bytes === 4){
      view = m32;
    }
  
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
    address %= [,,0x40000,0x8000,,0x400,0x20000,0x400,0x2000000,,,,,,0x1000000][prefix];
  
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
        //vram(address, value,bytes);
      }
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
  
  /** ROM loader **/
  
  /*
   * load()
   * Load a ROM, save it in the memory and create different views
   * @param p: the ROM's path
   */
  load = function(p){
  
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
      convert_all();
      //for(i = 25; i--;){
        //trace();
      //}
    }
  }
  
  /** ROM conversion **/
  
  /*
   * arm_opcode,arm_params, arm_asm, arm_cond,thumb_opcode, thumb_params, thumb_asm
   * The ROM is interpreted as ARM (32-bit) and THUMB (16-bit) instructions
   * These arrays contain each opcode's function, params and assembler code
   * ARM opcodes are conditional, their conditions are stored in arm_cond
   */
  var arm_opcode = [];
  var arm_params = [];
  var arm_asm = [];
  var arm_cond = [];
  
  var thumb_opcode = [];
  var thumb_params = [];
  var thumb_asm = [];
  
  /*
   * condnames
   * suffix for conditional instructions
   */
  var condnames =
  [
    "EQ",
    "NE",
    "CS",
    "CC",
    "MI",
    "PL",
    "VS",
    "VC",
    "HI",
    "LS",
    "GE",
    "LT",
    "GT",
    "LE",
    "",
    "NV"
  ];
  
  /*
   * convert_all()
   * For debug purpose only, optional
   * Try to convert all the ROM in ARM and THUMB instructions
   * Invalid results when it's used on data or on the wrong instruction set
   */
  convert_all = function(){
  
    // Vars
    var i;
  
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
  
    // Reset PC
    r[15] = 0x8000000;
  }
  
  /*
   * convert_ARM()
   * Convert a 32-bit instruction to ARM and Assembler code
   * @param i: the instruction to convert (as an index of m32)
   */
  var convert_ARM = function(i){
  
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
    if(debug){
      name = $("armvalue" + x(r[15]));
      if(name){
        name.innerHTML = x(m32[8][i], 8);
        $("armname" + x(r[15])).innerHTML = arm_asm[i];
      }
    }
  }
  
  /*
   * convert_THUMB
   * Convert a 16-bit instruction to THUMB and Assembler code
   * @param i: the instruction to convert (as an index of m16)
   */
  var convert_THUMB = function(i){
  
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
          thumb_opcode[i] = thumb_add_rrr;
  
          // Set params
          thumb_params[i] = [rd, rs, bits6_8];
  
          // Set ASM
          thumb_asm[i] = "ADD r" + thumb_params[i][0] + ",r" + thumb_params[i][1] + ",#0x" + x(thumb_params[i][2]);
        }
  
        // SUB Rd, Rs, nn
        else if(opcode === 0x3){
  
          // Set instruction
          thumb_opcode[i] = thumb_sub_rrr;
  
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
      opcode =b(instr, 11, 12);
  
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
      opcode =b(instr, 11);
  
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
      thumb_asm[i] += " r" + thumb_params[i][0] + ",[SP,#0x" + x(thumb_params[i][1]) + "]";
    }
  
    // THUMB 12 instructions
    else if(w === 0xA){
  
    }
  
    // THUMB 13 instruction
    // ADD SP, nn
    else if(t === 0xB0){
  
      // Read nn
      nn =b(instr, 0, 6) * 4;
  
      // Read nn sign
      if(b(instr, 7) === 1){
        nn = -nn;
      }
  
      // Set instruction
      thumb_opcode[i] = thumb_add_spn;
  
      // Set params
      thumb_params[i] = [nn];
  
      // Set ASM
      thumb_asm[i] = "ADD SP,#0x" + x(thumb_params[i][0]);
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
      opcode =b(instr, 11);
  
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
        cond =b(instr, 8, 11);
  
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
    if(debug){
      name = $("thumbvalue" + x(r[15]));
      if(name){
        name.innerHTML = x(m16[8][i], 4);
        $("thumbname" + x(r[15])).innerHTML = thumb_asm[i];
      }
    }
  }
  
  /*
   *branch_comment()
   * Assembler comment forbranching functions
   * @param l: label
   */
  var branch_comment = function(l){
  
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
  
  /** Trace **/
  
  /*
   * trace()
   * For debug purpose only
   * Decode and execute the next instruction, update the debug interface
   */
  trace = function(){
  
    // Vars
    var i, instr;
  
    // Instruction subaddress
    i = r[15] % 0x2000000;
  
    // THUMB
    if(thumb){
  
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
  
    // Update debug interface
    if(debug){
      update_debug_interface();
    }
  
    // Next instruction subaddress
    i = r[15] - 0x8000000;
  
    // Convert it if needed
    if(thumb){
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
  
  /** Play **/
  
  /*
   * play()
   * Launch the ROM
   */
  play = function(){
  
  }
  
  /** THUMB opcodes */
  
  // THUMB 1
  var thumb_lsl_rrn = function(p){
  
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
  
  var thumb_lsr = function(p){
    // trace += "LSR r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
    // r[p[0]] = rshift(r[p[1]], p[2]);
    // update_cpsr_c(p[0]);                                // update C flag
    // update_cpsr_n(p[0]);                                // update N flag
    // update_cpsr_z(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  var thumb_asr = function(p){
    // trace += "ASR r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
    // r[p[0]] = r[p[1]] >> p[2];                      // Rd = Rs >> nn
    // update_cpsr_c(p[0]);                                // update C flag
    // if(r[p[0]] < 0){                                    // stay positive whenbit 31 is set
      // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
    // }
    // update_cpsr_n(p[0]);                                // update N flag
    // update_cpsr_z(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  // THUMB 2
  
  var thumb_add_rrr = function(p){
  
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
  
  var thumb_sub_rrr = function(p){
  
    // Rd = Rs - Rn
    var val = r[p[0]] = r[p[1]] - r[p[2]];
  
    // Update flags
    update_cpsr_c(r[p[0]], val);
    update_cpsr_v(p[0]);
    update_cpsr_n(p[0]);
    update_cpsr_z(p[0]);
  
    // Next
    r[15] += 2;
  }
  
  var thumb_add_rrn = function(p){
    // trace += "ADD R" + p[0] + ",R" + p[1] + ",#0x" + p[2].toString(16);
    // r[p[0]] = r[p[1]] + p[2];                       // Rd = Rs + nn
    // update_cpsr_c(p[0]);                                // update C flag
    // update_cpsr_n(p[0]);                                // update V flag
    // update_cpsr_z(p[0]);                                // update N flag
    // update_cpsr_v(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  var thumb_sub_rrn = function(p){
    // trace += "SUB R" + p[0] + ",R" + p[1] + ",#0x" + p[2].toString(16);
    // r[p[0]] = r[p[1]] - p[2];                       // Rd = Rs - nn
    // if(r[p[0]] < 0){                                    // write negarive numbers on 32bits signed
      // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
    // }
    // update_cpsr_c_sub(r[p[1]], p[2]);               // update C flag (substraction)
    // update_cpsr_v(p[0]);                                // update V flag
    // update_cpsr_n(p[0]);                                // update N flag
    // update_cpsr_z(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  var thumb2_mov_rr = function(p){
    // trace += "MOV r" + p[0] + ",r" + p[1];
    // r[p[0]] = r[p[1]];                              // Rd = Rs
    // r[15] += 2;
    // update_cpsr_c(p[0]);
    // update_cpsr_n(p[0]);
    // update_cpsr_z(p[0]);
    // update_cpsr_v(p[0]);
  }
  
  // THUMB 3
  
  var thumb_mov_rn = function(p){
  
    // Rd = nn
    r[p[0]] = p[1];
  
    // update N flag
    update_cpsr_n(p[0]);
  
    // update Z flag
    update_cpsr_z(p[0]);
  
    // Next
    r[15] += 2;
  }
  
  var thumb_cmp_rn = function(p){
    // trace += "CMP R" + p[0] + ",#0x" + p[1].toString(16);
    // r[16] = r[p[0]] - p[1];                         // void (R16) = Rd - nn
    // update_cpsr_c_sub(r[p[0]], p[1]);               // update C flag (substraction)
    // update_cpsr_v(16);                                  // update V flag
    // update_cpsr_n(16);                                  // update N flag
    // update_cpsr_z(16);                                  // update Z flag
    // r[15] += 2;
  }
  
  var thumb_add_rn = function(p){
    // trace += "ADD r" + p[0] + ",#0x" + p[1].toString(16);
    // r[p[0]] += p[1];
    // update_cpsr_c(p[0]);                                // update C flag
    // update_cpsr_v(p[0]);                                // update V flag
    // update_cpsr_n(p[0]);                                // update N flag
    // update_cpsr_z(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  var thumb_sub_rn = function(p){
  
    // Rd = Rd - nn
    var val = r[p[0]] -= p[1];
  
    // Update flags
    update_cpsr_c(r[p[0]], val);
    update_cpsr_v(p[0]);
    update_cpsr_n(p[0]);
    update_cpsr_z(p[0]);
  
    // Next
    r[15] += 2;
  }
  
  // THUMB 4
  
  var thumb_neg_rr = function(p){
    // trace += "NEG r" + p[0] + ",r" + p[1];
    // r[p[0]] = 0xFFFFFFFF - r[p[1]] + 1;             // Rd = - Rs
    // update_cpsr_c(p[0]);                                // update C flag
    // update_cpsr_v(p[0]);                                // update V flag
    // update_cpsr_n(p[0]);                                // update N flag
    // update_cpsr_z(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  var thumb_cmp_rr = function(p){
    // trace += "CMP r" + p[0] + ",r" + p[1];
    // r[16] = r[p[0]] - r[p[1]];                  // void = Rd - Rs
    // update_cpsr_c_sub(r[p[0]], r[p[1]]);        // update C flag (substraction)
    // update_cpsr_v(16);                                  // update V flag
    // update_cpsr_n(16);                                  // update N flag
    // update_cpsr_z(16);                                  // update Z flag
    // r[15] += 2;
  }
  
  var thumb_orr = function(p){
    // trace += "ORR r" + p[0] + ",r" + p[1];
    // r[p[0]] |= r[p[1]];                             // Rd = Rd OR Rs
    // update_cpsr_n(p[0]);                                // update N flag
    // update_cpsr_z(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  var thumb_mul = function(p){
    // trace += "MUL r" + p[0] + ",r" + p[1];
    // r[p[0]] *= r[p[1]];                             // Rd = Rd OR Rs
    // update_cpsr_n(p[0]);                                // update N flag
    // update_cpsr_z(p[0]);                                // update Z flag
    // r[15] += 2;
  }
  
  var thumb_bic = function(p){
  
    // Rd = Rd AND NOT Rs
    r[p[0]] = r[p[0]] & (0xFFFFFFFF - r[p[1]]);
  
    // Update flags
    update_cpsr_n(p[0]);
    update_cpsr_z(p[0]);
  
    // Next
    r[15] += 2;
  }
  
  // THUMB 5
  
  var thumb_add_rr = function(p){
    // trace += "ADD r" + p[0] + ",r" + p[1];
    // r[p[0]] += r[p[1]];                             // Rd = Rd + Rs
    // r[15] += 2;
  }
  
  var thumb5_mov_rr = function(p){
    // trace += "MOV r" + p[0] + ",r" + p[1];
    // r[p[0]] = r[p[1]];                              // Rd = Rs
    // r[15] += 2;
  }
  
  var thumb_nop = function(){
    // trace += "NOP";
    // r[15] += 2;
  }
  
  var thumb_bx = function(p){
  
    // PC = Rd
    r[15] = r[p[0]] - 1;
  }
  
  // THUMB 6
  
  var thumb_ldr_rn = function(p){
  
    // Rd = nn
    r[p[0]] = p[1];
  
    // Next
    r[15] += 2;
  }
  
  // THUMB 7
  
  var thumb_str_rrr = function(p){
    // trace += "STR rrr";
    //trace += "STR r" + p[0] + ",=#0x" + p[1].toString(16);
    //r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
    //r[15] += 2;
  }
  
  var thumb_strb_rrr = function(p){
  
  }
  
  var thumb_ldr_rrr = function(p){
    //trace += "LDR r" + p[0] + ",=#0x" + p[1].toString(16);
    //r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
    //r[15] += 2;
  }
  
  var thumb_ldrb_rrr = function(){
  
  }
  
  // THUMB 8
  
  var thumb_strh_rrr = function(p){
    // trace += "STRH R" + p[0] + ",[R" + p[1] + ",R" + p[2] + "]";
    // mem(r[p[1]] + r[p[2]], 2, r[p[0]]);     // HALFWORD[Rb+Ro] = Rd
    // r[15] += 2;
  }
  
  // THUMB 9
  
  var thumb_str_rrn = function(p){
    // trace += "STR R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2]) : "") + "]";
    // mem(r[p[1]] + p[2], 4, r[p[0]]);
    // r[15] += 2;
  }
  
  var thumb_ldr_rrn = function(p){
    // trace += "LDR R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2]) : "") + "]";
    // r[p[0]] = mem(r[p[1]] + p[2], 4);
    // r[15] += 2;
  }
  
  var thumb_strb_rrn = function(p){
  }
  
  var thumb_ldrb_rrn = function(p){
  }
  
  // THUMB 10
  
  var thumb_strh_rrn = function(p){
    // trace += "STRH R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2].toString(16)) : "") + "]";
    // mem(r[p[1]] + p[2], 2, r[p[0]]);            // HALFWORD[Rb+nn] = Rd
    // r[15] += 2;
  }
  
  var thumb_ldrh_rrn = function(p){
  }
  
  // THUMB 11
  
  var thumb_str_spn = function(p){
    // trace += "STR R" + p[0] + ",[SP" + (p[1] ? (",#0x" + p[1].toString(16)) : "") + "]";
    // mem(r[13] + p[1], 4, r[p[0]]);              // WORD[SP+nn] = Rd
    // r[15] += 2;
  }
  
  var thumb_ldr_spn = function(p){
    // trace += "LDR R" + p[0] + ",[SP" + (p[1] ? (",#0x" + p[1].toString(16)) : "") + "]";
    // r[p[0]] = mem(r[13] + p[1], 4);             // Rd = WORD[SP+nn]
    // r[15] += 2;
  }
  
  // THUMB 12
  
  // THUMB 13
  
  var thumb_add_spn = function(p){
    // trace += "ADD SP,#" + p[0].toString(16);
    // r[13] += p[0];                                      // SP = SP +/- nn
    // r[15] += 2;
  }
  
  // THUMB 14
  
  var thumb_push = function(p){ // optimizable
    // trace += "PUSH {";
    // if(p[1] === 1){                                         // if LR == 1
      // r[13] -= 4;                                       // decrement R13
      // mem(r[13], 4, r[14]);                     // push LR (R14)
      // trace += "R14,";
    // }
    // for(var i = 7; i >= 0; i--){                            // for each register "i" (descending order)
      // if(b(p[0], i)){                                 // if Rlist.i (bit i of Rlist) == 1
        // r[13] -= 4;                                     // decrement R13
        // mem(r[13], 4, r[i]);                    // store Ri at address R13 (SP)
        // trace += "R" + i + ",";
      // }
    // }
    // trace = trace.substr(0, trace.length-1) + "}";
    // r[15] += 2;
  }
  
  var thumb_pop = function(p){ // optimizable
    // trace += "POP {";
    // for(var i = 0; i < 8; i++){                             // for each register "i" (ascending order)
      // if(b(p[0], i)){                                 // if Rlist.i (bit i of Rlist) == 1
        // r[i] = mem(r[13], 4);                       // load Ri from address R13 (SP)
        // r[13] += 4;                                     // increment R13
        // trace += "R" + i + ",";
      // }
    // }
    // if(p[1] === 1){                                         // if PC == 1
      // mem(r[13], 4, r[14]);                     // pop PC (R15)
      // r[13] += 4;                                       // increment R13
      // trace += "R15,";
    // }
    // trace = trace.substr(0, trace.length-1) + "}";
    // r[15] += 2;
  }
  
  // THUMB 15
  
  var thumb_stmia = function(p){
  
    // For each register Ri in Rlist
    for(var i = 0; i < 8; i++){
  
      // If it is set
      if(b(p[1], i)){
  
        // [Rb] = Ri
        mem(r[p[0]], 4, r[i]);
      }
    }
  
    // Next
    r[15] += 2;
  }
  
  var thumb_ldmia = function(p){
  
    // For each register Ri in Rlist
    for(var i = 0; i < 8; i++){
  
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
  
  var thumb_beq = function(p){
  
    // If CPSR flag Z is set
    if(b(cpsr, 30)){
  
      // PC = address
      r[15] = p[0];
    }
    else{
  
      // Next
      r[15] += 2;
    }
  }
  
  var thumb_bne = function(p){
  
    // If CPSR flag Z isn't set
    if(!b(cpsr, 30)){
  
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
  
  var thumb_bcs = function(p){
  
    // If CPSR flag C is set
    if(b(cpsr, 29)){
  
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
  
  var thumb_bcc = function(p){}
  
  var thumb_bmi = function(p){}
  
  var thumb_bpl = function(p){}
  
  var thumb_bvs = function(p){}
  
  var thumb_bvc = function(p){}
  
  var thumb_bhi = function(p){}
  
  var thumb_bls = function(p){}
  
  var thumb_bge = function(p){}
  
  var thumb_blt = function(p){
    // trace += "BLT #0x" + p[0].toString(16);
    // if(b(cpsr, 31) !==b(cpsr, 28))                     // if CPSR.N != CPSR.V:
    // {
      // if(p[0] < r[15] && p[0] > r[15] - 20){                // detect loops
        // loops++;
      // }
      // r[15] = p[0];                                         // PC = address
    // }
    // else{
      // trace += ";false";
      // if(loops > 0){
        // loops = -1;
      // }
      // r[15] += 2;
    // }
  }
  
  var thumb_bgt = function(p){}
  
  var thumb_ble = function(p){
    // trace += "BLE #0x" + p[0].toString(16);
    // if(
      // (cpsr & 0x40000000) === 0x40000000                    // if CPSR.Z == 1
      // ||
      // (b(cpsr, 31) !==b(cpsr, 28))                     // or CPSR.N != CPSR.V:
    // ){
      // if(p[0] < r[15] && p[0] > r[15] - 20){                // detect loops
        // loops++;
      // }
      // r[15] = p[0];                                         // PC = address
    // }
    // else{
      // trace += ";false";
      // if(loops > 0){
        // loops = -1;
      // }
      // r[15] += 2;
    // }
  }
  
  // THUMB 17
  
  // THUMB 18
  
  var thumb_b = function(p){
    // trace += "B #0x" + p[0].toString(16);
    // if(p[0] == r[15]){
      // stopped = true;
    // }
    // r[15] = p[0];                                           // PC = PC + 4 + offset
  }
  
  // THUMB 19
  
  var thumb_bl = function(p){
  
    // LR = PC
    r[14] = (r[15] + 4) | 0x1;
  
    // PC = address
    r[15] = p[0];
  }
  
  /** ARM opcodes **/
  
  // ARM3
  var arm_bx = function(p){
  
    // PC = Rn
    r[15] = r[p[0]] - 1;
  
    // CPSR.t = 1
    cpsr |= 0x20;
  
    // THUMB mode
    thumb = 1;
  }
  
  var arm_blx = function(p){
    // trace += "BLX";
  }
  
  // ARM4
  var arm_b = function(p){
  
    // PC = label
    r[15] = p[0];
  }
  
  var arm_bl = function(p){
    // trace += "BL";
  }
  
  // ARM5
  var arm_add_rrn = function(p){
    // trace += "ADD r" + p[0] + ",=0x" + (r[p[1]] + (p[1] === 15 ? 8 : 0) + p[2]).toString(16);
    // r[p[0]] = r[p[1]] + (p[1] === 15 ? 8 : 0) + p[2];// Rd = Rn + Op2
    // r[15] += 4;
  }
  
  var arm_add_ri = function(p){
  
    // Rd = Rn + Op2
    r[p[0]] = p[1];
  
    // Next
    r[15] += 4;
  }
  
  var arm_mov_ri = function(p){
  
    // Rd = Op2
    r[p[0]] = p[1];
  
    // Next
    r[15] += 4;
  }
  
  // ARM6
  var arm_msr_cpsr = function(p){
  
    // CPSR[field] = Op (with a bit mask)
    cpsr = r[p[0]] & p[1];
  
    // Next
    r[15] += 4;
  }
  
  var arm_msr_spsr = function(p){
  
  }
  
  // ARM7
  var arm7 = function(){}
  
  // ARM9
  var arm_str_rrn = function(p){
  
    // [Rn +/- offset] = Rd
    mem(r[p[1]] + p[2], 4, r[p[0]]);
  
    // Next
    r[15] += 4;
  }
  
  var arm_ldr_rrn = function(p){
    // r[p[0]] =
    // mem(r[p[1]] + ((p[1] == 15) ? 8 : 0) + p[2], 4);// Rd = [Rn +/- offset]
    // r[15] += 4;
  }
  
  var arm_str_ri = function(p){
  }
  
  var arm_ldr_ri = function(p){
  
    // Rd = Imm
    r[p[0]] = p[1];
  
    // Next
    r[15] += 4;
  }
  
  /**binary **/
  
  /*
   * lshift()
   * left shift
   * lshift(a,b) returns the correct value of a << b
   */
  var lshift = function(number, shift){
    return number * Math.pow(2, shift);
  }
  
  /*
   * rshift()
   * right shift
   * rshift(a,b) returns the correct value of a >> b
   */
  var rshift = function(number, shift){
    return Math.floor(number / Math.pow(2, shift));
  }
  
  /*
   * b()
   * Extracts somebits in thebinary representation of a number
   */
  var b = function(number, start, end){
    return rshift(number, start) & (Math.pow(2, (end || start) - start + 1) - 1);
  }
  
  /*
   * ror()
   * perform a right rotation in thebinary representation of a number
   */
  var ror = function(number, length, bits){
    return lshift((number & Math.pow(2,bits) - 1), length -bits) + rshift(number, bits);
  }
  
  /*
   * x()
   * Write a number in hexadecimal
   * @param n: the number
   * @param i (optional): the length of the hexadecimal value, with leading zeros
   */
  x = function(n, i){
      return ((i ? "0000000" : "") + n.toString(16).toUpperCase()).slice(-i);
  }
  
  /** Loops **/
  
  /*
   * loops
   * A loop counter.
   * Values:
   * -1: no loop
   * 0: loop suspected
   * 1+: looping, number of loops made
   */
  var loops = -1;
  
  /*
   * detect_loop
   * if an instruction branches to a near, lower address (between N-20 and N),
   * a loop can be suspected. It is confirmed if the same branch is made twice.
   * This information can be use for debug purpose, and to make optimizations.
   * @param a: the address, that will be compared to PC.
   */
  var detect_loop = function(a){
  
    // Count loops
    if(a < r[15] && a > r[15] - 20){
      loops ++;
    }
  
    // Debug
    if(debug){
      $("endloop").disabled = false;
    }
  }
  
  /*
   * loop_end
   * This function is called when a loop ends.
   * If a loop is running and the looping branch isn't made, the loop counter is reset.
   */
  var loop_end = function(){
  
    // reset loop counter
    loops = -1;
  
    // Debug
    if(debug){
      $("endloop").disabled = true;
    }
  }
  
  /*
   * end_current_loop
   * For debug purpose only
   * Executes the next instructions while a loop is running.
   */
  end_current_loop = function(){
    var debug_backup = debug;
    debug = false;
    while(loops > -1){
      trace();
    }
    debug = debug_backup;
    loop_end();
    if(debug){
      update_debug_interface();
    }
  }
  
  
})()