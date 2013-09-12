/** Trace **/

/*
 * trace()
 * For debug purpose only
 * Decode and execute the next instruction, update the debug interface
 */
trace = function(){

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

    // Execute it
    thumb_opcode[i](thumb_params[i]);
  }

  // ARM
  else{

    // Instruction index
    i /= 4;

    // Execute it
    arm_opcode[i](arm_params[i], arm_cond[i]);
  }

  // Highlight the executed instruction
  if(debug){
    if(thumb){
      $("thumb" + x(r[15])).className = "highlight";
    }
    else{
      $("arm" + x(r[15])).className = "highlight";
    }
  }

  if(debug){

    // Update r15
    $("r15").innerHTML = x(r[15], 8);

    // Update cpsr
    $("cpsr").innerHTML = x(cpsr, 8);
  }

  // Next instruction subaddress
  i = r[15] - 0x8000000;

  // Convert it if needed
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

