/** Play **/

/*
 * play()
 * Launch the ROM
 */
play = function(){

  // Vars
  var i, pc_backup;

  // Loop
  while(pc_backup != r[15])
  {
    // Backup pc
    pc_backup = r[15];

    // Instruction subaddress
    i = r[15] % 0x2000000;

    // THUMB
    if(thumb){

      // Get the next instruction's index
      i /= 2;

      // Convert it if needed
      if(!thumb_opcode[i]){
        convert_THUMB(i);
      }

      // Execute it
      thumb_opcode[i](thumb_params[i]);
    }

    // ARM
    else{

      // Get the next instruction's index
      i /= 4;

      // Convert it if needed
      if(!arm_opcode[i]){
        convert_ARM(i);
      }

      // Execute it
      arm_opcode[i](arm_params[i], arm_cond[i]);
    }
  }

  // Game over, update debug interface
  if(debug){
    update_debug_interface();
  }

  // Update screen
  canvas[0].putImageData(imagedata[0], 0, 0);
}

