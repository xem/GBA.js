/********
  THUMB
*********/

// THUMB 1

GBA.thumb_lsl_rrn = function(p){
  GBA.trace += "LSL r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
  GBA.r[p[0]] = GBA.lshift(GBA.r[p[1]], p[2]);
  if(p[2] !== 0){                                         // if not LSL #0
    GBA.update_cpsr_c(p[0]);                              // update C flag
  }
  if(GBA.r[p[0]] < 0){                                    // stay positive when bit 31 is set
    GBA.r[p[0]] = 0xFFFFFFFF + GBA.r[p[0]] + 1;
  }
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_lsr = function(p){
  GBA.trace += "LSR r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
  GBA.r[p[0]] = GBA.rshift(GBA.r[p[1]], p[2]);
  GBA.update_cpsr_c(p[0]);                                // update C flag
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_asr = function(p){
  GBA.trace += "ASR r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
  GBA.r[p[0]] = GBA.r[p[1]] >> p[2];                      // Rd = Rs >> nn
  GBA.update_cpsr_c(p[0]);                                // update C flag
  if(GBA.r[p[0]] < 0){                                    // stay positive when bit 31 is set
    GBA.r[p[0]] = 0xFFFFFFFF + GBA.r[p[0]] + 1;
  }
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

// THUMB 2

GBA.thumb_add_rrr = function(p){
  GBA.trace += "ADD r" + p[0] + ",r" + p[1] + ",r" + p[2];
  GBA.r[p[0]] = GBA.r[p[1]] + GBA.r[p[2]];
  if(GBA.r[p[0]] < 0){
    GBA.r[p[0]] = 0xFFFFFFFF + GBA.r[p[0]] + 1;
  }
  GBA.update_cpsr_c(p[0]);                                // update C flag
  GBA.update_cpsr_n(p[0]);                                // update V flag
  GBA.update_cpsr_z(p[0]);                                // update N flag
  GBA.update_cpsr_v(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_sub_rrr = function(p){
  GBA.trace += "SUB r" + p[0] + ",r" + p[1] + ",r" + p[2];
  GBA.r[p[0]] = GBA.r[p[1]] - GBA.r[p[2]];
  if(GBA.r[p[0]] < 0){                                    // write negarive numbers on 32 bits signed
    GBA.r[p[0]] = 0xFFFFFFFF + GBA.r[p[0]] + 1;
  }
  GBA.update_cpsr_c_sub(GBA.r[p[1]], GBA.r[p[2]]);        // update C flag (substraction)
  GBA.update_cpsr_v(p[0]);                                // update V flag
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_add_rrn = function(p){
  GBA.trace += "ADD R" + p[0] + ",R" + p[1] + ",#0x" + p[2].toString(16);
  GBA.r[p[0]] = GBA.r[p[1]] + p[2];                       // Rd = Rs + nn
  GBA.update_cpsr_c(p[0]);                                // update C flag
  GBA.update_cpsr_n(p[0]);                                // update V flag
  GBA.update_cpsr_z(p[0]);                                // update N flag
  GBA.update_cpsr_v(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_sub_rrn = function(p){
  GBA.trace += "SUB R" + p[0] + ",R" + p[1] + ",#0x" + p[2].toString(16);
  GBA.r[p[0]] = GBA.r[p[1]] - p[2];                       // Rd = Rs - nn
  if(GBA.r[p[0]] < 0){                                    // write negarive numbers on 32 bits signed
    GBA.r[p[0]] = 0xFFFFFFFF + GBA.r[p[0]] + 1;
  }
  GBA.update_cpsr_c_sub(GBA.r[p[1]], p[2]);               // update C flag (substraction)
  GBA.update_cpsr_v(p[0]);                                // update V flag
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb2_mov_rr = function(p){
  GBA.trace += "MOV r" + p[0] + ",r" + p[1];
  GBA.r[p[0]] = GBA.r[p[1]];                              // Rd = Rs
  GBA.r[15] += 2;
  GBA.update_cpsr_c(p[0]);
  GBA.update_cpsr_n(p[0]);
  GBA.update_cpsr_z(p[0]);
  GBA.update_cpsr_v(p[0]);
}

// THUMB 3

GBA.thumb_mov_rn = function(p){
  GBA.trace += "MOV r" + p[0] + ",#0x" + p[1].toString(16);
  GBA.r[p[0]] = p[1];                                     // Rd = nn
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_cmp_rn = function(p){
  GBA.trace += "CMP R" + p[0] + ",#0x" + p[1].toString(16);
  GBA.r[16] = GBA.r[p[0]] - p[1];                         // void (R16) = Rd - nn
  GBA.update_cpsr_c_sub(GBA.r[p[0]], p[1]);               // update C flag (substraction)
  GBA.update_cpsr_v(16);                                  // update V flag
  GBA.update_cpsr_n(16);                                  // update N flag
  GBA.update_cpsr_z(16);                                  // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_add_rn = function(p){
  GBA.trace += "ADD r" + p[0] + ",#0x" + p[1].toString(16);
  GBA.r[p[0]] += p[1];
  GBA.update_cpsr_c(p[0]);                                // update C flag
  GBA.update_cpsr_v(p[0]);                                // update V flag
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_sub_rn = function(p){
  GBA.trace += "SUB r" + p[0] + ",#0x" + p[1].toString(16);
  GBA.r[p[0]] -= p[1];
  GBA.update_cpsr_c_sub(GBA.r[p[0]], p[1]);               // update C flag (substraction)
  GBA.update_cpsr_v(p[0]);                                // update V flag
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

// THUMB 4

GBA.thumb_neg_rr = function(p){
  GBA.trace += "NEG r" + p[0] + ",r" + p[1];
  GBA.r[p[0]] = 0xFFFFFFFF - GBA.r[p[1]] + 1;             // Rd = - Rs
  GBA.update_cpsr_c(p[0]);                                // update C flag
  GBA.update_cpsr_v(p[0]);                                // update V flag
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_cmp_rr = function(p){
  GBA.trace += "CMP r" + p[0] + ",r" + p[1];
  GBA.r[16] = GBA.r[p[0]] - GBA.r[p[1]];                  // void = Rd - Rs
  GBA.update_cpsr_c_sub(GBA.r[p[0]], GBA.r[p[1]]);        // update C flag (substraction)
  GBA.update_cpsr_v(16);                                  // update V flag
  GBA.update_cpsr_n(16);                                  // update N flag
  GBA.update_cpsr_z(16);                                  // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_orr = function(p){
  GBA.trace += "ORR r" + p[0] + ",r" + p[1];
  GBA.r[p[0]] |= GBA.r[p[1]];                             // Rd = Rd OR Rs
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_mul = function(p){
  GBA.trace += "MUL r" + p[0] + ",r" + p[1];
  GBA.r[p[0]] *= GBA.r[p[1]];                             // Rd = Rd OR Rs
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

GBA.thumb_bic = function(p){
  GBA.trace += "BIC r" + p[0] + ",r" + p[1];
  GBA.r[p[0]] = GBA.r[p[0]] & (0xFFFFFFFF - GBA.r[p[1]]); // Rd = Rd AND NOT Rs
  GBA.update_cpsr_n(p[0]);                                // update N flag
  GBA.update_cpsr_z(p[0]);                                // update Z flag
  GBA.r[15] += 2;
}

// THUMB 5

GBA.thumb_add_rr = function(p){
  GBA.trace += "ADD r" + p[0] + ",r" + p[1];
  GBA.r[p[0]] += GBA.r[p[1]];                             // Rd = Rd + Rs
  GBA.r[15] += 2;
}

GBA.thumb5_mov_rr = function(p){
  GBA.trace += "MOV r" + p[0] + ",r" + p[1];
  GBA.r[p[0]] = GBA.r[p[1]];                              // Rd = Rs
  GBA.r[15] += 2;
}

GBA.thumb_nop = function(){
  GBA.trace += "NOP";
  GBA.r[15] += 2;
}

GBA.thumb_bx = function(p){
  GBA.trace += "BX r" + p[0];
  GBA.r[15] = GBA.r[p[0]] - 1;                            // PC = Rd
}

// THUMB 6

GBA.thumb_ldr_n = function(p){
  GBA.trace += "LDR r" + p[0] + ",=#0x" + p[1].toString(16);
  GBA.r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
  GBA.r[15] += 2;
}

// THUMB 7

GBA.thumb_str_rrr = function(p){
  GBA.trace += "STR rrr";
  //GBA.trace += "STR r" + p[0] + ",=#0x" + p[1].toString(16);
  //GBA.r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
  //GBA.r[15] += 2;
}

GBA.thumb_strb_rrr = function(p){

}

GBA.thumb_ldr_rrr = function(p){
  //GBA.trace += "LDR r" + p[0] + ",=#0x" + p[1].toString(16);
  //GBA.r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
  //GBA.r[15] += 2;
}

GBA.thumb_ldrb_rrr = function(){

}

// THUMB 8

GBA.thumb_strh_rrr = function(p){
  GBA.trace += "STRH R" + p[0] + ",[R" + p[1] + ",R" + p[2] + "]";
  GBA.mem(GBA.r[p[1]] + GBA.r[p[2]], 2, GBA.r[p[0]]);     // HALFWORD[Rb+Ro] = Rd
  GBA.r[15] += 2;
}

// THUMB 9

GBA.thumb_str_rrn = function(p){
  GBA.trace += "STR R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2]) : "") + "]";
  GBA.mem(GBA.r[p[1]] + p[2], 4, GBA.r[p[0]]);
  GBA.r[15] += 2;
}

GBA.thumb_ldr_rrn = function(p){
  GBA.trace += "LDR R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2]) : "") + "]";
  GBA.r[p[0]] = GBA.mem(GBA.r[p[1]] + p[2], 4);
  GBA.r[15] += 2;
}

GBA.thumb_strb_rrn = function(p){
}

GBA.thumb_ldrb_rrb = function(p){
}

// THUMB 10

GBA.thumb_strh_rrn = function(p){
  GBA.trace += "STRH R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2].toString(16)) : "") + "]";
  GBA.mem(GBA.r[p[1]] + p[2], 2, GBA.r[p[0]]);            // HALFWORD[Rb+nn] = Rd
  GBA.r[15] += 2;
}

GBA.thumb_ldrh_rrn = function(p){
}

// THUMB 11

GBA.thumb_str_spn = function(p){
  GBA.trace += "STR R" + p[0] + ",[SP" + (p[1] ? (",#0x" + p[1].toString(16)) : "") + "]";
  GBA.mem(GBA.r[13] + p[1], 4, GBA.r[p[0]]);              // WORD[SP+nn] = Rd
  GBA.r[15] += 2;
}

GBA.thumb_ldr_spn = function(p){
  GBA.trace += "LDR R" + p[0] + ",[SP" + (p[1] ? (",#0x" + p[1].toString(16)) : "") + "]";
  GBA.r[p[0]] = GBA.mem(GBA.r[13] + p[1], 4);             // Rd = WORD[SP+nn] 
  GBA.r[15] += 2;
}

// THUMB 12

// THUMB 13

GBA.thumb_add_spn = function(p){
  GBA.trace += "ADD SP,#" + p[0].toString(16);
  GBA.r[13] += p[0];                                      // SP = SP +/- nn
  GBA.r[15] += 2;
}

// THUMB 14

GBA.thumb_push = function(p){ // optimizable
  GBA.trace += "PUSH {";
  if(p[1] === 1){                                         // if LR == 1
    GBA.r[13] -= 4;                                       // decrement R13
    GBA.mem(GBA.r[13], 4, GBA.r[14]);                     // push LR (R14)
    GBA.trace += "R14,";
  }
  for(var i = 7; i >= 0; i--){                            // for each register "i" (descending order)
    if(GBA.bit(p[0], i)){                                 // if Rlist.i (bit i of Rlist) == 1
      GBA.r[13] -= 4;                                     // decrement R13
      GBA.mem(GBA.r[13], 4, GBA.r[i]);                    // store Ri at address R13 (SP)
      GBA.trace += "R" + i + ",";
    }
  }
  GBA.trace = GBA.trace.substr(0, GBA.trace.length-1) + "}";
  GBA.r[15] += 2;
}

GBA.thumb_pop = function(p){ // optimizable
  GBA.trace += "POP {";
  for(var i = 0; i < 8; i++){                             // for each register "i" (ascending order)
    if(GBA.bit(p[0], i)){                                 // if Rlist.i (bit i of Rlist) == 1
      GBA.r[i] = GBA.mem(GBA.r[13], 4);                       // load Ri from address R13 (SP)
      GBA.r[13] += 4;                                     // increment R13
      GBA.trace += "R" + i + ",";
    }
  }
  if(p[1] === 1){                                         // if PC == 1
    GBA.mem(GBA.r[13], 4, GBA.r[14]);                     // pop PC (R15)
    GBA.r[13] += 4;                                       // increment R13
    GBA.trace += "R15,";
  }
  GBA.trace = GBA.trace.substr(0, GBA.trace.length-1) + "}";
  GBA.r[15] += 2;
}

// THUMB 15

GBA.thumb_stmia = function(p){
  GBA.trace += "STMIA r" + p[0] + "!,{";
  for(var i = 0; i < 8; i++){                             // i = 0..7
    if(GBA.bit(p[1], i) === 1){                           // if Rlist.i === 1
      GBA.trace += "R" + i + ",";
      GBA.mem(GBA.r[p[0]], 4, GBA.r[i]);                  // store Ri at address Rb
      GBA.r[p[0]] += 4;                                   // increment Rb by 1 word
    }
  }
  GBA.trace = GBA.trace.substr(0, GBA.trace.length - 1) + "}";
  GBA.r[15] += 2;
}

GBA.thumb_ldmia = function(p){
  GBA.trace += "LDMIA r" + p[0] + "!,{";
  for(var i = 0; i < 8; i++){                             // i = 0..7
    if(GBA.bit(p[1], i) === 1){                           // if Rlist.i === 1
      GBA.trace += "R" + i + ",";
      GBA.r[i] = GBA.mem(GBA.r[p[0]], 4);                 // load Ri from address Rb
      GBA.r[p[0]] += 4;                                   // increment Rb by 1 word
    }
  }
  GBA.trace = GBA.trace.substr(0, GBA.trace.length - 1) + "}";
  GBA.r[15] += 2;
}

// THUMB 16

GBA.thumb_beq = function(p){
  GBA.trace += "BEQ #0x" + p[0].toString(16);
  if((GBA.cpsr & 0x40000000) === 0x40000000){             // if CPSR.Z === 1:
    GBA.r[15] = p[0];                                     // PC = address
  }
  else{
    GBA.trace += ";false";
    GBA.r[15] += 2;
  }
}

GBA.thumb_bne = function(p){
  GBA.trace += "BNE #0x" + p[0].toString(16);
  if((GBA.cpsr & 0x40000000) === 0x00000000){             // if CPSR.Z === 0:
    if(p[0] < GBA.r[15] && p[0] > GBA.r[15] - 20){        // detect loops
      GBA.loops++;
    }
    GBA.r[15] = p[0];                                     // PC = address
  }
  else{                                                   // detect end of loop
    GBA.trace += ";false";
    if(GBA.loops > 0){
      GBA.loops = -1;
    }
    GBA.r[15] += 2;
  }
}

GBA.thumb_bcs = function(p){
  GBA.trace += "BCS #0x" + p[0].toString(16);
  if((GBA.cpsr & 0x20000000) === 0x20000000){             // if CPSR.C === 1:
    if(p[0] < GBA.r[15] && p[0] > GBA.r[15] - 20){        // detect loops
      GBA.loops++;
    }
    GBA.r[15] = p[0];                                     // PC = address
  }
  else{
    GBA.trace += ";false";
    if(GBA.loops > 0){
      GBA.loops = -1;
    }
    GBA.r[15] += 2;
  }
}

GBA.thumb_bcc = function(p){}

GBA.thumb_bmi = function(p){}

GBA.thumb_bpl = function(p){}

GBA.thumb_bvs = function(p){}

GBA.thumb_bvc = function(p){}

GBA.thumb_bhi = function(p){}

GBA.thumb_bls = function(p){}

GBA.thumb_bge = function(p){}

GBA.thumb_blt = function(p){
  GBA.trace += "BLT #0x" + p[0].toString(16);
  if(GBA.bit(GBA.cpsr, 31) !== GBA.bit(GBA.cpsr, 28))     // if CPSR.N != CPSR.V:
  {
    if(p[0] < GBA.r[15] && p[0] > GBA.r[15] - 20){        // detect loops
      GBA.loops++;
    }
    GBA.r[15] = p[0];                                     // PC = address
  }
  else{
    GBA.trace += ";false";
    if(GBA.loops > 0){
      GBA.loops = -1;
    }
    GBA.r[15] += 2;
  }
}

GBA.thumb_bgt = function(p){}

GBA.thumb_ble = function(p){
  GBA.trace += "BLE #0x" + p[0].toString(16);
  if(
    (GBA.cpsr & 0x40000000) === 0x40000000                // if CPSR.Z == 1
    ||
    (GBA.bit(GBA.cpsr, 31) !== GBA.bit(GBA.cpsr, 28))     // or CPSR.N != CPSR.V:
  ){
    if(p[0] < GBA.r[15] && p[0] > GBA.r[15] - 20){        // detect loops
      GBA.loops++;
    }
    GBA.r[15] = p[0];                                     // PC = address
  }
  else{
    GBA.trace += ";false";
    if(GBA.loops > 0){
      GBA.loops = -1;
    }
    GBA.r[15] += 2;
  }
}

// THUMB 17

// THUMB 18

GBA.thumb_b = function(p){
  GBA.trace += "B #0x" + p[0].toString(16);
  if(p[0] == GBA.r[15]){
    GBA.stopped = true;
  }
  GBA.r[15] = p[0];                                       // PC = PC + 4 + offset
}

// THUMB 19

GBA.thumb_bl = function(p){
  GBA.trace += "BL #0x" + p[0].toString(16);
  GBA.r[14] = (GBA.r[15] + 4) | 0x1;                      // LR = PC
  GBA.r[15] = p[0];                                       // PC = address
}
