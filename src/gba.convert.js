/**********
  Convert
***********/
GBA.convert = function(){

  var
  i, j,                                                   // iterators
  instr, instr2,                                          // instructions
  name,                                                   // instruction name
  cond,                                                   // condition field
  opcode,                                                 // opcode field
  params,                                                 // params array
  t, u, v, w, z,                                          // THUMB bit fields
  rd, rs, rb,                                             // THUMB frequently used registers
  nn, offset6_10, offset6_8, offset0_7,                   // THUMB frequently used values
  f,                                                      // function to call
  address;                                                // address

  // Extract words
  for(i = 0; i < GBA.m[8].length; i += 4){                // for each word of the ROM:
    for(instr = 0, j = 4; j; j--){                        // for each byte to read:
      instr
      =
      GBA.lshift(instr, 8)                                // add one byte at the end of the temp value (left shift: 8)
      +
      (GBA.m[8][i + j - 1] || 0);                         // add the byte in memory (or 0) at the end of the temp value
    }
    GBA.rom_word.push(instr);                             // store it in rom_word
  }
  
  // Extract halfwords
  for(i = 0; i < GBA.m[8].length; i += 2){                // for each halfword:
  
    for(instr = 0, j = 2; j; j--){                        // for each byte to read:
      instr
      =
      GBA.lshift(instr, 8)                                // add one byte at the end of the temp value (left shift: 8)
      +
      (GBA.m[8][i + j - 1] || 0);                         // add the byte in memory (or 0) at the end of the temp value
    }
    GBA.rom_halfword.push(instr);                         // store it in rom_halfword
  }
  
  // Extract ARM opcodes
  for(i = 0; i < GBA.m[8].length; i += 4){                // for each word:
    j = i / 4;                                            // j : place of the word inside the ROM
    instr = GBA.rom_word[j];                              // read the word
    if(j > 0 && j < 48){
      continue;                                           // ignore the first 47 words (ROM header)
    }
    name = "?";                                           // reset the name
    cond = GBA.bit(instr, 28, 31);                        // read the condition field

    // ARM3
    if(GBA.bit(instr, 8, 27) === 0x012FFF){
      name = "BX";
      GBA.rom_arm[j] =
      [
        GBA.arm_bx,                                       // BX
        [
          GBA.bit(instr, 0, 3)                            // rn
        ]
      ]
    }

    // ARM4
    else if(GBA.bit(instr, 25, 27) === 0x5){
      opcode = GBA.bit(instr, 24);                        // get opcode
      if(opcode){                                         // opcode === 1:
        name = "BL";
        GBA.rom_arm[j] =
        [
          GBA.arm_bl,                                     // BL
          [
            0x8000000 + i + 4,                            // link
            0x8000000 + i + 8 + GBA.bit(instr, 0, 23) * 4 // address
          ]
        ]
      }
      else{                                               // opcode === 0:
        name = "B";
        GBA.rom_arm[j] =
        [
          GBA.arm_b,                                      // B
          [
            0x8000000 + i + 8 + GBA.bit(instr, 0, 23) * 4 // address
          ]
        ]
      }
    }

    // ARM9
    else if(GBA.bit(instr, 26, 27) === 0x1){
      params =
      {
        i: GBA.bit(instr, 25),                            // I
        p: GBA.bit(instr, 24),                            // P
        u: GBA.bit(instr, 23),                            // U
        b: GBA.bit(instr, 22),                            // B
        l: GBA.bit(instr, 20),                            // L
        rn: GBA.bit(instr, 16, 19),                       // Rn
        rd: GBA.bit(instr, 12, 15),                       // Rd
        wt: GBA.bit(instr, 21),                           // W/T
        is: GBA.bit(instr, 7, 11),                        // Is
        st: GBA.bit(instr, 5, 6),                         // Shift Type
        rm: GBA.bit(instr, 0, 3),                         // Rm
        nn: GBA.bit(instr, 0, 11),                        // nn
        address: 0                                        // address to read/write
      };
      if(params.l){
        name = "LDR";
        GBA.rom_arm[j] =
        [
          GBA.arm_ldr,                                    // LDR
          [
            params.rd,                                    // Rd
            params.rn,                                    // Rn
            params.nn                                     // nn
          ]
        ]
      }
      else{
        name = "STR";
        GBA.rom_arm[j] =
        [
          GBA.arm_str,                                    // STR
          [
            params.rd,                                    // Rd
            params.rn,                                    // Rn
            params.nn                                     // nn
          ]
        ]
      }
    }

    // ARM7
    else if
    (
      GBA.bit(instr, 25, 27) === 0x0
      && GBA.bit(instr, 7) === 0x0
      && GBA.bit(instr, 12, 15) != 0xF
    )
    {
      GBA.rom_arm[j] =
      [
        GBA.arm7,                                         // the function
        [
        ]
      ]
    }

    // ARM5/6
    else{
      params =
      {
        opcode5: GBA.bit(instr, 21, 24),                  // opcode for ARM5
        opcode6: GBA.bit(instr, 21),                      // opcode for ARM6
        i: GBA.bit(instr, 25),                            // I
        s: GBA.bit(instr, 20),                            // S
        rn: GBA.bit(instr, 16, 19),                       // Rn
        rd: GBA.bit(instr, 12, 15),                       // Rd
        is: GBA.bit(instr, 8, 11) * 2,                    // Is
        nn: GBA.bit(instr, 0, 7),                         // nn
        r: GBA.bit(instr, 4),                             // R
        rs: GBA.bit(instr, 8, 11),                        // Rs
        is: GBA.bit(instr, 7, 11),                        // Is
        st: GBA.bit(instr, 5, 6),                         // Shift Type
        rm: GBA.bit(instr, 0, 3),                         // Rm
        psr: GBA.bit(instr, 22),                          // Psr
        f: GBA.bit(instr, 19),                            // f
        s: GBA.bit(instr, 18),                            // s
        x: GBA.bit(instr, 17),                            // x
        c: GBA.bit(instr, 16),                            // c
        imms: GBA.bit(instr, 8, 11),                      // Imm shift
        imm: GBA.bit(instr, 0, 7),                        // Imm
        rm: GBA.bit(instr, 0, 3),                         // Rm
        mask: 0                                           // bit mask
      }
      
      // ARM6
      if
      (
        !params.s
        && params.opcode5 >= 8
        && params.opcode5 <= 0xB
      )
      {
        if(params.f === 1){                               // if f:
          params.mask += 0xFF000000;                      // allow to write on flags (bits 24-31)
        }
        if(params.c === 1){                               // if c:
          params.mask += 0xFF;                            // allow to write on controls (bits 0-7)
        }
        name = "MSR spsr";
        if(params.psr){                                   // if SPSR:
          GBA.rom_arm[j] =
          [
            GBA.arm_msr_spsr,                             // MSR spsr_
            [
              params.rm,                                  // Rm
              params.f,                                   // f
              params.c,                                   // c
              params.mask                                 // mask
            ]
          ]
        }
        else{                                             // if CPSR:
          name = "MSR cpsr";
          GBA.rom_arm[j] =
          [
            GBA.arm_msr_cpsr,                             // MSR cpsr_
            [
              params.rm,                                  // Rm
              params.f,                                   // f
              params.c,                                   // c
              params.mask                                 // mask
            ]
          ]
        }
      }

      // ARM5
      else{
        if(i){                                            // if I === 1 (immediate as 2nd operand)
          params.is = GBA.bit(instr, 8, 11) * 2;          // get Is (bits 8-11, values: 0-30 in steps of 2)
          params.nn = GBA.bit(instr, 0, 7);               // get nn (bits 0-7)
          params.op2 = GBA.ror(params.nn, 32, params.is); // Op2 = nn right-rotated with is
        }
        switch(params.opcode5){
          case 0x0:
            break;
          case 0x1:
            break;
          case 0x2:
            break;
          case 0x3: 
            break;
          case 0x4:
            name = "ADD";
            GBA.rom_arm[j] =
            [
              GBA.arm_add,                                // MOV
              [
                params.rd,                                // Rd
                params.rn,                                // Rn
                params.op2                                // Op2
              ]
            ]
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
          case 0xD:
            name = "MOV";
            GBA.rom_arm[j] =
            [
              GBA.arm_mov,                                // MOV
              [
                params.rd,                                // Rd
                params.op2                                // Op2
              ]
            ]
            break;
          case 0xE:
            break;
          case 0xF:
            break;
        }
      }
    }
    
    if(GBA.rom_arm[j] && cond != 0xe){                    // if there's a condition:
      GBA.rom_arm[j][1].push(cond);                       // add it
    }
    
    if(cond === 0 && name !== "?") name += "EQ";          // name
    if(cond === 1) name += "NE";                          // the
    if(cond === 2) name += "CS";                          // instruction
    if(cond === 3) name += "CC";                          // according
    if(cond === 4) name += "MI";                          // to
    if(cond === 5) name += "PL";                          // the
    if(cond === 6) name += "VS";                          // condition
    if(cond === 7) name += "VC";
    if(cond === 8) name += "HI";
    if(cond === 9) name += "LS";
    if(cond === 0xA) name += "GE";
    if(cond === 0xB) name += "LT";
    if(cond === 0xC) name += "GT";
    if(cond === 0xD) name += "LE";
    if(cond === 0xF) name += "NV";

    /*
    if(GBA.rom_arm[j]){
      console.log
      (
        ("00" + (j * 4).toString(16)).slice(-3)
        + "  "
        + ("0000000" + (instr).toString(16)).slice(-8)
        + "  "
        + (name + "       ").slice(0, 8)
        + "  "
        + (GBA.rom_arm[j][1][0] !== undefined ? GBA.rom_arm[j][1][0].toString(16) : "")
        + (GBA.rom_arm[j][1][1] !== undefined ? ", " + GBA.rom_arm[j][1][1].toString(16) : "")
        + (GBA.rom_arm[j][1][2] !== undefined ? ", " + GBA.rom_arm[j][1][2].toString(16) : "")
        + (GBA.rom_arm[j][1][3] !== undefined ? ", " + GBA.rom_arm[j][1][3].toString(16) : "")
      );
    }
    */
  }
  
  // Extract THUMB opcodes
  for(i = 0; i < GBA.m[8].length; i += 2){                // for each halfword:

    j = i / 2;                                            // j : place of the halfword inside the ROM
    instr = GBA.rom_halfword[j];                          // read the halfword
    
    if(j < 94){
      continue;                                           // ignore the first 94 halfwords  (ROM header)
    }

    t = GBA.bit(instr, 8, 15);                            // isolate
    u = GBA.bit(instr, 10, 15);                           // some
    v = GBA.bit(instr, 11, 15);                           // bit fields
    w = GBA.bit(instr, 12, 15);                           // of the
    z = GBA.bit(instr, 13, 15);                           // instruction
    rd = GBA.bit(instr, 0, 2);                            // get Rd
    rs = GBA.bit(instr, 3, 5);                            // get Rs
    rb = GBA.bit(instr, 3, 5);                            // get Rb
    offset6_10 = GBA.bit(instr, 6, 10);                   // get offset, bits 6-10
    offset6_8 = GBA.bit(instr, 6, 8);                     // get offset, bits 6-8
    offset0_7 = GBA.bit(instr, 0, 7);                     // get offset, bits 0-7

    name = "?";                                           // reset the name
    GBA.rom_thumb[j] = [GBA.plop, [1]];                   // default instruction (0x00000000)

    // THUMB 1/2 instructions
    if(z === 0x0){
      opcode = GBA.bit(instr, 11, 12);                    // get opcode
      if(opcode === 0x3){                                 // THUMB 2
        opcode = GBA.bit(instr, 9, 10);                   // get specific opcode
        if(opcode === 2 && !offset6_8){
          name = "MOV";
          GBA.rom_thumb[j] =
          [
            GBA.thumb2_mov_rr,                            // MOV
            [
              rd,                                         // Rd
              rs                                          // Rs
            ]
          ]
        }
        else if(opcode === 0x0){
          name = "ADD";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_add_rrr,                            // ADD
            [
              rd,                                         // Rd
              rs,                                         // Rs
              GBA.bit(instr, 6, 8)                        // Rn
            ]
          ]
        }
        else if(opcode === 0x1){
          name = "SUB";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_sub_rrr,                            // SUB
            [
              rd,                                         // Rd
              rs,                                         // Rs
              GBA.bit(instr, 6, 8)                        // Rn
            ]
          ]
        }
        else if(opcode === 0x2){
          name = "ADD";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_add_rrn,                            // ADD
            [
              rd,                                         // Rd
              rs,                                         // Rs
              GBA.bit(instr, 6, 8)                        // nn
            ]
          ]
        }
        else if(opcode === 0x3){
          name = "SUB";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_sub_rrn,                            // SUB
            [
              rd,                                         // Rd
              rs,                                         // Rs
              GBA.bit(instr, 6, 8)                        // nn
            ]
          ]
        }
      }
      else{                                               // THUMB 1
        if(opcode === 0x0){
          name = "LSL";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_lsl_rrn,                            // LSL
            [
              rd,                                         // Rd
              rs,                                         // Rs
              offset6_10                                  // Offset
            ]
          ]
        }
        else if(opcode === 0x1){
          if(offset6_10 === 0){
            offset6_10 = 32;                              // zero shift = 32-bit shift
          }
          name = "LSR";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_lsr,                                // LSR
            [
              rd,                                         // Rd
              rs,                                         // Rs
              offset6_10                                  // Offset
            ]
          ]
        }
        else if(opcode === 0x2){
          if(offset6_10 === 0){
            offset6_10 = 32;                              // zero shift = 32-bit shift
          }
          name = "ASR";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_asr,                                // ASR
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
      opcode = GBA.bit(instr, 11, 12);                    // get opcode
      if(opcode === 0){
        name = "MOV";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_mov_rn,                               // MOV
          [
            GBA.bit(instr, 8, 10),                        // Rd
            offset0_7                                     // nn
          ]
        ]
      }
      else if(opcode === 1){
        name = "CMP";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_cmp_rn,                               // CMP
          [
            GBA.bit(instr, 8, 10),                        // Rd
            offset0_7                                     // nn
          ]
        ]
      }
      else if(opcode === 2){
        name = "ADD";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_add_rn,                               // ADD
          [
            GBA.bit(instr, 8, 10),                        // Rd
            offset0_7                                     // nn
          ]
        ]
      }
      else if(opcode === 3){
        name = "SUB";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_sub_rn,                               // SUB
          [
            GBA.bit(instr, 8, 10),                        // Rd
            offset0_7                                     // nn
          ]
        ]
      }
    }

    // THUMB 4 instructions
    else if(u === 0x10){
      opcode = GBA.bit(instr, 6, 9);                      // get opcode
      if(opcode === 0x9){
        name = "NEG";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_neg_rr,                               // NEG
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xA){
        name = "CMP";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_cmp_rr,                               // CMP
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xC){
        name = "ORR";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_orr,                                  // ORR
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xD){
        name = "MUL";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_mul,                                  // MUL
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      if(opcode === 0xE){
        name = "BIC";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_bic,                                  // BIC
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
    }

    // THUMB 5 instructions
    else if(u === 0x11){
      rd = GBA.lshift(GBA.bit(instr, 7), 3) + rd;         // add MSBd to Rd
      rs = GBA.lshift(GBA.bit(instr, 6), 3) + rs;         // add MSBs to Rs
      opcode = GBA.bit(instr, 8, 9);                      // get opcode
      if(opcode === 0){
        name = "ADD";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_add_rr,                               // ADD
          [
            rd,                                           // Rd
            rs                                            // Rs
          ]
        ]
      }
      else if(opcode === 2){
        if(rd === 8 && rs === 8){
          name = "NOP";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_nop,                                // NOP
            [
            ]
          ]
        }
        else{
          name = "MOV";
          GBA.rom_thumb[j] =
          [
            GBA.thumb5_mov_rr,                            // MOV
            [
              rd,                                         // Rd
              rs                                          // Rs
            ]
          ]
        }
      }
      else if(opcode === 3){
        if(GBA.bit(instr, 7) === 0){
          name = "BX";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_bx,                                 // BX
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
      GBA.rom_thumb[j] =
      [
        GBA.thumb_ldr_n,                                  // LDR
        [
          GBA.bit(instr, 8, 10),                          // Rd
          GBA.mem(                                        // WORD[PC + nn * 4]
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
      opcode = GBA.bit(instr, 10, 11);                    // get opcode
      if(GBA.bit(instr, 9) === 1){                        // THUMB 8
        if(opcode === 0){
          name = "STRH";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_strh_rrr,                           // STRH
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
      else{                                               // THUMB 7
        if(opcode === 0){
          name = "STR";
          GBA.rom_thumb[j] =
          [
            GBA.thumb_str_rrr,                            // STR
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
          GBA.rom_thumb[j] =
          [
            GBA.thumb_ldrb_rrr,                           // LDRB
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
      opcode = GBA.bit(instr, 11, 12);                    // get opcode
      if(opcode === 0){
        name = "STR";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_str_rrn,                              // STR
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
      else if(opcode === 1){
        name = "LDR";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_ldr_rrn,                              // LDR
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
      else if(opcode === 2){
        name = "STRB";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_strb_rrn,                             // STRB
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
      else if(opcode === 3){
        name = "LDRB";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_ldrb_rrn,                             // LDRB
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
      opcode = GBA.bit(instr, 11);                        // get opcode
      if(opcode === 0){
        name = "STRH";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_strh_rrn,                             // STRH
          [
            rd,                                           // Rd
            rb,                                           // Rb
            offset6_10                                    // nn
          ]
        ]
      }
      else if(opcode === 1){
        name = "LDRH";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_ldrh_rrn,                             // LDRH
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
      rd = GBA.bit(instr, 8, 10);                         // get Rd (bits 8-10)
      if(GBA.bit(instr, 11) === 1){
        name = "LDR";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_ldr_spn,                              // LDR
          [
            rd,                                           // Rd
            offset0_7 * 4                                 // nn
          ]
        ]
      }
      else{
        name = "STR";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_str_spn,                              // STR
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
      nn = GBA.bit(instr, 0, 6) * 4;                      // get nn (bits 0-6, in steps of 4)
      if(GBA.bit(instr, 7) === 1){                        // if opcode == 1, nn is negative
        nn = -nn;
      }
      name = "ADD";
      GBA.rom_thumb[j] =
      [
        GBA.thumb_add_spn,                                // ADD
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
      opcode = GBA.bit(instr, 11);                        // get opcode
      if(opcode === 0){
        name = "PUSH";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_push,                                 // PUSH
          [
            GBA.bit(instr, 0, 7),                         // Rlist
            GBA.bit(instr, 8)                             // LR
          ]
        ]
      }
      else{
        name = "POP";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_pop,                                  // POP
          [
            GBA.bit(instr, 0, 7),                         // Rlist
            GBA.bit(instr, 8)                             // PC
          ]
        ]
      }
    }

    // THUMB 15 instructions
    else if(w === 0xC){
      opcode = GBA.bit(instr, 11);                        // get opcode
      if(opcode === 0){
        name = "STMIA";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_stmia,                                // STMIA
          [
            GBA.bit(instr, 8, 10),                        // Rb
            GBA.bit(instr, 0, 7)                          // Rlist
          ]
        ]
      }
      else if(opcode === 1){
        name = "LDMIA";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_ldmia,                                // LDMIA
          [
            GBA.bit(instr, 8, 10),                        // Rb
            GBA.bit(instr, 0, 7)                          // Rlist
          ]
        ]
      }
    }

    // THUMB 17 SWI instruction
    else if(t === 0xDF){

    }

    // THUMB 16/18 instructions
    else if(w === 0xD || v === 0x1C){

      if(v === 0x1C){ name = "B"; f = GBA.thumb_b; }      // THUMB 18
      else{                                               // THUMB 16
        cond = GBA.bit(instr, 8, 11);                     // get the condition
        switch(cond){
          case 0: name = "BEQ"; f = GBA.thumb_beq; break; // name
          case 1: name = "BNE"; f = GBA.thumb_bne; break; // the
          case 2: name = "BCS"; f = GBA.thumb_bcs; break; // instruction
          case 3: name = "BCC"; f = GBA.thumb_bcc; break; // according
          case 4: name = "BMI"; f = GBA.thumb_bmi; break; // to
          case 5: name = "BPL"; f = GBA.thumb_bpl; break; // the
          case 6: name = "BVS"; f = GBA.thumb_bvs; break; // condition
          case 7: name = "BVC"; f = GBA.thumb_bvc; break;
          case 8: name = "BHI"; f = GBA.thumb_bhi; break;
          case 9: name = "BLS"; f = GBA.thumb_bls; break;
          case 0xA: name = "BGE"; f = GBA.thumb_bge; break;
          case 0xB: name = "BLT"; f = GBA.thumb_blt; break;
          case 0xC: name = "BGT"; f = GBA.thumb_bgt; break;
          case 0xD: name = "BLE"; f = GBA.thumb_ble; break;
        }
      }

      offset0_7 *= 2;                                     // the offset goes by steps of 2
      if(offset0_7 > 254){
        offset0_7 -= 512;                                 // the offset is signed
      }

      GBA.rom_thumb[j] =
      [
        f,                                                // B{cond}
        [
          0x8000000 + i + 4 + offset0_7                   // address
        ]
      ]
    }

    // THUMB 19 instruction
    else if(v === 0x1E){
      instr2 = GBA.mem(0x8000000 + i + 2, 2);             // get instr 2
      opcode = GBA.bit(instr2, 11, 15);                   // get opcode
      address = GBA.lshift(GBA.bit(instr, 0, 10), 12)     // offset: instr bits 0-10 << 12 + instr2 bits 0-10 << 1
                +
                GBA.lshift(GBA.bit(instr2, 0, 10), 1);
      if(address > 0x400000){                             // offset is signed
        address -= 0x800000;
      }
      if(opcode === 0x1F){
        name = "BL";
        GBA.rom_thumb[j] =
        [
          GBA.thumb_bl,                                   // BL
          [
            0x8000000 + i + 4 + address,                  // address
            (0x8000000 + i + 4) | 1                       // link
          ]
        ]
        j += 2;                                           // skip the second halfword
      }
    }

    /*
    if(GBA.rom_thumb[j]){
      console.log
      (
        (j * 2).toString(16) + "  "
        + ("00" + (j * 2).toString(16)).slice(-3)
        + "  "
        + (("000" + instr.toString(16) + "    ").toString(16)).slice(-8)
        + "  "
        + (name + "       ").slice(0, 8)
        + "  "
        + (GBA.rom_thumb[j][1][0] !== undefined ? GBA.rom_thumb[j][1][0].toString(16) : "")
        + (GBA.rom_thumb[j][1][1] !== undefined ? ", " + GBA.rom_thumb[j][1][1].toString(16) : "")
        + (GBA.rom_thumb[j][1][2] !== undefined ? ", " + GBA.rom_thumb[j][1][2].toString(16) : "")
        + (GBA.rom_thumb[j][1][3] !== undefined ? ", " + GBA.rom_thumb[j][1][3].toString(16) : "")
      );
    }
    */
  }
}
