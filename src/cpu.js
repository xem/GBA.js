/** CPU **/

/*
 * r
 * The GBA's CPU has 16 registers (unsigned, 32 bits)
 * r0-r12: general purpose
 * r13: stack pointer (SP). Initial value: 0x3007F00
 * r14: link register (LR)
 * r15: program counter (PC). Initial value: 0x8000000
 * r16: used here to store the result of void operations
 */
var r = new Uint32Array(new ArrayBuffer(4 * 17));
r[13] = 0x3007F00;
r[15] = 0x8000000;

/*
 * cpsr
 * Current program status register
 */
var cpsr = new Uint32Array(new ArrayBuffer(4));

/*
 * spsr
 * Stored program status register
 */
var spsr = new Uint32Array(new ArrayBuffer(4));

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
    cpsr[0] |= 0x80000000;
    //cpsr = ((cpsr * 8) | 0x80000000) / 8;

    // Update checkbox
    if(debug){
      $("flagn").checked = true;
    }
  }
  else{

    // Unset CPSR flag n
    cpsr[0] &= 0x7FFFFFFF;

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
    cpsr[0] |= 0x40000000;

    // Update checkbox
    if(debug){
      $("flagz").checked = true;
    }
  }
  else{

    // Unset CPSR flag z
    cpsr[0] &= 0xBFFFFFFF;

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
 * @param sub (optional): to set if the instruction is a substraction (or a comparison)
 */
var update_cpsr_c = function(rd, val, sub){

  // If the value is different from the register
  if((sub && val > 0 && val != r[rd]) || (sub && !val && !r[rd]) || (!sub && val != r[rd])){

    // Set CPSR flag c (bit 29)
    cpsr[0] |= 0x20000000;

    // Update checkbox
    if(debug){
      $("flagc").checked = true;
    }
  }
  else{

    // Unset CPSR flag z
    cpsr[0] &= 0xDFFFFFFF;

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
var update_cpsr_v = function(rd){

}

