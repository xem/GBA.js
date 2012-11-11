/**
* GBA.js - GameBoy Advance emulator in JavaScript
* @author Maxime Euziere
* @param file: the file name/path of the GBA game ROM to play.
* @param canvas: the HTML canvas element to use as a GBA screen (240 * 160 px).
* @param progressbar (optional): the <progress> element showing the ROM loading status.
* @param debug (optional): the element showing the debug information.
**/
function gba(file, canvas, progressbar, debug){

  /* IE */
  var ie=navigator.appVersion.match(/MSIE ([\d.]+)/);ie=ie?ie[1]:99;
  if(ie<9){alert("Update your browser!");return;}

  /* Initializations (see "init.js") */
  var i,x,y,t,u,v,w,z,interval,ii,trace,instructions=0,xhr=new XMLHttpRequest,r=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cpsr=16,cpsr_c,cpsr_n,cpsr_z,cpsr_v,cpsr_t,r_irq=[],cpsr_irq,r_fiq=[],cpsr_fiq,r_svc=[],cpsr_svc,r_abt=[],cpsr_abt,r_und=[],cpsr_und,m={2:[],3:[],4:[],5:[],6:[],7:[],8:[],14:[]},instr,cond,condname,opcode,mask,rn,rd,rs,rm,ro,nn,imm,sr,s,is,st,op,op2,cy,msbd,msbs,pclr,gameover;r[13]=50364160;r[15]=134217728;mem(67109E3,2,512);mem(67110914,2,3328);

  /* Load the game ROM in memory (see "load.js") */
  xhr.addEventListener("progress",function(a){progressbar&&(progressbar.value=a.loaded/a.total)});xhr.open("GET",file);xhr.responseType="arraybuffer";xhr.onload=function(){m[8]=(ie&&ie<10)?VBArray(xhr.responseBody).toArray():new Uint8Array(xhr.response);progressbar.style.visibility="hidden";play()};xhr.send();progressbar&&(progressbar.style.visibility="visible");

  /* Debug */
  var displaydebug = true;
  function log(s){if(debug&&displaydebug)debug.innerHTML += "<br>" + s}
  function trace_r(){while(trace.length<54)trace+=" ";trace+=";NZCV:";for(i=31;i>27;i--)trace+=bit(cpsr,i);for(i=0;i<15;i++)if(i<8||i>12)trace+=" R"+i+":"+("0000000"+(r[i]||0).toString(16)).substr(("0000000"+(r[i]||0).toString(16)).length-8,("0000000"+(r[i]||0).toString(16)).length)}

  /* CPSR operations (see "cpsr.js") */
  function update_cpsr_n(a){cpsr=bit(r[a],31)?cpsr|2147483648:cpsr&2147483647}
  function update_cpsr_z(a){cpsr=0==r[a]?cpsr|1073741824:cpsr&3221225471}
  function update_cpsr_c(a){4294967295<r[a]?(cpsr|=536870912,r[a]=bit(r[a],0,31)):cpsr&=3758096383}
  function update_cpsr_c_sub(a,b){cpsr=a-b<a+(Math.pow(2,a.toString(2).length)-1-b)?cpsr|536870912:cpsr&3758096383}
  function update_cpsr_v(){}

  /* Binary operations (see "binary.js") */
  function lshift(b,a){return b*Math.pow(2,a)}
  function rshift(b,a){return Math.floor(b/Math.pow(2,a))}
  function bit(b,a,c){return rshift(b,a)&Math.pow(2,(c||a)-a+1)-1}
  function ror(b,c,a){return lshift(b&Math.pow(2,a)-1,c-a)+rshift(b,a)}

  /* Memory accessor (see "mem.js") */
  function mem(address, bytes, value, mask){
    var prefix = rshift(address, 24);
    mask = mask || 0xFFFFFFFF;

    switch(prefix){
      case 0x2:
        address = (address - 0x2000000) % 0x40000;
        break;

      case 0x3:
        address = (address - 0x3000000) % 0x8000;
        break;

      case 0x4:
        address = (address - 0x4000000) % 0x10000;
        if(value){
          io(address, value);
        }
        break;

      case 0x5:
        address = (address - 0x5000000) % 0x400;
        break;

      case 0x6:
        if(value) console.log(instructions + ": [" + address.toString(16) + "] = " + value.toString(16));
        address = (address - 0x6000000) % 0x20000;
        if(address > 0x17FFF && address < 0x20000)
          address -= 8000;
        break;

      case 0x7:
        address = (address - 0x7000000) % 0x400;
        break;

      case 0x8:
      case 0x9:
      case 0xA:
      case 0xB:
      case 0xC:
      case 0xD:
        prefix = 0x08;
        address = (address - 0x8000000) % 0x2000000;
        break;

      case 0xE:
      case 0xF:
        prefix = 0xE;
        address = (address - 0xE000000) % 0x1000000;
        break;
    }
    if(value)
      for(i = 0; i < bytes; i++, value = rshift(value, 8), mask = rshift(mask, 8))
      {
        m[prefix][address + i] = ((m[prefix][address + i] || 0) & (0xFF - (mask & 0xFF))) + (value & (mask & 0xFF));
      }
    else{
      for(value = 0, i = bytes; i; i--)
      {
        value = (value * 0x100) + (m[prefix][address + i - 1] || 0);
      }
      return value;
    }
  }

  /* I/O registers update */
  function io(address, value){
    switch(address){
      case 0x0:
        dispcnt_k = !!bit(value, 0xA);                  // use BG2
        dispcnt_m = bit(value, 0, 2);                   // video mode
        break;
    }
  }

  /* VRAM update */
  function vram(address, value){

  }

  /* Cross-browser requestAnimationFrame (see "rAF.js") */
  for(t=0,v=["ms","moz","webkit","o"],i=0;i<v.length&&!window.requestAnimationFrame;++i)window.requestAnimationFrame=window[v[i]+"RequestAnimationFrame"],window.a=window[v[i]+"CancelAnimationFrame"]||window[v[i]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(g){var d=(new Date).getTime(),e=Math.max(0,16-(d-t)),h=window.setTimeout(function(){g(d+e)},e);t=d+e;return h});

  /* ARM & THUMB operations (see "arm_thumb.js") */
  function check_cond(){cpsr_v=bit(cpsr,28);cpsr_c=bit(cpsr,29);cpsr_z=bit(cpsr,30);cpsr_n=bit(cpsr,31);condname="";0==cond&&(condname="EQ");1==cond&&(condname="NE");2==cond&&(condname="CS");3==cond&&(condname="CC");4==cond&&(condname="MI");5==cond&&(condname="PL");6==cond&&(condname="VS");7==cond&&(condname="VC");8==cond&&(condname="HI");9==cond&&(condname="LS");10==cond&&(condname="GE");11==cond&&(condname="LT");12==cond&&(condname="GT");13==cond&&(condname="LE");return 14==cond||0==cond&&1==cpsr_z|| 1==cond&&0==cpsr_z||2==cond&&1==cpsr_c||3==cond&&0==cpsr_c||4==cond&&1==cpsr_n||5==cond&&0==cpsr_n||6==cond&&1==cpsr_v||7==cond&&0==cpsr_v||8==cond&&1==cpsr_c&&0==cpsr_z||9==cond&&(0==cpsr_c||1==cpsr_z)||10==cond&&cpsr_n==cpsr_v||11==cond&&cpsr_n!=cpsr_v||12==cond&&0==cpsr_z&&cpsr_n==cpsr_v||13==cond&&(1==cpsr_z||cpsr_n!=cpsr_v)?!0:!1}

  /* ARM instruction execution (see "arm.js") */
  function arm(){

    // Instruction
    instr = mem(r[15], 4);                              // read next ARM instruction, at the address PC

    /* debug */ t = "0000000" + instr.toString(16);
    /* debug */ t = t.substr(t.length - 8, t.length);
    /* debug */ trace += " " + r[15].toString(16) + "  " + t + "    ";

    // Condition
    cond = bit(instr, 28, 31);                          // condition field (bits 28-31)
    if(check_cond()){

      // ARM3 instructions
      if(bit(instr, 8, 27) == 0x012FFF){                // if instr == XXXX.0001.0010.1111.1111.1111.XXXX.XXXX
        arm3();
        return;
      }

      // ARM4 instructions
      else if(bit(instr, 25, 27) == 0x5){               // if instr == XXXX.101X.XXXX.XXXX.XXXX.XXXX.XXXX.XXXX
        arm4();
        return;
      }

      // ARM9 instructions
      else if(bit(instr, 26, 27) == 0x1){               // if instr == XXXX.01XX.XXXX.XXXX.XXXX.XXXX.XXXX.XXXX
        arm9();
      }

      // ARM7 instructions
      else if(bit(instr, 25, 27) == 0x0
              && bit(instr, 7) == 0x0
              && bit(instr, 12, 15) != 0xF){            // if instr == XXXX.000X.XXXX.XXXX.YYYY.XXXX.0XXX.XXXX (YYYY != 1111)
        arm7();
      }

      // ARM5/6 instructions
      else{                                             // else, if instr == XXXX.00XX.XXXX.XXXX.XXXX.XXXX.XXXX.XXXX
        opcode = bit(instr, 21, 24);                    // get opcode (bits 21-24)
        i = !!bit(instr, 25);                           // get I (bit 25) as boolean
        s = !!bit(instr, 20);                           // get S (bit 20) as boolean
        rn = bit(instr, 16, 19);                        // get Rn (bits 16-19)
        rd = bit(instr, 12, 15);                        // get Rd (bits 12-15)

        // ARM6
        if(!s && opcode >= 0x8 && opcode <= 0xB){       // ARM6 instructions (S == 0, opcodes 0x8-0xB)
          arm6();
        }

        // ARM 5
        else{                                           // ARM5 instructions
          arm5();
        }
      }
    }
    else{
      /* debug */ trace += "??? " + condname + " ;false";
    }

    trace_r();

    /* debug */ log(trace);
    r[15] += 4;                                         // place PC on next instruction
  }
  function arm3(){                                      // No flags affected
    rn = bit(instr, 0, 3);                              // get Rn (bits 0-3)
    if(bit(r[rn], 0) == 1){                             // if Rn.0 (bit 0 of Rn) = 1
      cpsr |= 0x20;                                     // THUMB mode: T (bit 5 of CPSR) = 1
      cpsr_t = 1;                                       // Save it in a var.
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
  function arm5(){                                      // No flags affected if S == 0, else: NZC (logical operations), NZCV (arithmetical operations), NZCV (opcodes where unused Rd = 1111, {P}, in user mode) 
    opcode = bit(instr, 21, 24);                        // get opcode (bits 21-24)
    if(i){                                              // if I == 1 (immediate as 2nd operand)
      is = bit(instr, 8, 11) * 2;                       // get Is (bits 8-11, values: 0-30 in steps of 2)
      nn = bit(instr, 0, 7);                            // get nn (bits 0-7)
      op2 = ror(nn, 32, is);                            // Op2 = nn right-rotated with is
    }
    else{                                               // if I == 0 (register as 2nd operand)
    /*
      sr = !!bit(instr, 4);                             // get R (bit 4)
      if(sr){                                           // if R == 1
        rs = bit(instr, 8, 11);                         // get Rs (bits 8-11)
      }
      else{                                             // if R == 0
        is = bit(instr, 7, 11);                         // get Is (bits 7-11)
      }
      st = bit(instr, 5, 6);                            // get Shift Type (bits 5-6)
      rm = bit(instr, 0, 3);                            // get Rm (bits 0-3)
      op2 = r[rn];                                      // Op2 = Rs
    */
    }
    /* todo: CPSR flags */
    switch(opcode){
      case 0x0:                                         // if opcode == AND (logical AND)
        r[rd] = r[rn] & op2;                            // Rd = Rn AND Op2
        break;
      case 0x1:                                         // if opcode == EOR (logical XOR)
        r[rd] = r[rn] ^ op2;                            // Rd = Rn XOR Op2
        break;
      case 0x2:                                         // if opcode == SUB (arithmetic substract)
        r[rd] = r[rn] - op2;                            // Rd = Rn - Op2
        break;
      case 0x3:                                         // if opcode == RSB (arithmetic substract reversed)
        r[rd] = op2 - r[rn];                            // Rd = Op2 - Rn
        break;
      case 0x4:                                         // if opcode == ADD (arithmetic add)
        /* debug */ trace += "ADD" + condname + (s ? "S" : "") + " r" + rd + ",=#0x" + (r[rn] + (rn == 15 ? 8 : 0) + op2).toString(16);
        r[rd] = r[rn] + (rn == 15 ? 8 : 0) + op2;       // Rd = Rn + Op2
        break;
      case 0x5:                                         // if opcode == ADC (arithmetic add with carry)
        r[rd] = r[rn] + op2 + cy;                       // Rd = Rn + Op2 + Cy
        break;
      case 0x6:                                         // if opcode == SBC (arithmetic substract with carry)
        r[rd] = r[rn] - op2 + cy - 1;                   // Rd = Rn - Op2 + Cy - 1
        break;
      case 0x7:                                         // if opcode == RSC (arithmetic substract with carry reversed)
        r[rd] = op2 - r[rn] + cy - 1;                   // Rd = Op2 - Rn + Cy - 1
        break;
      case 0x8:                                         // if opcode == TST (logical AND for test)
        v = r[rn] & op2;                                // Void = Rn AND Op2
        break;
      case 0x9:                                         // if opcode == TEQ (logical XOR for exclusive test)
        v = r[rn] ^ op2;                                // Void = Rn XOR Op2
        break;
      case 0xA:                                         // if opcode == CMP (arithmetic substract for comparison)
        v = r[rn] - op2;                                // Void = Rn-Op2
        break;
      case 0xB:                                         // if opcode == CMN (arithmetic add for negative comparison)
        v = r[rn] + op2;                                // Void = Rn+Op2
        break;
      case 0xC:                                         // if opcode == ORR (logical OR)
        r[rd] = r[rn] | op2;                            // Rd = Rn OR Op2
        break;
      case 0xD:                                         // if opcode == MOV (move)
        /* debug */ trace += "MOV" + condname + (s ? "S" : "") + " r" + rd + ",#0x" + op2.toString(16);
        r[rd] = op2;                                    // Rd = Op2
        if(r[rd] == 0){                                 // if Rd == 0
          cpsr |= 0x40000000;                           // CPSR.30 (bit 30 of CPSR - Zero flag) = 1
        }
        else{                                           // else
          cpsr &= 0xBFFFFFFF;                           // CPSR.30 = 0
        }
        break;
      case 0xE:                                         // if opcode == BIC (bit clear)
        r[rd] =  0; // todo                             // Rd = Rn AND NOT Op2
        break;
      case 0xF:                                         // if opcode == MVN (NOT)
        r[rd] =  0; // todo                             // Rd = NOT Op2
        break;
      default:
        /* debug */ trace += "ARM5";
    }
  }
  function arm6(){                                      // No flags affected
    psr = !!bit(instr, 22);                             // get Psr (bit 22)
    opcode = !!bit(instr, 21);                          // get ARM6 opcode (bit 21)
    if(opcode){                                         // if opcode == MSR
      f = !!bit(instr, 19);                             // get f
      s = !!bit(instr, 18);                             // get s
      x = !!bit(instr, 17);                             // get x
      c = !!bit(instr, 16);                             // get c
      if(i){                                            // if I == 1 (immediate)
        imms = bit(instr, 8, 11);                       // get Imm shift
        imm = bit(instr, 0, 7);                         // get Imm
      }
      else{                                             // if I == 0 (register)
        mask = 0;                                       // new mask
        rm = bit(instr, 0, 3);                          // get Rm (bits 0-3)
        if(f){                                          // if f == 1
          mask += 0xFF000000;                           // allow to write on flags (bits 24-31)
        }
        if(c){                                          // if c == 1
          mask += 0xFF;                                 // allow to write on controls (bits 0-7)
        }
        if(psr){                                        // if psr == 1 (SPSR)
          /* debug */ trace += "MSR" + condname + " spsr_" + (f ? "f" : "") + (c ? "c" : "");
        }
        else{                                           // if psr == 0 (CPSR)
          /* debug */ trace += "MSR" + condname + " cpsr_" + (f ? "f" : "") + (c ? "c" : "");
          /* debug */ trace += ",r" + rm;
          cpsr = (r[rn] & mask);
        }
      }
    }
    else{                                               // if opcode == MRS
      rd = bit(instr, 12, 15);                          // get Rd (bits 1-15)
    }
  }
  function arm7(){                                      // No flags affected if S == 0, else: NZ and C=0 (MUL, MLA), NZ and C=0, V=0 (MULL, MLAL), none for halfword multiplies.
    /* debug */ trace += "ARM7";
  }
  function arm9(){                                      // No flags affected
    i = !!bit(instr, 25);                               // get I (bit 25) as boolean
    p = !!bit(instr, 24);                               // get P (bit 24) as boolean
    u = !!bit(instr, 23);                               // get U (bit 23) as boolean
    b = !!bit(instr, 22);                               // get B (bit 22) as boolean
    l = !!bit(instr, 20);                               // get L (bit 20) as boolean
    rn = bit(instr, 16, 19);                            // get Rn (bits 16-19) as boolean
    rd = bit(instr, 12, 15);                            // get Rd (bits 12-15) as boolean
    t = false;                                          // init T
    w = false;                                          // init W
    is = false;                                         // init Is
    st = false;                                         // init shift type
    rm = false;                                         // init Rm
    nn = false;                                         // init nn
    if(p){                                              // if P == 1 (offset before transfer)
      w = !!bit(instr, 21);                             // get W (bit 21)
    }
    else{                                               // if P == 0 (offset after transfer)
      t = !!bit(instr, 21);                             // get T (bit 21)
    }
    if(i){                                              // if I == 1 (immediate as offset)
      is = bit(instr, 7, 11);                           // get Is (bits 7-11)
      st = bit(instr, 5, 6);                            // get shift type (bits 5-6)
      rm = bit(instr, 0, 3);                            // get Rm (bits 0-3)
    }
    else{                                               // if I == 0 (register as offset)
      nn = bit(instr, 0, 11);                           // get offset (bits 0-11)
    }
    if(!u){                                             // if U == 0 (substract offset from base)
      nn = -nn;
    }
    if(b){                                              // if B == 1 (transfer a byte)
    }
    else{                                               // if B == 0 (transfer a word)
    }
    if(l){                                              // if L == 1 (LDR - load register / PLD - preload)
      /* debug */ trace += "LDR" + condname + (b ? "B" : "") + (t ? "T" : "") +" r" + rd + ",";
      if(i){                                            // if I == 1 (immediate)
        if(p){                                          // if P == 1 (pre)
          if(w){                                        // if W == 1 (write-back)
          }
          else{                                         // if W == 0 (no write-back)
          }
        }
        else{                                           // if P == 0 (post)
          if(t){                                        // if T == 1 (force non-privileged access)
          }
          else{                                         // if T == 0 (normal)
          }
        }
      }
      else{                                             // if I == 0 (register)
        if(p){                                          // if P == 1 (pre)
          if(w){                                        // if W == 1 (write-back)
          }
          else{                                         // if W == 0 (no write-back) 
            /* debug */ trace += "=#0x" +  mem(r[rn] + ((rn == 15) ? 8 : 0) + nn, 4).toString(16);
            r[rd] = mem(r[rn] + ((rn == 15) ? 8 : 0) + nn, 4);
          }
        }
        else{                                           // if P == 0 (post)
          if(t){                                        // if T == 1 (force non-privileged access)
          }
          else{                                         // if T == 0 (normal)
          }
        }
      }
    }
    else{                                               // if L == 0 (STR - store register)
      /* debug */ trace += "STR" + condname + (b ? "B" : "") + (t ? "T" : "") +" r" + rd + ",";
      if(i){                                            // if I == 1 (immediate)
        if(p){                                          // if P == 1 (pre)
          if(w){                                        // if W == 1 (write-back)
          }
          else{                                         // if W == 0 (no write-back)
          }
        }
        else{                                           // if P == 0 (post)
          if(t){                                        // if T == 1 (force non-privileged access)
          }
          else{                                         // if T == 0 (normal)
          }
        }
      }
      else{                                             // if I == 0 (register)
        if(p){                                          // if P == 1 (pre)
          if(w){                                        // if W == 1 (write-back)
          }
          else{                                         // if W == 0 (no write-back)
            /* debug */ trace += "[r" + rn + ",#0x" + nn.toString(16) + "]";
            mem(r[rn] + nn, 4, r[rd]); 
          }
        }
        else{                                           // if P == 0 (post)
          if(t){                                        // if T == 1 (force non-privileged access)
          }
          else{                                         // if T == 0 (normal)
          }
        }
      }
    }
  }
  function arm10(){                                     // No flags affected
  }
  function arm11(){                                     // No flags affected
  }
  function arm12(){                                     // No flags affected
  }
  function arm13(){                                     // No flags affected
  }
  function arm14(){                                     // No flags affected
  }

  /* THUMB instruction execution (see "thumb.js") */
  function thumb(){instr=mem(r[15],2);t="000"+instr.toString(16);t=t.substr(t.length-4,t.length);trace+=" "+r[15].toString(16)+"  "+t+"        ";t=bit(instr,8,15);u=bit(instr,10,15);v=bit(instr,11,15);w=bit(instr,12,15);z=bit(instr,13,15);0==z?(opcode=bit(instr,11,12),3==opcode?thumb2():thumb1()):1==z?thumb3():16==u?thumb4():17==u?thumb5():9==v?thumb6():5==w?thumb7and8():3==z?thumb9():8==w?thumb10():9==w?thumb11():10==w?thumb12():176==t?thumb13():190==t?thumb17bkpt():11==w?thumb14():12==w?thumb15():223== t?thumb17swi():13==w?thumb16():28==v?thumb18():30==v&&thumb19();trace_r();log(trace);r[15]+=2} 
  function thumb1(){                                    // Flags affected: NZ (LSL#0), NZC (others)
    nn = bit(instr, 6, 10);                             // get nn
    rs = bit(instr, 3, 5);                              // get Rs
    rd = bit(instr, 0, 2);                              // get Rd
    if(opcode == 0x0){                                  // if opcode == 00 (LSL - logical shift left)
      r[rd] = lshift(r[rs], nn);                        // Rd = Rs << nn
      /* debug */ trace += "LSL r" + rd + ",r" + rs + ",#0x" + nn.toString(16);
    }
    else if(opcode == 0x1){                             // if opcode == 00 (LSR - logical shift right)
      r[rd] = rshift(r[rs], nn);                        // Rd = Rs >>> nn
      /* debug */ trace += "LSR r" + rd + ",r" + rs + ",#0x" + nn.toString(16);
    }
    else if(opcode == 0x2){                             // if opcode == 00 (ASR - arithmetic shift right)
      r[rd] = r[rs] >> nn;                              // Rd = Rs >> nn
      /* todo: test */
      /* debug */ trace += "ASR r" + rd + ",r" + rs + ",#0x" + nn.toString(16);
    }

    if(opcode != 0x0 || nn != 0){                       // If the operation isn't LSL#0
      update_cpsr_c(rd);                                // update C flag
    }
    update_cpsr_n(rd);                                  // update N flag
    update_cpsr_z(rd);                                  // update Z flag
  }
  function thumb2(){                                    // Flags affected: NZCV
    opcode = bit(instr, 9, 10);                         // get opcode (bits 9-10)
    rn = nn = bit(instr, 6, 8);                         // get Rn (value = 0-7) / nn (bits 6-8)
    rs = bit(instr, 3, 5);                              // get Rs (bits 3-5, value = 0-7)
    rd = bit(instr, 0, 2);                              // get Rd (bits 0-2, value = 0-7)
    if(opcode == 0x0){                                  // if opcode == ADD (add register)
      r[rd] = r[rs] + r[rn];
      /* debug */ trace += "ADD R" + rd + ",R" + rs + ",R" + rn;
      update_cpsr_c(rd);                                // update C flag
    }
    else if(opcode == 0x1){                             // if opcode == SUB (substract register)
      r[rd] = r[rs] - r[rn];
      /* debug */ trace += "SUB R" + rd + ",R" + rs + ",R" + rn;
      update_cpsr_c_sub(r[rs], r[rn]);                  // update C flag
    }
    else if(opcode == 0x2){                             // if opcode == ADD (add immediate)
      if(nn == 0){                                      // if nn == 0
        /* debug */ trace += "THUMB 2";
      }
      else{                                             // if nn != 0
        /* debug */ trace += "THUMB 2";
      }
      update_cpsr_c(rd);                                // update C flag
    }
    else if(opcode == 0x3){                             // if opcode == SUB (substract immediate)
      /* debug */ trace += "THUMB 2";
      update_cpsr_c(rd);                                // update C flag
    }

    update_cpsr_n(rd);                                  // update N flag
    update_cpsr_z(rd);                                  // update Z flag
    update_cpsr_v(rd);                                  // update V flag

  }
  function thumb3(){                                    // Flags affected: NZ (MOV), NZCV (others)
    opcode = bit(instr, 11, 12);                        // get opcode (bits 11-12)
    rd = bit(instr, 8, 10);                             // get Rd (bits 8-10, value = 0..7)
    nn = bit(instr, 0, 7);                              // get nn (bits 0-7)
    if(opcode == 0x0){                                  // if opcode == MOV
      r[rd] = nn;
      /* debug */ trace += "MOV R" + rd + ",#0x" + nn.toString(16);
    }
    else if(opcode == 0x1){
      r[16] = r[rd] - nn;                               // void (R16) = Rd - nn
      /* debug */ trace += "CMP R" + rd + ",#0x" + nn.toString(16);
      update_cpsr_c_sub(r[rd],nn);                      // update C flag
      update_cpsr_v(16);                                // update V flag
    }
    else if(opcode == 0x2){
      r[rd] = r[rd] + nn;
      /* debug */ trace += "ADD R" + rd + ",#0x" + nn.toString(16);
      update_cpsr_c(rd);                                // update C flag
      update_cpsr_v(rd);                                // update V flag
    }
    else if(opcode == 0x3){                             // if opcode == SUB
      r[rd] = r[rd] - nn;
      /* debug */ trace += "SUB R" + rd + ",#0x" + nn.toString(16);
      update_cpsr_c_sub(r[rd], nn);                     // update C flag
      update_cpsr_v(rd);                                // update V flag
    }
    update_cpsr_n(rd);                                  // update N flag
    update_cpsr_z(rd);                                  // update Z flag
  }
  function thumb4(){                                    // Flags affected: NZ (AND,EOR,TST,ORR,BIC,MVN), NZ and C=0 (MUL), NZ and C if non-zero shift (LSL,LSR,ASR,ROR), NZCV (others)
    opcode = bit(instr, 6, 9);                          // get opcode (bits 6-9)
    rs = bit(instr, 3, 5);                              // get Rs (bits 3-5, value = 0-7)
    rd = bit(instr, 0, 2);                              // get Rd (bits 0-2, value = 0-7)
    switch(opcode){
      case 0xA:                                         // if opcode == CMP (compare)
        r[16] = r[rd] - r[rs];                          // void = Rd - Rs
        /* debug */ trace += "CMP R" + rd + ",R" + rs;
        update_cpsr_c_sub(r[16], r[rs]);                // update C flag (substraction)
        update_cpsr_v(16);                              // update V flag
        rd = 16;                                        // artificially set Rd = void for flags updates at the end of the function. 

        break;
      case 0xE:                                         // if opcode == BIC (bit clear)
        r[rd] = r[rd] & (0xFFFFFFFF - r[rs]);           // Rd = Rd AND NOT Rs
        /* debug */ trace += "BIC R" + rd + ",R" + rs;
        break;
      default:
        /* debug */ trace += "THUMB4";
    }
    update_cpsr_n(rd);                                  // update N flag
    update_cpsr_z(rd);                                  // update Z flag
  }
  function thumb5(){                                    // Flags affected: NZCV (CMP), none (others)
    opcode = bit(instr, 8, 9);                          // get opcode (bits 6-9)
    msbd = bit(instr, 7);                               // get MSBd (bit 7)
    msbs = bit(instr, 6);                               // get MSBs (bit 6)
    rs = lshift(msbs, 3) + bit(instr, 3, 5);            // get Rs (bits 3-5, value = 0-15 including MSBs)
    rd = lshift(msbd, 3) + bit(instr, 0, 2);            // get Rd (bits 0-2, value = 0-15 including MSBd)
    if(opcode == 0){                                    // if opcode == ADD
      /* debug */ trace += "THUMB 5";
    }
    else if(opcode == 1){                               // if opcode == CMP
      /* debug */ trace += "THUMB 5";
    }
    else if(opcode == 2){                               // if opcode == MOV/NOP
      if(rd == 8 && rs == 8){                           // MOV R8,R8 is NOP
        /* debug */ trace += "NOP";
      }
      else{
        r[rd] = r[rs];
        /* debug */ trace += "MOV R" + rd + ",R" + rs;
      }
    }
    else if(opcode == 3){                               // if opcode == BX/BLX and MSBd == 0
      if(rs == 14) r[15] = (r[rs] & 0xFFFFFFFE) - 2;    // if Rs == R14, PC = Rs
      else if(rs == 0) r[15] = r[rs] - 3;               // if Rs == R0, PC = Rs
      else r[15] = (r[rs] & 0xFFFFFFFC) - 2;            // else, PC = (Rs with bits 0 and 1 cleared) 
      //cpsr &= 0xFFFFFFEF;                               // ARM mode: T (bit 5 of CPSR) = 0
      /* debug */ trace += "BX R" + rs;
      /* todo: find the logic */
    }
  }
  function thumb6(){                                    // No flags affected
    rd = bit(instr, 8, 10);                             // get Rd (bits 8-10)
    nn = bit(instr, 0, 7) * 4;                          // get nn (bits 0-7, values in steps of 4)
    r[rd] = mem(((r[15] + 4) & 0xFFFFFFFC) + nn, 4);    // Rd = WORD[PC+nn], with PC = PC+4 AND NOT 2
    /* debug */ trace += "LDR R" + rd + ",=#0x" + mem(((r[15] + 4) & 0xFFFFFFFC) + nn, 4).toString(16);
  }
  function thumb7and8(){                                // No flags affected
    /*opcode = bit(instr, 10, 11);                        // get opcode (bits 9-11) - bit 9 differenciates THUMB 7 and 8 opcodes, let's simplify and use it as a prefix.
    ro = bit(instr, 6, 8);                              // get Ro (bits 6-8)
    rb = bit(instr, 3, 5);                              // get Rb (bits 3-5)
    rd = bit(instr, 0, 2);                              // get Rd (bits 0-2)
    switch(opcode){
      case 0x100:                                       // if opcode == STRH (store 16-bit data)
        /* debug * / trace += "STRH R" + rd + ",[R" + rb + ",R" + ro + "]";
        mem(r[rb] + r[ro], 2, r[rd]);                   // HALFWORD[Rb+Ro] = Rd

    }
    /* debug */ trace += "THUMB 7/8";
  }
  function thumb9(){                                    // No flags affected
    opcode = bit(instr, 11, 12);                        // get opcode (bits 11-12)
    nn = bit(instr, 6, 10);                             // get nn (bits 6-10)
    rb = bit(instr, 3, 5);                              // get Rb (bits 3-5)
    rd = bit(instr, 0, 2);                              // get Rd (bits 0-2)
    if(opcode == 0x0){                                  // if opcode == STR
      mem(r[rb] + nn, 4, r[rd]);
      /* debug */ trace += "STR R" + rd + ",[R" + rb + (nn ? (",#0x" + nn) : "") + "]";
    }
    else if(opcode == 0x1){                             // if opcode == LDR
      r[rd] = mem(r[rb] + nn, 4);
      /* debug */ trace += "LDR R" + rd + ",[R" + rb + (nn ? (",#0x" + nn) : "") + "]";
    }
    else if(opcode == 0x2){                             // if opcode == STRB
      /* debug */ trace += "THUMB 9";
    }
    else if(opcode == 0x3){                             // if opcode == LDRB
      /* debug */ trace += "THUMB 9";
    }
  }
  function thumb10(){                                   // No flags affected
    opcode = !!bit(instr, 11);                          // get opcode (bit 11)
    nn = bit(instr, 6, 10);                             // get nn (bits 6-10)
    rb = bit(instr, 3, 5);                              // get Rb (bits 3-5)
    rd = bit(instr, 0, 2);                              // get Rd (bits 0-2)
    if(opcode){
    }
    else{                                               // if opcode == STRH (store 16-bit data)
      /* debug */ trace += "STRH R" + rd + ",[R" + rb + (nn ? ("," + nn) : "") + "]";
      mem(r[rb] + nn, 2, r[rd]);                         // HALFWORD[Rb+Ro] = Rd
    }
  }
  function thumb11(){                                   // No flags affected
    /* debug */ trace += "THUMB 11";
  }
  function thumb12(){                                   // No flags affected
    /* debug */ trace += "THUMB 12";
  }
  function thumb13(){                                   // No flags affected
    /* debug */ trace += "THUMB 13";
  }
  function thumb14(){                                   // No flags affected
    opcode = !!bit(instr, 11);                          // get opcode (bit 11) as a boolean
    pclr = !!bit(instr, 8);                             // get PC/LR bit (bit 8) as a boolean

    /* debug */ trace += (opcode ? "POP" : "PUSH") + " {";

    if(!opcode && pclr){                                // if opcode == PUSH and PC/LR bit == 1
      r[13] -= 4;                                       // decrement R13
      mem(r[13], 4, r[14]);                             // push LR (R14) too
      /* debug */ trace += "R14,";
    }

    if(opcode){                                         // if opcode == POP
      for(var i = 0; i < 8; i++){                       // for each register "i" (ascending order)
        if(!!bit(instr, i)){                            // if Rlist.i (bit i of Rlist) == 1
          r[i] = mem(r[13], 4);                         // load Ri from address R13 (SP)
          r[13] += 4;                                   // increment R13
          /* debug */ trace += "R" + i + ",";
        }
      }
    }
    else{                                               // if opcode == PUSH
      for(var i = 7; i >= 0; i--){                      // for each register "i" (descending order)
        if(!!bit(instr, i)){                            // if Rlist.i (bit i of Rlist) == 1
          r[13] -= 4;                                   // decrement R13
          mem(r[13], 4, r[i]);                          // store Ri at address R13 (SP)
          /* debug */ trace += "R" + i + ",";
        }
      }
    }

    if(opcode && pclr){                                 // if opcode == POP and PC/LR bit == 1
      mem(r[13], 4, r[14]);                             // pop PC (R15) too
      r[13] += 4;                                       // increment R13
      /* debug */ trace += "R15,";
    }

    /* debug */ trace = trace.substr(0, trace.length-1) + "}";
  }
  function thumb15(){                                   // No flags affected
    opcode = !!bit(instr, 11);                          // get opcode as a boolean (bit 11)
    rb = bit(instr, 8, 10);                             // get Rb (bits 8-10, value = 0-7)
    /* debug */ trace += (opcode ? "LDMIA" : "STMIA") + " R" + rb + "!,{";
    for(var i = 0; i < 8; i++){
      if(!!bit(instr, i)){                              // if Rlist.i (bit i of Rlist) == 1
        /* debug */ trace += "R" + i + ",";
        if(!opcode){                                    // if opcode == STMIA
          mem(r[rb], 4, r[i]);                          // store Ri at address Rb
        }
        else{                                           // if opcode == LDMIA
          r[i] = mem(r[rb], 4);                         // load Ri from address Rb
        }
        r[rb] += 4;                                     // increment Rb (instruction N+2)
      }
    }
    /* debug */ trace = trace.substr(0, trace.length-1) + "}";
  }
  function thumb16(){                                   // No flags affected
    cond = bit(instr, 8, 11);                           // get cond (bits 8-11)
    nn = bit(instr, 0, 7) * 2;                          // get nn (bits 0-7, values in steps of 2, signed, -256..254)
    if(nn > 254){                                       // nn is signed, so after 254
      nn -= 512;                                        // it continues at -256
    }

    /* debug */ trace += "B";

    if(check_cond()){

      /* debug */ trace += condname + " #0x" + (r[15] + 4 + nn).toString(16);

      r[15] += (2 + nn);                                // Branch - PC = PC + 4 + nn (2 now, 2 in thumb())
    }
    else{

      /* debug */ trace += condname + " #0x" + (r[15] + 4 + nn).toString(16) + " ;false";

    }
  }
  function thumb17bkpt(){                               // No flags affected
    /* debug */ trace += "THUMB 17 BKPT";
  }
  function thumb17swi(){                                // No flags affected
    /* debug */ trace += "THUMB 17 SWI";
  }
  function thumb18(){                                   // No flags affected
    offset = bit(instr, 0, 10) * 2;                     // get offset (bits 0-10, in steps of 2)
    if(offset > 2046){
      offset -= 4096;                                   // offset is signed
    }
    if(offset == -4){                                   // end of ROM - PC won't change
      gameover = 1;
    }
    /* debug */ trace += "B #0x" + (r[15] + 4 + offset).toString(16);
    r[15] = r[15] + 2 + offset;                         // PC = PC + 4 + offset
  }
  function thumb19(){                                   // No flags affected

    // instruction 1
    nn = bit(instr, 0, 10);                             // get nn (bits 0-10)
    r[14] = r[15] + 4 + lshift(nn, 12);                 // LR = PC + 4 + (nn << 12)

    // instruction 2
    r[15] += 2;                                         // place PC on next instruction
    instr = mem(r[15], 2);                              // read next instruction, at the address PC
    /* debug */ trace = trace.substr(0, 21);
    /* debug */ trace += instr.toString(16) + "    ";
    nn = bit(instr, 0, 10);                             // get nn (bits 0-10)
    nn = lshift(nn, 1);                                 // nn = nn << 1
    t = r[14];                                          // Backup LR
    r[14] = (r[15] + 2) | 0x1;                          // LR = (PC + 2) OR 1
    if((t + nn - 2) > r[15] + 0x3FFFFE){                // the offset range is [-0x400000;+0x3FFFFE] so if we go over 0x3FFFFE
      r[15] = t + nn - 2 - 0x800000;                    // PC = LR (backup) + (nn << 1) - 0x800000 (negative offset)
    }
    else{                                               // else
      r[15] = t + nn - 2;                               // PC = LR (backup) + (nn << 1) (positive offset)
    }
    opcode = bit(instr, 11, 15);                        // get opcode (bits 11-15)

    if(opcode == 0x1F){                                 // if opcode == BL
      /* debug */ trace += "BL #0x" + (r[15] + 2).toString(16);
    }
    else{                                               // else, opcode == BLX 
      /* debug */ trace += "THUMB 19";
    }
  }

  /* Play the game ROM */
  function play(){
    if(debug) debug.innerHTML = "Instr   Address  Binary      ASM                      Trace";
    interval = setInterval(function(){
      for(ii = 0; ii < 10000; ii++)
      {
        instructions++;
        if(instructions == 30){log("..."); displaydebug = false; }
        if(instructions == 196623) displaydebug = true;
        if(instructions == 196648){log("..."); displaydebug = false; }
        if(instructions == 196666) displaydebug = true;
        t = instructions + "     ";
        t = t.substr(0, 6);
        trace = t + " ";
        // Execute THUMB instruction (bit 5 of CPSR = 1)
        if(cpsr_t){
          thumb();
        }
        // Execute ARM instruction (bit 5 of CPSR = 0)
        else{
          arm();
        }
        if(gameover){
          ii = 10000;
          clearInterval(interval);
          return;
        }
      }
    },0);
  }
}
