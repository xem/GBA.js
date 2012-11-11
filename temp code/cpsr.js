/**
* This function sets the N flag of CPSR to 1 if the specified register is negative (if bit 31 is set), 0 otherwise
*/
function update_cpsr_n(rd){
  if(!!bit(r[rd],31)){                                // if Rd.31 (bit 31 of Rd - sign bit) == 1
    cpsr |= 0x80000000;                               // CPSR.31 (bit 31 of CPSR - negative flag) = 1
  }
  else{                                               // else
    cpsr &= 0x7FFFFFFF;                               // CPSR.31 = 0
  }
}

/**
* This function sets the Z flag of CPSR to 1 if the specified register is equal to zero, 0 otherwise
*/
function update_cpsr_z(rd){
  if(r[rd] == 0){                                     // if Rd == 0 
    cpsr |= 0x40000000;                               // CPSR.30 (bit 30 of CPSR - Zero flag) = 1
  }
  else{                                               // else
    cpsr &= 0xBFFFFFFF;                               // CPSR.30 = 0
  }
}

/**
* This function sets the C flag of CPSR to 1 if the specified register provokes a carry, 0 otherwise
* It also limits this register's value to 32 bits
*/
function update_cpsr_c(rd){
  if(r[rd] > 0xFFFFFFFF){                             // if Rd > 32 bits
    cpsr |= 0x20000000;                               // CPSR.29 (bit 29 of CPSR - carry flag) = 1
    r[rd] = bit(r[rd], 0, 31);                        // keep Rd 32-bit long
  }
  else{                                               // else
    cpsr &= 0xDFFFFFFF;                               // CPSR.29 = 0
  }
}

/**
* This function sets the C flag of CPSR to 1 if the specified values provoke a carry when substracted, 0 otherwise
*/
function update_cpsr_c_sub(v1, v2){
  if                                                  // if the binary substraction v1 - v2 (by adding to v1 the 2's complement of v2 based on v1's length) produces a carry (ie. > (v1 - v2))
  (
    (v1 - v2) < (v1 + (Math.pow(2, v1.toString(2).length) - 1 - v2))
  ){
    cpsr |= 0x20000000;                               // CPSR.29 (bit 29 of CPSR - carry flag) = 1
  }
  else{                                               // else
    cpsr &= 0xDFFFFFFF;                               // CPSR.29 = 0
  }
}

/**
* This function sets the v flag of CPSR to 1 if the specified register overflows, 0 otherwise
*/
function update_cpsr_v(rd){

}

/* MINIFIED */
function update_cpsr_n(a){cpsr=bit(r[a],31)?cpsr|2147483648:cpsr&2147483647}
function update_cpsr_z(a){cpsr=0==r[a]?cpsr|1073741824:cpsr&3221225471}
function update_cpsr_c(a){4294967295<r[a]?(cpsr|=536870912,r[a]=bit(r[a],0,31)):cpsr&=3758096383}
function update_cpsr_c_sub(a,b){cpsr=a-b<a+(Math.pow(2,a.toString(2).length)-1-b)?cpsr|536870912:cpsr&3758096383}
function update_cpsr_v(){}