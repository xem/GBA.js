/** ROM conversion **/

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
    r[15] = 0x8000000 + i * 4;
    convert_ARM(i);
  }
  
  // THUMB
  for(i = 0; i < m16[8].length; i++){
    r[15] = 0x8000000 + i * 4;
    convert_THUMB(i);
  }
  
  // Reset PC
  r[15] = 0x8000000;
}

/*
 * convert_ARM()
 * Convert a 32-bit instruction to ARM and Assembler code.
 * @param i: the instruction to convert (as an index of m32).
 */
function convert_ARM(i){

  // Vars
  var pc, instr, cond, condname, opcode, rn, nn, rd, l, psr, mask, f, c, op2, name;
  
  // Value of PC during execution.
  pc = r[15] + 8;

  // Default ASM value: unknown.
  arm_asm[i] = "?";

  // Read the instruction.
  instr = m32[8][i];

  // Read the instruction's condition.
  cond = arm_cond[i] = bit(instr, 28, 31);
  condname = condnames[cond];

  // ARM3 opcodes
  if(bit(instr, 8, 27) === 0x012FFF){

    // Read opcode
    opcode = bit(instr, 4, 7);
    
    // BX Rn (if opcode = 1)
    if(opcode === 1){
      arm_opcode[i] = arm_bx;
      arm_params[i] = [bit(instr, 0, 3)];
      arm_asm[i] = "BX" + condname + " r" + arm_params[i][0];
    }
    
    // BLX Rn (if opcode = 3)
    else if(opcode === 3){
      // todo
    }
  }

  // ARM4 opcodes (B, BL)
  else if(bit(instr, 25, 27) === 0x5){
  
    opcode = bit(instr, 24);
    arm_params[i] = [pc + bit(instr, 0, 23) * 4];
    arm_opcode[i] = (opcode ? arm_bl : arm_b);
    arm_asm[i] = (opcode ? "BL" : "B");
    arm_asm[i] += condname + " 0x" + hex(arm_params[i][0]);

    // Assembler comment
    if(arm_params[i][0] < r[15]){
      arm_asm[i] += " ;&uarr;"
    }
    else if(arm_params[i][0] > r[15]){
      arm_asm[i] += " ;&darr;"
    }
    else if(arm_params[i][0] === r[15]){
      arm_asm[i] += " ;&larr;"
    }
  }

  // ARM9 opcodes
  else if(bit(instr, 26, 27) === 0x1){

    // Bit fields:
    // i: bit(instr, 25),
    // p: bit(instr, 24),
    // u: bit(instr, 23),
    // b: bit(instr, 22),
    l = bit(instr, 20);
    rn = bit(instr, 16, 19);
    rd = bit(instr, 12, 15);
    // wt: bit(instr, 21),
    // is: bit(instr, 7, 11),
    // st: bit(instr, 5, 6),
    // rm: bit(instr, 0, 3),
    nn = bit(instr, 0, 11);

    // Params
    arm_params[i] = (rn === 15 ? [rd, mem(pc + nn, 4)] : [rd, rn, nn]);

    // LDR
    if(l){
      arm_opcode[i] = (rn === 15 ? arm_ldr_ri: arm_ldr_rrn);
      arm_asm[i] = "LDR";
    }

    // STR
    else{
      arm_opcode[i] = (rn === 15 ? arm_str_ri: arm_str_rrn);
      arm_asm[i] = "STR";
    }

    // Assembler
    arm_asm[i] += condname + " r" + arm_params[i][0] + (rn === 15 ? ",=#0x" + hex(arm_params[i][1]) : ",[r" + arm_params[i][1] + ",0x" + hex(arm_params[i][2]) + "]");
  }
  
  // ARM7 opcodes
  else if(!bit(instr, 25, 27) && !bit(instr, 7) && bit(instr, 12, 15) != 0xF){
    arm_opcode[i] = null;
    arm_params[i] = [];
    arm_asm[i] = "ARM7";
  }

  // ARM5/6 opcodes
  else{

    // Bit fields:
    opcode = bit(instr, 21, 24);
    // opcode6: bit(instr, 21),
    // i: bit(instr, 25),
    // s: bit(instr, 20),
    rn = bit(instr, 16, 19);
    rd = bit(instr, 12, 15);
    // is: bit(instr, 8, 11) * 2,
    // nn: bit(instr, 0, 7),
    // r: bit(instr, 4),
    // rs: bit(instr, 8, 11),
    // is: bit(instr, 7, 11),
    // st: bit(instr, 5, 6),
    // rm: bit(instr, 0, 3),
    // psr: bit(instr, 22),
    f = bit(instr, 19);
    // s: bit(instr, 18),
    // x: bit(instr, 17),
    c = bit(instr, 16);
    // imms: bit(instr, 8, 11),
    // imm: bit(instr, 0, 7).
    psr = bit(instr, 22);
    
    // Reset mask
    mask = 0;

    // ARM6 opcodes
    if(!bit(instr, 18) && opcode >= 8 && opcode <= 0xB){

      // Read opcode
      opcode = bit(instr, 21);
      
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

        // MSR
        arm_params[i] = [bit(instr, 0, 3), mask];
        arm_opcode[i] = (psr ? arm_msr_spsr : arm_msr_cpsr);
        arm_asm[i] = "MSR" + condname + (psr ? " spsr_ " : " cpsr_") + (f ? "f" : "") + (c ? "c" : "") + ",r" + arm_params[i][0];
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
          if(rn === 15){
            arm_opcode[i] = arm_add_ri;
            arm_params[i] = [rd, pc + op2];
            arm_asm[i] = "ADD r" + arm_params[i][0] + ",=#0x" + hex(arm_params[i][1]);
          }

          // ADD Rd, Rn, Op2 (if Rn != PC)
          else{
            arm_opcode[i] = arm_add_rrn;
            arm_params[i] = [rd, rn, op2];
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
          arm_opcode[i] = arm_mov_ri;
          arm_params[i] = [rd, op2];
          arm_asm[i] = "MOV r" + arm_params[i][0] + ",#0x" + hex(arm_params[i][1]);
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
    name = document.getElementById("armvalue" + hex(r[15]));
    if(name){
      name.innerHTML = hex(m32[8][i], 8);
      document.getElementById("armname" + hex(r[15])).innerHTML = arm_asm[i];
    }
  }
}

/*
 * convert_THUMB
 * Convert a 16-bit instruction to THUMB and Assembler code.
 * @param i: the instruction to convert (as an index of m16).
 */
function convert_THUMB(i){

  // Vars
  var pc, instr, name;
  
  // Value of PC during execution.
  pc = r[15] + 8;

  // Default ASM value: unknown.
  thumb_asm[i] = "?";

  // Read the instruction.
  instr = m16[8][i];

  // Bit fields
  t = bit(instr, 8, 15);
  u = bit(instr, 10, 15);
  v = bit(instr, 11, 15);
  w = bit(instr, 12, 15);
  z = bit(instr, 13, 15);
  rd = bit(instr, 0, 2);
  rs = bit(instr, 3, 5);
  rb = bit(instr, 3, 5);
  offset6_10 = bit(instr, 6, 10);
  offset6_8 = bit(instr, 6, 8);
  offset0_7 = bit(instr, 0, 7);
  name = "?";

  /*
  // THUMB 1/2 instructions
    if(z === 0x0){
      opcode = bit(instr, 11, 12);
      if(opcode === 0x3){                                 // THUMB 2:
        opcode = bit(instr, 9, 10);
        if(opcode === 2 && !offset6_8){
          name = "MOV";
          thumb[i] =
          [
            thumb2_mov_rr,                                // MOV
            [
              rd,                                         // Rd
              rs                                          // Rs
            ]
          ]
        }
        else if(opcode === 0x0){
          name = "ADD";
          thumb[i] =
          [
            thumb_add_rrr,                                // ADD
            [
              rd,                                         // Rd
              rs,                                         // Rs
              bit(instr, 6, 8)                            // Rn
            ]
          ]
        }
        else if(opcode === 0x1){
          name = "SUB";
          thumb[i] =
          [
            thumb_sub_rrr,                                // SUB
            [
              rd,                                         // Rd
              rs,                                         // Rs
              bit(instr, 6, 8)                            // Rn
            ]
          ]
        }
        else if(opcode === 0x2){
          name = "ADD";
          thumb[i] =
          [
            thumb_add_rrn,                                // ADD
            [
              rd,                                         // Rd
              rs,                                         // Rs
              bit(instr, 6, 8)                            // nn
            ]
          ]
        }
        else if(opcode === 0x3){
          name = "SUB";
          thumb[i] =
          [
            thumb_sub_rrn,                                // SUB
            [
              rd,                                         // Rd
              rs,                                         // Rs
              bit(instr, 6, 8)                            // nn
            ]
          ]
        }
      }
      else{                                               // THUMB 1
        if(opcode === 0x0){
          name = "LSL";
          thumb[i] =
          [
            thumb_lsl_rrn,                                // LSL
            [
              rd,                                         // Rd
              rs,                                         // Rs
              offset6_10                                  // Offset
            ]
          ]
        }
        else if(opcode === 0x1){
          if(offset6_10 === 0){
            offset6_10 = 32;
          }
          name = "LSR";
          thumb[i] =
          [
            thumb_lsr,                                    // LSR
            [
              rd,                                         // Rd
              rs,                                         // Rs
              offset6_10                                  // Offset
            ]
          ]
        }
        else if(opcode === 0x2){
          if(offset6_10 === 0){
            offset6_10 = 32;
          }
          name = "ASR";
          thumb[i] =
          [
            thumb_asr,                                    // ASR
            [
              rd,                                         // Rd
              rs,                                         // Rs
              offset6_10                                  // Offset
            ]
          ]
        }
      }
    }

    // THUMB 3 instructions
    else if(z === 0x1){
      opcode = bit(instr, 11, 12);
      if(opcode === 0){
        name = "MOV";
        thumb[i] =
        [
          thumb_mov_rn,                                   // MOV
          [
            bit(instr, 8, 10),                            // Rd
            offset0_7                                     // nn
          ]
        ]
      }
      else if(opcode === 1){
        name = "CMP";
        thumb[i] =
        [
          thumb_cmp_rn,                                   // CMP
          [
            bit(instr, 8, 10),                            // Rd
            offset0_7                                     // nn
          ]
        ]
      }
      else if(opcode === 2){
        name = "ADD";
        thumb[i] =
        [
          thumb_add_rn,                                   // ADD
          [
            bit(instr, 8, 10),                            // Rd
            offset0_7                                     // nn
          ]
        ]
      }
      else if(opcode === 3){
        name = "SUB";
        thumb[i] =
        [
          thumb_sub_rn,                                   // SUB
          [
            bit(instr, 8, 10),                            // Rd
            offset0_7                                     // nn
          ]
        ]
      }
    }

    // THUMB 4 instructions
    else if(u === 0x10){
      opcode = bit(instr, 6, 9);
      if(opcode === 0x0){
        name = "AND";
        thumb[j] =
        [
          thumb_and_rr,                                   // AND
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0x8){
        name = "TST";
        thumb[j] =
        [
          thumb_tst_rr,                                   // TST
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0x9){
        name = "NEG";
        thumb[i] =
        [
          thumb_neg_rr,                                   // NEG
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xA){
        name = "CMP";
        thumb[i] =
        [
          thumb_cmp_rr,                                   // CMP
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xC){
        name = "ORR";
        thumb[i] =
        [
          thumb_orr,                                      // ORR
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xD){
        name = "MUL";
        thumb[i] =
        [
          thumb_mul,                                      // MUL
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xE){
        name = "BIC";
        thumb[i] =
        [
          thumb_bic,                                      // BIC
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
    }

    // THUMB 5 instructions
    else if(u === 0x11){
      rd = lshift(bit(instr, 7), 3) + rd;
      rs = lshift(bit(instr, 6), 3) + rs;
      opcode = bit(instr, 8, 9);
      if(opcode === 0){
        name = "ADD";
        thumb[i] =
        [
          thumb_add_rr,                                   // ADD
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      else if(opcode === 2){
        if(rd === 8 && rs === 8){
          name = "NOP";
          thumb[i] =
          [
            thumb_nop,                                    // NOP
            [
            ]
          ]
        }
        else{
          name = "MOV";
          thumb[i] =
          [
            thumb5_mov_rr,                                // MOV
            [
              rd,                                         // Rd
              rs                                          // Rs
            ]
          ]
        }
      }
      else if(opcode === 3){
        if(bit(instr, 7) === 0){
          name = "BX";
          thumb[i] =
          [
            thumb_bx,                                     // BX
            [
              rs                                          // Rs
            ]
          ]
        }
      }
    }

    // THUMB 6 instructions
    else if(v === 0x9){
      name = "LDR";
      thumb[i] =
      [
        thumb_ldr_rn,                                     // LDR
        [
          bit(instr, 8, 10),                              // Rd
          mem(                                            // WORD[PC + nn * 4]
            ((0x8000000 + i + 4) & 0xFFFFFFFC)
            +
            offset0_7 * 4,
            4
          )
        ]
      ]
    }

    // THUMB 7/8 instructions
    else if(w === 0x5){
      opcode = bit(instr, 10, 11);
      if(bit(instr, 9) === 1){                            // THUMB 8:
        if(opcode === 0){
          name = "STRH";
          thumb[i] =
          [
            thumb_strh_rrr,                               // STRH
            [
              rd,                                         // Rd
              rb,                                         // Rb
              offset6_8                                   // Ro
            ]
          ]
        }
        else if(opcode === 1){

        }
        else if(opcode === 2){

        }
        else if(opcode === 3){

        }
      }
      else{                                               // THUMB 7:
        if(opcode === 0){
          name = "STR";
          thumb[i] =
          [
            thumb_str_rrr,                                // STR
            [
              rd,                                         // Rd
              rb,                                         // Rb
              offset6_8                                   // Ro
            ]
          ]
        }
        else if(opcode === 1){

        }
        else if(opcode === 2){

        }
        else if(opcode === 3){
          name = "LDRB";
          thumb[i] =
          [
            thumb_ldrb_rrr,                               // LDRB
            [
              rd,                                         // Rd
              rb,                                         // Rb
              offset6_8                                   // Ro
            ]
          ]
        }
      }

    }

    // THUMB 9 instructions
    else if(z === 0x3){
      opcode = bit(instr, 11, 12);
      if(opcode === 0){
        name = "STR";
        thumb[i] =
        [
          thumb_str_rrn,                                  // STR
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10 * 4                                // nn
          ]
        ]
      }
      else if(opcode === 1){
        name = "LDR";
        thumb[i] =
        [
          thumb_ldr_rrn,                                  // LDR
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10 * 4                                // nn
          ]
        ]
      }
      else if(opcode === 2){
        name = "STRB";
        thumb[i] =
        [
          thumb_strb_rrn,                                 // STRB
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
      else if(opcode === 3){
        name = "LDRB";
        thumb[i] =
        [
          thumb_ldrb_rrn,                                 // LDRB
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
    }

    // THUMB 10 instructions
    else if(w === 0x8){
      opcode = bit(instr, 11);
      if(opcode === 0){
        name = "STRH";
        thumb[i] =
        [
          thumb_strh_rrn,                                 // STRH
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
      else if(opcode === 1){
        name = "LDRH";
        thumb[i] =
        [
          thumb_ldrh_rrn,                                 // LDRH
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
    }

    // THUMB 11 instructions
    else if(w === 0x9){
      rd = bit(instr, 8, 10);
      if(bit(instr, 11) === 1){
        name = "LDR";
        thumb[i] =
        [
          thumb_ldr_spn,                                  // LDR
          [
            rd,                                           // Rd
            offset0_7 * 4                                 // nn
          ]
        ]
      }
      else{
        name = "STR";
        thumb[i] =
        [
          thumb_str_spn,                                  // STR
          [
            rd,                                           // Rd
            offset0_7 * 4                                 // nn
          ]
        ]
      }
    }

    // THUMB 12 instructions
    else if(w === 0xA){

    }

    // THUMB 13 instructions
    else if(t === 0xB0){
      nn = bit(instr, 0, 6) * 4;
      if(bit(instr, 7) === 1){
        nn = -nn;
      }
      name = "ADD";
      thumb[i] =
      [
        thumb_add_spn,                                    // ADD
        [
          nn                                              // nn
        ]
      ]
    }

    // THUMB 17 BKPT instruction
    else if(t === 0xBE){

    }

    // THUMB 14 instructions
    else if(w === 0xB){
      opcode = bit(instr, 11);
      if(opcode === 0){
        name = "PUSH";
        thumb[i] =
        [
          thumb_push,                                     // PUSH
          [
            bit(instr, 0, 7),                             // Rlist
            bit(instr, 8)                                 // LR
          ]
        ]
      }
      else{
        name = "POP";
        thumb[i] =
        [
          thumb_pop,                                      // POP
          [
            bit(instr, 0, 7),                             // Rlist
            bit(instr, 8)                                 // PC
          ]
        ]
      }
    }

    // THUMB 15 instructions
    else if(w === 0xC){
      opcode = bit(instr, 11);
      if(opcode === 0){
        name = "STMIA";
        thumb[i] =
        [
          thumb_stmia,                                    // STMIA
          [
            bit(instr, 8, 10),                            // Rb
            bit(instr, 0, 7)                              // Rlist
          ]
        ]
      }
      else if(opcode === 1){
        name = "LDMIA";
        thumb[i] =
        [
          thumb_ldmia,                                    // LDMIA
          [
            bit(instr, 8, 10),                            // Rb
            bit(instr, 0, 7)                              // Rlist
          ]
        ]
      }
    }

    // THUMB 17 SWI instruction
    else if(t === 0xDF){

    }

    // THUMB 16/18 instructions
    else if(w === 0xD || v === 0x1C){

      if(v === 0x1C){                                      // THUMB 18:
        name = "B"; f = thumb_b;
      }
      else{                                               // THUMB 16:
        cond = bit(instr, 8, 11);
        switch(cond){
          case 0: name = "BEQ"; f = thumb_beq; break;
          case 1: name = "BNE"; f = thumb_bne; break;
          case 2: name = "BCS"; f = thumb_bcs; break;
          case 3: name = "BCC"; f = thumb_bcc; break;
          case 4: name = "BMI"; f = thumb_bmi; break;
          case 5: name = "BPL"; f = thumb_bpl; break;
          case 6: name = "BVS"; f = thumb_bvs; break;
          case 7: name = "BVC"; f = thumb_bvc; break;
          case 8: name = "BHI"; f = thumb_bhi; break;
          case 9: name = "BLS"; f = thumb_bls; break;
          case 0xA: name = "BGE"; f = thumb_bge; break;
          case 0xB: name = "BLT"; f = thumb_blt; break;
          case 0xC: name = "BGT"; f = thumb_bgt; break;
          case 0xD: name = "BLE"; f = thumb_ble; break;
        }
      }

      offset0_7 *= 2;
      if(offset0_7 > 254){
        offset0_7 -= 512;
      }

      thumb[i] =
      [
        f,                                                // B{cond}
        [
          0x8000000 + i + 4 + offset0_7                   // address
        ]
      ]
    }

    // THUMB 19 instruction
    else if(v === 0x1E){
      instr2 = mem(0x8000000 + i + 2, 2);
      opcode = bit(instr2, 11, 15);
      address = lshift(bit(instr, 0, 10), 12) +  lshift(bit(instr2, 0, 10), 1);
      if(address > 0x400000){
        address -= 0x800000;
      }
      if(opcode === 0x1F){
        name = "BL";
        thumb[i] =
        [
          thumb_bl,                                       // BL
          [
            0x8000000 + i + 4 + address,                  // address
            (0x8000000 + i + 4) | 1                       // link
          ]
        ];
      }
    }
    if(thumb[i]) thumb[i].push(name);
  }
*/
  // Update debug interface
  if(debug){
    name = document.getElementById("thumbvalue" + hex(r[15]));
    if(name){
      name.innerHTML = hex(m16[8][i], 4);
      document.getElementById("thumbname" + hex(r[15])).innerHTML = thumb_asm[i];
    }
  }
}

