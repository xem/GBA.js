/** ARM opcodes **/

// ARM3
var arm_bx = function(p){

  // PC = Rn
  r[15] = r[p[0]] - 1;

  // CPSR.t = 1
  cpsr |= 0x20;

  // THUMB mode
  thumb = 1;
  
  // Debug
  if(debug){
    $("flagt").checked = true;
  }
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

  // Debug
  update_r(p[0]);
}

var arm_mov_ri = function(p){

  // Rd = Op2
  r[p[0]] = p[1];

  // Next
  r[15] += 4;

  // Debug
  update_r(p[0]);
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

  // Debug
  update_r(p[0]);
}

