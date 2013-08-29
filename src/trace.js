/** Trace **/

/*
 * trace()
 * For debug purpose only.
 * Decode and execute the next instruction, update the debug interface.
 */
function trace(){

  // Vars
  var i;

  // Instruction subaddress
  i = r[15] - 0x8000000;
  
  // Disable current highlight
  if(debug){
    document.getElementsByClassName("highlight")[0].className = "";
  }
  
  // THUMB
  if(thumb){
    
    // Instruction index
    i /= 2;
  }
  
  // ARM
  else{
  
    // Instruction index
    i /= 4;

    // Execute it
    arm_opcode[i](arm_params[i], arm_cond[i]);
    
    // Highlight it
    if(debug){
      if(thumb){
        document.getElementById("thumb" + hex(r[15])).className = "highlight";
      }
      else{
        document.getElementById("arm" + hex(r[15])).className = "highlight";
      }
    }
  }
  
  // Update r15
  if(debug){
    document.getElementById("r15").innerHTML = hex(r[15], 8);
  }

  // Next instruction subaddress
  i = r[15] - 0x8000000;
  
  // Convert it if needed.
  if(thumb){
    i /= 2;
    if(!thumb_opcode[i]){
      convert_THUMB(i);
    }
  }
  else{
    i /= 4;
    if(!arm_opcode[i]){
      convert_ARM(i);
    }
  }
}

