/* Functions common to ARM and THUMB instructions */

/** 
* This function tells if the current condition is respected, according to its value and CPSR flags.
* Works with ARM and THUMB instructions
* @global cond: the current condition (0x0 to 0xE) - read
* @global condname: the current condition's "name" - written
* @return boolean (condition respected or not)
*/
function check_cond(){

  // CPSR flags
  cpsr_v = bit(cpsr, 28);                             // CPSR flag V (bit 28)
  cpsr_c = bit(cpsr, 29);                             // CPSR flag C (bit 29)
  cpsr_z = bit(cpsr, 30);                             // CPSR flag Z (bit 30)
  cpsr_n = bit(cpsr, 31);                             // CPSR flag N (bit 31)

  // Condition names
  /* debug */ condname = '';
  /* debug */ if(cond == 0x0) condname = 'EQ';
  /* debug */ if(cond == 0x1) condname = 'NE';
  /* debug */ if(cond == 0x2) condname = 'CS';
  /* debug */ if(cond == 0x3) condname = 'CC';
  /* debug */ if(cond == 0x4) condname = 'MI';
  /* debug */ if(cond == 0x5) condname = 'PL';
  /* debug */ if(cond == 0x6) condname = 'VS';
  /* debug */ if(cond == 0x7) condname = 'VC';
  /* debug */ if(cond == 0x8) condname = 'HI';
  /* debug */ if(cond == 0x9) condname = 'LS';
  /* debug */ if(cond == 0xA) condname = 'GE';
  /* debug */ if(cond == 0xB) condname = 'LT';
  /* debug */ if(cond == 0xC) condname = 'GT';
  /* debug */ if(cond == 0xD) condname = 'LE';

  // Condition check
  if(
    (cond == 0xE)                                     // condition AL (only used on ARM instructions)
    ||(cond == 0x0 && cpsr_z == 1)                    // condition EQ
    ||(cond == 0x1 && cpsr_z == 0)                    // condition NE
    ||(cond == 0x2 && cpsr_c == 1)                    // condition CS
    ||(cond == 0x3 && cpsr_c == 0)                    // condition CC
    ||(cond == 0x4 && cpsr_n == 1)                    // condition MI
    ||(cond == 0x5 && cpsr_n == 0)                    // condition PL
    ||(cond == 0x6 && cpsr_v == 1)                    // condition VS
    ||(cond == 0x7 && cpsr_v == 0)                    // condition VC
    ||(cond == 0x8 && cpsr_c == 1 && cpsr_z == 0)     // condition HI
    ||(cond == 0x9 && (cpsr_c == 0 || cpsr_z == 1))   // condition LS
    ||(cond == 0xA && cpsr_n == cpsr_v)               // condition GE
    ||(cond == 0xB && cpsr_n != cpsr_v)               // condition LT
    ||(cond == 0xC && cpsr_z==0 && cpsr_n==cpsr_v)    // condition GT
    ||(cond == 0xD && (cpsr_z==1 || cpsr_n!=cpsr_v))  // condition LE
  ){
    return true;                                      // condition respected
  }
  else{
    return false;                                     // condition not respected
  }
}


/* MINIFIED */
function check_cond(){cpsr_v=bit(cpsr,28);cpsr_c=bit(cpsr,29);cpsr_z=bit(cpsr,30);cpsr_n=bit(cpsr,31);condname="";0==cond&&(condname="EQ");1==cond&&(condname="NE");2==cond&&(condname="CS");3==cond&&(condname="CC");4==cond&&(condname="MI");5==cond&&(condname="PL");6==cond&&(condname="VS");7==cond&&(condname="VC");8==cond&&(condname="HI");9==cond&&(condname="LS");10==cond&&(condname="GE");11==cond&&(condname="LT");12==cond&&(condname="GT");13==cond&&(condname="LE");return 14==cond||0==cond&&1==cpsr_z|| 1==cond&&0==cpsr_z||2==cond&&1==cpsr_c||3==cond&&0==cpsr_c||4==cond&&1==cpsr_n||5==cond&&0==cpsr_n||6==cond&&1==cpsr_v||7==cond&&0==cpsr_v||8==cond&&1==cpsr_c&&0==cpsr_z||9==cond&&(0==cpsr_c||1==cpsr_z)||10==cond&&cpsr_n==cpsr_v||11==cond&&cpsr_n!=cpsr_v||12==cond&&0==cpsr_z&&cpsr_n==cpsr_v||13==cond&&(1==cpsr_z||cpsr_n!=cpsr_v)?!0:!1}