/******
  ARM
*******/

// ARM3
GBA.arm_bx = function(p){
  GBA.trace += "BX r" + p[0];
  GBA.r[15] = GBA.r[p[0]] - 1;                            // PC = Rn
  GBA.cpsr |= 0x20;                                       // CPSR.t = 1
  GBA.thumb = 1;                                          // THUMB mode
}

GBA.arm_blx = function(p){
  GBA.trace += "BLX";
}

//ARM4
GBA.arm_b = function(p){
  GBA.trace += "B 0x" + p[0].toString(16);
  GBA.r[15] = p[0];                                       // PC = label
}

GBA.arm_bl = function(p){
  GBA.trace += "BL";
}

// ARM5
GBA.arm_add = function(p){
  GBA.trace += "ADD r" + p[0] + ",=0x" + (GBA.r[p[1]] + (p[1] === 15 ? 8 : 0) + p[2]).toString(16);
  GBA.r[p[0]] = GBA.r[p[1]] + (p[1] === 15 ? 8 : 0) + p[2];// Rd = Rn + Op2
  GBA.r[15] += 4;
}

GBA.arm_mov = function(p){
  GBA.trace += "MOV r" + p[0] + ",#0x" + p[1].toString(16);
  GBA.r[p[0]] = p[1];
  GBA.r[15] += 4;
}

// ARM6
GBA.arm_msr_cpsr = function(p){
  GBA.trace += "MSR cpsr_" + (p[1] ? "f" : "") + (p[2] ? "c" : "") + ",r" + p[0];
  GBA.cpsr = GBA.r[p[0]] & p[3];                          // CPSR[field] = Op
  GBA.r[15] += 4;
}

GBA.arm_msr_spsr = function(p){
  
}

// ARM7
GBA.arm7 = function(){}

// ARM9
GBA.arm_str = function(p){
  GBA.trace += "STR r" + p[0] + ",[r" + p[1] + ",#0x" + p[2].toString(16) + "]";
  GBA.mem(GBA.r[p[1]] + p[2], 4, GBA.r[p[0]]);            // [Rn +/- offset] = Rd
  GBA.r[15] += 4;
}

GBA.arm_ldr = function(p){
  GBA.trace += "LDR r" + p[0] + ",=#0x" + GBA.mem(GBA.r[p[1]] + ((p[1] == 15) ? 8 : 0) + p[2], 4).toString(16);
  GBA.r[p[0]] = 
  GBA.mem(GBA.r[p[1]] + ((p[1] == 15) ? 8 : 0) + p[2], 4);// Rd = [Rn +/- offset]
  GBA.r[15] += 4;
}
