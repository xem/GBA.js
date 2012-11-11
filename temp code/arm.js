/* Functions specific to ARM instructions */


function arm3(){                                      // No flags affected
  rn = bit(instr, 0, 3);                              // get Rn (bits 0-3)
  if(bit(r[rn], 0) == 1){                             // if Rn.0 (bit 0 of Rn) = 1
    cpsr |= 0x20;                                     // THUMB mode: T (bit 5 of CPSR) = 1
    opcode = bit(instr, 4, 7);                        // get opcode (bits 4-7)
    if(opcode == 0x3){                                // if opcode == 3 : BLX (branch with link and exchange - call a subroutine in THUMB mode, specifying a return address)
      r[14] = r[15] + 4;                              // link (LR = PC + 4)
      /* debug */ trace += "BLX" + condname + " r" + rn;
    }
    else if(opcode == 0x1){                           // if opcode == 1 : BX (branch and exchange - jump to a subroutine in THUMB mode)
      /* debug */ trace += "BX" + condname + " r" + rn;
    }
    r[15] = r[rn] - 1;                                // branch
  }
  trace_r();
  log(trace);
}

function arm4(){                                      // No flags affected
  nn = bit(instr, 0, 23);                             // get nn (bits 0-23)
  opcode = !!bit(instr, 24);                          // get opcode (bit 24) as boolean
  if(opcode){                                         // if opcode == 1: BL (Branch with link - call a subroutine, specifying a return address)
    /* debug */ trace += "BL" + condname + " #0x" + nn.toString(16);
    r[14] = r[15] + 4;                                // link (LR = PC + 4)
  }
  else{                                               // if opcode == 0: B (Branch - jump to a subroutine)
    /* debug */ trace += "B" + condname + " #0x" + (r[15] + 8 + nn * 4).toString(16);
  }
  r[15] = r[15] + 8 + nn * 4;                         // branch
  trace_r();
  log(trace);
}