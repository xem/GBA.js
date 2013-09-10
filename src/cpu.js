/** CPU **/

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
  }
  else{
    cpsr &= 0x7FFFFFFF;
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
  }
  else{
    cpsr &= 0xBFFFFFFF;
  }
}

/*
 * update_cpsr_c
 * set the CPSR flag c according to the value of a register
 * @param rd: register to test
 */
var update_cpsr_c = function(rd){
  
  // If Rd is longer than 32 bits
  if(r[rd] > 0xFFFFFFFF){                             
    
    // Set CPSR flag c (bit 29)
    cpsr |= 0x20000000;
   
    // Keep Rd 32-bit long
    r[rd] = b(r[rd], 0, 31);
  }
  else{
    cpsr &= 0xDFFFFFFF;
  }
}

/*
 * update_cpsr_c
 * set the CPSR flag c according to the result of a substraction
 * @params v1, v2: substraction operands (v1 - v2)
 */
var update_cpsr_c_sub = function(v1, v2){
  
  // Reset carry
  var c = false;
  
  // Set carry if operands are equal
  if(v1 === v2){
    c = true;
  }
  
  // Set carry if 2's complement is lower than the substraction result
  else if(v2 < v1){
    c = (v1 - v2) < (v1 + (Math.pow(2, v1.toString(2).length) - 1 - v2));
  }
  else if(v1 > v2){
    c = (v2 - v1) > (v2 + (Math.pow(2, v2.toString(2).length) - 1 - v1));
  }
  
  // Set CPSR flag c (bit 29)
  if(c){
    cpsr |= 0x20000000;
  }
  else{
    cpsr &= 0xDFFFFFFF;
  }
}

/*
 * update_cpsr_v
 * set the CPSR flag v according to the value of a register
 * @param rd: the register to test
 */
update_cpsr_v = function(rd){

}

