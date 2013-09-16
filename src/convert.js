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

