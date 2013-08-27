/** ARM opcodes **/

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

arm_mov_ri = function(p){
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

