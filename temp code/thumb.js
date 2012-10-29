/* Functions specific to THUMB instructions */
function thumb(){

  // Instruction
  instr = mem(r[15], 2);                              // read next THUMB instruction, at the address PC

  /* debug */ t = "000" + instr.toString(16);
  /* debug */ t = t.substr(t.length - 4, t.length);
  /* debug */ trace = r[15].toString(16) + "   " + t + "       ";

  t = bit(instr, 8, 15);                              // isolate
  u = bit(instr, 10, 15);                             // some
  v = bit(instr, 11, 15);                             // bits
  w = bit(instr, 12, 15);                             // of the
  z = bit(instr, 13, 15);                             // instruction

  // THUMB 1/2 instructions
  if(z == 0x0){                                       // if instr == 000X.XXXX.XXXX.XXXX
    opcode = bit(instr, 11, 12);                      // get opcode
    if(opcode == 0x3){                                // if opcode == 11 (THUMB 2)
      thumb2();
    }
    else{                                             // else (THUMB 1)
      thumb1();
    }
  }

  // THUMB 3 instructions
  else if(z == 0x1){                                  // if instr == 001X.XXXX.XXXX.XXXX
    thumb3();
  }

  // THUMB 4 instructions ()
  else if(u == 0x10){                                 // if instr == 0100.00XX.XXXX.XXXX
    thumb4();
  }

  // THUMB 5 instructions ()
  else if(u == 0x11){                                 // if instr == 0100.01XX.XXXX.XXXX
    thumb5();
  }

  // THUMB 6 instructions ()
  else if(v == 0x9){                                  // if instr == 0100.1XXX.XXXX.XXXX
    thumb6();
  }

  // THUMB 7/8 instructions ()
  else if(w == 0x5){                                  // if instr == 0101.XXXX.XXXX.XXXX
    thumb7and8();
  }

  // THUMB 9 instructions ()
  else if(z == 0x3){                                  // if instr == 011X.XXXX.XXXX.XXXX
    thumb9();
  }

  // THUMB 10 instructions ()
  else if(w == 0x8){                                  // if instr == 1000.XXXX.XXXX.XXXX
    thumb10();
  }

  // THUMB 11 instructions ()
  else if(w == 0x9){                                  // if instr == 1001.XXXX.XXXX.XXXX
    thumb11();
  }

  // THUMB 12 instructions ()
  else if(w == 0xA){                                  // if instr == 1010.XXXX.XXXX.XXXX
    thumb12();
  }

  // THUMB 13 instructions ()
  else if(t == 0xB0){                                 // if instr == 1011.0000.XXXX.XXXX
    thumb13();
  }

  // THUMB 17 BKPT instruction ()
  else if(t == 0xBE){                                 // if instr == 1011.1110.XXXX.XXXX
    thumb17bkpt();
  }

  // THUMB 14 instructions ()
  else if(w == 0xB){                                  // if instr == 1011.XXXX.XXXX.XXXX
    thumb14();
  }

  // THUMB 15 instructions ()
  else if(w == 0xC){                                  // if instr == 1100.XXXX.XXXX.XXXX
    thumb15();
  }

  // THUMB 17 SWI instruction ()
  else if(t == 0xDF){                                 // if instr == 1101.1111.XXXX.XXXX
    thumb17swi();
  }

  // THUMB 16 instructions
  else if(w == 0xD){                                  // if instr == 1101.XXXX.XXXX.XXXX
    thumb16();
  }

  // THUMB 18 instructions ()
  else if(v == 0x1C){                                 // if instr == 1110.0XXX.XXXX.XXXX
    thumb18();
  }

  // THUMB 19 instruction
  else if(v == 0x1E){                                 // if instr == 1111.0XXX.XXXX.XXXX
    thumb19();
  }

  /* debug */ trace_r();
  /* debug */ log(trace);

  r[15] += 2;                                         // place PC on next instruction
}

/* MINIFIED */
function thumb(){instr=mem(r[15],2);t="000"+instr.toString(16);t=t.substr(t.length-4,t.length);trace=r[15].toString(16)+"   "+t+"       ";t=bit(instr,8,15);u=bit(instr,10,15);v=bit(instr,11,15);w=bit(instr,12,15);z=bit(instr,13,15);0==z?(opcode=bit(instr,11,12),3==opcode?thumb2():thumb1()):1==z?thumb3():16==u?thumb4():17==u?thumb5():9==v?thumb6():5==w?thumb7and8():3==z?thumb9():8==w?thumb10():9==w?thumb11():10==w?thumb12():176==t?thumb13():190==t?thumb17bkpt():11==w?thumb14():12==w?thumb15():223== t?thumb17swi():13==w?thumb16():28==v?thumb18():30==v&&thumb19();trace_r();log(trace);r[15]+=2}