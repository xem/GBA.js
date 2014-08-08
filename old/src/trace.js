/** Trace **/

/*
 * trace()
 * For debug purpose only
 * Decode and execute the next instruction, update the debug interface
 */
trace = function(){

  // Vars
  var i, instr;

  // Instruction subaddress
  i = r[15] % 0x2000000;

  // THUMB
  if(thumb){

    // Get the next instruction's index
    i /= 2;

    // Execute it
    thumb_opcode[i](thumb_params[i]);
  }

  // ARM
  else{

    // Get the next instruction's index
    i /= 4;

    // Execute it
    arm_opcode[i](arm_params[i], arm_cond[i]);
  }

  // Update debug interface and screen
  if(debug){
    update_debug_interface();
    canvas[0].putImageData(imagedata[0], 0, 0);
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

