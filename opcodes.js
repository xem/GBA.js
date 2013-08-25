/** Opcodes **/
// ARM3
arm_bx = function(p){
  // trace += "BX r" + p[0];
  // r[15] = r[p[0]] - 1;                            // PC = Rn
  // cpsr |= 0x20;                                       // CPSR.t = 1
  // thumb = 1;                                          // THUMB mode
}

arm_blx = function(p){
  // trace += "BLX";
}

//ARM4
arm_b = function(p){
  // trace += "B 0x" + p[0].toString(16);
  // r[15] = p[0];                                       // PC = label
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
}

arm_mov = function(p){
  // trace += "MOV r" + p[0] + ",#0x" + p[1].toString(16);
  // r[p[0]] = p[1];
  // r[15] += 4;
}

// ARM6
arm_msr_cpsr = function(p){
  // trace += "MSR cpsr_" + (p[1] ? "f" : "") + (p[2] ? "c" : "") + ",r" + p[0];
  // cpsr = r[p[0]] & p[3];                          // CPSR[field] = Op
  // r[15] += 4;
}

arm_msr_spsr = function(p){

}

// ARM7
arm7 = function(){}

// ARM9
arm_str_rrn = function(p){
  // trace += "STR r" + p[0] + ",[r" + p[1] + ",#0x" + p[2].toString(16) + "]";
  // mem(r[p[1]] + p[2], 4, r[p[0]]);            // [Rn +/- offset] = Rd
  // r[15] += 4;
}

arm_ldr_rrn = function(p){
  // trace += "LDR r" + p[0] + ",=#0x" + mem(r[p[1]] + ((p[1] == 15) ? 8 : 0) + p[2], 4).toString(16);
  // r[p[0]] =
  // mem(r[p[1]] + ((p[1] == 15) ? 8 : 0) + p[2], 4);// Rd = [Rn +/- offset]
  // r[15] += 4;
}

arm_str_ri = function(p){
}

arm_ldr_ri = function(p){
}

// THUMB 1
/*
thumb_lsl_rrn = function(p){
  // trace += "LSL r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
  // r[p[0]] = lshift(r[p[1]], p[2]);
  // if(p[2] !== 0){                                         // if not LSL #0
    // update_cpsr_c(p[0]);                              // update C flag
  // }
  // if(r[p[0]] < 0){                                    // stay positive when bit 31 is set
    // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
  // }
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_lsr = function(p){
  // trace += "LSR r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
  // r[p[0]] = rshift(r[p[1]], p[2]);
  // update_cpsr_c(p[0]);                                // update C flag
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_asr = function(p){
  // trace += "ASR r" + p[0] + ",r" + p[1] + ",#0x" + p[2].toString(16);
  // r[p[0]] = r[p[1]] >> p[2];                      // Rd = Rs >> nn
  // update_cpsr_c(p[0]);                                // update C flag
  // if(r[p[0]] < 0){                                    // stay positive when bit 31 is set
    // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
  // }
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

// THUMB 2

thumb_add_rrr = function(p){
  // trace += "ADD r" + p[0] + ",r" + p[1] + ",r" + p[2];
  // r[p[0]] = r[p[1]] + r[p[2]];
  // if(r[p[0]] < 0){
    // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
  // }
  // update_cpsr_c(p[0]);                                // update C flag
  // update_cpsr_n(p[0]);                                // update V flag
  // update_cpsr_z(p[0]);                                // update N flag
  // update_cpsr_v(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_sub_rrr = function(p){
  // trace += "SUB r" + p[0] + ",r" + p[1] + ",r" + p[2];
  // r[p[0]] = r[p[1]] - r[p[2]];
  // if(r[p[0]] < 0){                                    // write negarive numbers on 32 bits signed
    // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
  // }
  // update_cpsr_c_sub(r[p[1]], r[p[2]]);        // update C flag (substraction)
  // update_cpsr_v(p[0]);                                // update V flag
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_add_rrn = function(p){
  // trace += "ADD R" + p[0] + ",R" + p[1] + ",#0x" + p[2].toString(16);
  // r[p[0]] = r[p[1]] + p[2];                       // Rd = Rs + nn
  // update_cpsr_c(p[0]);                                // update C flag
  // update_cpsr_n(p[0]);                                // update V flag
  // update_cpsr_z(p[0]);                                // update N flag
  // update_cpsr_v(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_sub_rrn = function(p){
  // trace += "SUB R" + p[0] + ",R" + p[1] + ",#0x" + p[2].toString(16);
  // r[p[0]] = r[p[1]] - p[2];                       // Rd = Rs - nn
  // if(r[p[0]] < 0){                                    // write negarive numbers on 32 bits signed
    // r[p[0]] = 0xFFFFFFFF + r[p[0]] + 1;
  // }
  // update_cpsr_c_sub(r[p[1]], p[2]);               // update C flag (substraction)
  // update_cpsr_v(p[0]);                                // update V flag
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb2_mov_rr = function(p){
  // trace += "MOV r" + p[0] + ",r" + p[1];
  // r[p[0]] = r[p[1]];                              // Rd = Rs
  // r[15] += 2;
  // update_cpsr_c(p[0]);
  // update_cpsr_n(p[0]);
  // update_cpsr_z(p[0]);
  // update_cpsr_v(p[0]);
}

// THUMB 3

thumb_mov_rn = function(p){
  // trace += "MOV r" + p[0] + ",#0x" + p[1].toString(16);
  // r[p[0]] = p[1];                                     // Rd = nn
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_cmp_rn = function(p){
  // trace += "CMP R" + p[0] + ",#0x" + p[1].toString(16);
  // r[16] = r[p[0]] - p[1];                         // void (R16) = Rd - nn
  // update_cpsr_c_sub(r[p[0]], p[1]);               // update C flag (substraction)
  // update_cpsr_v(16);                                  // update V flag
  // update_cpsr_n(16);                                  // update N flag
  // update_cpsr_z(16);                                  // update Z flag
  // r[15] += 2;
}

thumb_add_rn = function(p){
  // trace += "ADD r" + p[0] + ",#0x" + p[1].toString(16);
  // r[p[0]] += p[1];
  // update_cpsr_c(p[0]);                                // update C flag
  // update_cpsr_v(p[0]);                                // update V flag
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_sub_rn = function(p){
  // trace += "SUB r" + p[0] + ",#0x" + p[1].toString(16);
  // r[p[0]] -= p[1];
  // update_cpsr_c_sub(r[p[0]], p[1]);               // update C flag (substraction)
  // update_cpsr_v(p[0]);                                // update V flag
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

// THUMB 4

thumb_neg_rr = function(p){
  // trace += "NEG r" + p[0] + ",r" + p[1];
  // r[p[0]] = 0xFFFFFFFF - r[p[1]] + 1;             // Rd = - Rs
  // update_cpsr_c(p[0]);                                // update C flag
  // update_cpsr_v(p[0]);                                // update V flag
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_cmp_rr = function(p){
  // trace += "CMP r" + p[0] + ",r" + p[1];
  // r[16] = r[p[0]] - r[p[1]];                  // void = Rd - Rs
  // update_cpsr_c_sub(r[p[0]], r[p[1]]);        // update C flag (substraction)
  // update_cpsr_v(16);                                  // update V flag
  // update_cpsr_n(16);                                  // update N flag
  // update_cpsr_z(16);                                  // update Z flag
  // r[15] += 2;
}

thumb_orr = function(p){
  // trace += "ORR r" + p[0] + ",r" + p[1];
  // r[p[0]] |= r[p[1]];                             // Rd = Rd OR Rs
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_mul = function(p){
  // trace += "MUL r" + p[0] + ",r" + p[1];
  // r[p[0]] *= r[p[1]];                             // Rd = Rd OR Rs
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

thumb_bic = function(p){
  // trace += "BIC r" + p[0] + ",r" + p[1];
  // r[p[0]] = r[p[0]] & (0xFFFFFFFF - r[p[1]]); // Rd = Rd AND NOT Rs
  // update_cpsr_n(p[0]);                                // update N flag
  // update_cpsr_z(p[0]);                                // update Z flag
  // r[15] += 2;
}

// THUMB 5

thumb_add_rr = function(p){
  // trace += "ADD r" + p[0] + ",r" + p[1];
  // r[p[0]] += r[p[1]];                             // Rd = Rd + Rs
  // r[15] += 2;
}

thumb5_mov_rr = function(p){
  // trace += "MOV r" + p[0] + ",r" + p[1];
  // r[p[0]] = r[p[1]];                              // Rd = Rs
  // r[15] += 2;
}

thumb_nop = function(){
  // trace += "NOP";
  // r[15] += 2;
}

thumb_bx = function(p){
  // trace += "BX r" + p[0];
  // r[15] = r[p[0]] - 1;                            // PC = Rd
}

// THUMB 6

thumb_ldr_rn = function(p){
  // trace += "LDR r" + p[0] + ",=#0x" + p[1].toString(16);
  // r[p[0]] = p[1];                                     // Rd = WORD[SP + nn]
  // r[15] += 2;
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
  // trace += "STRH R" + p[0] + ",[R" + p[1] + ",R" + p[2] + "]";
  // mem(r[p[1]] + r[p[2]], 2, r[p[0]]);     // HALFWORD[Rb+Ro] = Rd
  // r[15] += 2;
}

// THUMB 9

thumb_str_rrn = function(p){
  // trace += "STR R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2]) : "") + "]";
  // mem(r[p[1]] + p[2], 4, r[p[0]]);
  // r[15] += 2;
}

thumb_ldr_rrn = function(p){
  // trace += "LDR R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2]) : "") + "]";
  // r[p[0]] = mem(r[p[1]] + p[2], 4);
  // r[15] += 2;
}

thumb_strb_rrn = function(p){
}

thumb_ldrb_rrn = function(p){
}

// THUMB 10

thumb_strh_rrn = function(p){
  // trace += "STRH R" + p[0] + ",[R" + p[1] + (p[2] ? (",#0x" + p[2].toString(16)) : "") + "]";
  // mem(r[p[1]] + p[2], 2, r[p[0]]);            // HALFWORD[Rb+nn] = Rd
  // r[15] += 2;
}

thumb_ldrh_rrn = function(p){
}

// THUMB 11

thumb_str_spn = function(p){
  // trace += "STR R" + p[0] + ",[SP" + (p[1] ? (",#0x" + p[1].toString(16)) : "") + "]";
  // mem(r[13] + p[1], 4, r[p[0]]);              // WORD[SP+nn] = Rd
  // r[15] += 2;
}

thumb_ldr_spn = function(p){
  // trace += "LDR R" + p[0] + ",[SP" + (p[1] ? (",#0x" + p[1].toString(16)) : "") + "]";
  // r[p[0]] = mem(r[13] + p[1], 4);             // Rd = WORD[SP+nn]
  // r[15] += 2;
}

// THUMB 12

// THUMB 13

thumb_add_spn = function(p){
  // trace += "ADD SP,#" + p[0].toString(16);
  // r[13] += p[0];                                      // SP = SP +/- nn
  // r[15] += 2;
}

// THUMB 14

thumb_push = function(p){ // optimizable
  // trace += "PUSH {";
  // if(p[1] === 1){                                         // if LR == 1
    // r[13] -= 4;                                       // decrement R13
    // mem(r[13], 4, r[14]);                     // push LR (R14)
    // trace += "R14,";
  // }
  // for(var i = 7; i >= 0; i--){                            // for each register "i" (descending order)
    // if(bit(p[0], i)){                                 // if Rlist.i (bit i of Rlist) == 1
      // r[13] -= 4;                                     // decrement R13
      // mem(r[13], 4, r[i]);                    // store Ri at address R13 (SP)
      // trace += "R" + i + ",";
    // }
  // }
  // trace = trace.substr(0, trace.length-1) + "}";
  // r[15] += 2;
}

thumb_pop = function(p){ // optimizable
  // trace += "POP {";
  // for(var i = 0; i < 8; i++){                             // for each register "i" (ascending order)
    // if(bit(p[0], i)){                                 // if Rlist.i (bit i of Rlist) == 1
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

thumb_stmia = function(p){
  // trace += "STMIA r" + p[0] + "!,{";
  // for(var i = 0; i < 8; i++){                             // i = 0..7
    // if(bit(p[1], i) === 1){                               // if Rlist.i === 1
      // trace += "R" + i + ",";
      // mem(r[p[0]], 4, r[i]);                              // store Ri at address Rb
      // r[p[0]] += 4;                                       // increment Rb by 1 word
    // }
  // }
  // trace = trace.substr(0, trace.length - 1) + "}";
  // r[15] += 2;
}

thumb_ldmia = function(p){
  // trace += "LDMIA r" + p[0] + "!,{";
  // for(var i = 0; i < 8; i++){                             // i = 0..7
    // if(bit(p[1], i) === 1){                               // if Rlist.i === 1
      // trace += "R" + i + ",";
      // r[i] = mem(r[p[0]], 4);                             // load Ri from address Rb
      // r[p[0]] += 4;                                       // increment Rb by 1 word
    // }
  // }
  // trace = trace.substr(0, trace.length - 1) + "}";
  // r[15] += 2;
}

// THUMB 16

thumb_beq = function(p){
  // trace += "BEQ #0x" + p[0].toString(16);
  // if((cpsr & 0x40000000) === 0x40000000){                 // if CPSR.Z === 1:
    // r[15] = p[0];                                         // PC = address
  // }
  // else{
    // trace += ";false";
    // r[15] += 2;
  // }
}

thumb_bne = function(p){
  // trace += "BNE #0x" + p[0].toString(16);
  // if((cpsr & 0x40000000) === 0x00000000){                 // if CPSR.Z === 0:
    // if(p[0] < r[15] && p[0] > r[15] - 20){                // detect loops
      // loops++;
    // }
    // r[15] = p[0];                                         // PC = address
  // }
  // else{                                                   // detect end of loop
    // trace += ";false";
    // if(loops > 0){
      // loops = -1;
    // }
    // r[15] += 2;
  // }
}

thumb_bcs = function(p){
  // trace += "BCS #0x" + p[0].toString(16);
  // if((cpsr & 0x20000000) === 0x20000000){             // if CPSR.C === 1:
    // if(p[0] < r[15] && p[0] > r[15] - 20){            // detect loops
      // loops++;
    // }
    // r[15] = p[0];                                     // PC = address
  // }
  // else{
    // trace += ";false";
    // if(loops > 0){
      // loops = -1;
    // }
    // r[15] += 2;
  // }
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
  // trace += "BLT #0x" + p[0].toString(16);
  // if(bit(cpsr, 31) !== bit(cpsr, 28))                     // if CPSR.N != CPSR.V:
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

thumb_bgt = function(p){}

thumb_ble = function(p){
  // trace += "BLE #0x" + p[0].toString(16);
  // if(
    // (cpsr & 0x40000000) === 0x40000000                    // if CPSR.Z == 1
    // ||
    // (bit(cpsr, 31) !== bit(cpsr, 28))                     // or CPSR.N != CPSR.V:
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

thumb_b = function(p){
  // trace += "B #0x" + p[0].toString(16);
  // if(p[0] == r[15]){
    // stopped = true;
  // }
  // r[15] = p[0];                                           // PC = PC + 4 + offset
}

// THUMB 19

thumb_bl = function(p){
  // trace += "BL #0x" + p[0].toString(16);
  // r[14] = (r[15] + 4) | 0x1;                              // LR = PC
  // r[15] = p[0];                                           // PC = address
}
*/