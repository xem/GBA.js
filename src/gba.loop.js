/*******
  Loop
********/
GBA.loop = function(){
  var i, j, k;                                            // iterators

  // DEBUG: legend
  console.log("     # Address Assembler                 N Z C V r0       r1       r2       r3       r4       r5       r6       r7       r8       r9       r10      r11      r12      r13 (SP) r14 (LR) cpsr");

  // Loop to execute opcodes
  for(
    i = 0;
    i < 366000;
    i++
  )
  {
    // DEBUG: show address
    GBA.trace = GBA.r[15].toString(16) + " ";

    // THUMB opcode
    if(GBA.thumb === 1){
      j = (GBA.r[15] - 0x8000000) / 2;
      if(GBA.rom_thumb[j] === undefined){
        console.log(j + " thumb is undefined");
      }
      GBA.rom_thumb[j][0](GBA.rom_thumb[j][1]);
      // DEBUG: when was that?
      //if(GBA.rom_thumb[j][0] == GBA.thumb_add_rrn) console.log((j*2).toString(16));
    }

    // ARM opcode
    else{
      j = (GBA.r[15] - 0x8000000) / 4;
      GBA.rom_arm[j][0](GBA.rom_arm[j][1]);
    }

    // DEBUG: don't display trace during loops
    if(GBA.loops === -1 && i > 366000){
      console.log("loops...");
      GBA.loops = 0;
    }

    // DEBUG: display trace
    if(GBA.loops < 3 && i > 366000){
      GBA.trace += "                         ";
      GBA.trace = ("     " + i.toString(10)).slice(-6) + ' ' + GBA.trace.substr(0, 33) + " " + GBA.bit(GBA.cpsr, 31) + " " + GBA.bit(GBA.cpsr, 30) + " " + GBA.bit(GBA.cpsr, 29) + " " + GBA.bit(GBA.cpsr, 28);
      for(k = 0; k < 15; k++){
        GBA.trace += " " + ("0000000" + GBA.r[k].toString(16)).slice(-8);
      }
      GBA.trace += " " + ("0000000" + GBA.cpsr.toString(16)).slice(-8);
      console.log(GBA.trace);
    }
    
    // DEBUG: verify registers boundaries and reset current loop if there's a problem
    for(k = 0; k < 15; k++){
      if(GBA.r[k] < 0 || GBA.r[k] > 0xFFFFFFFF){
        console.log("REGISTER " + k + " OUT OF BOUNDS:" + GBA.r[k]);
        GBA.loops = 0;
      }
    }

    // DEBUG: game over
    if(GBA.stopped === true){
      GBA.canvas.putImageData(GBA.pixels, 0, 0);
      GBA.loops = 2;
      break;
    }

    // DEBUG: OK here
    if(i === 366000){
      console.log("========== OK ==========");
      GBA.loops = 0;
      GBA.canvas.putImageData(GBA.pixels, 0, 0);
    }
    
    // DEBUG: stop loop
    // if(i === 254350){
     // GBA.loops = 0;
    // }
    
  }
  
  // DEBUG
  GBA.canvas.putImageData(GBA.pixels, 0, 0);
  if(GBA.loops > 2 && !GBA.stopped){
    console.log("unfinished loops...");
  }
}