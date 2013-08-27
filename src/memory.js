/** Memory **/

/*
 * mem()
 * read or write data in the memory.
 * @param address: the address to read or write.
 * @param bytes: the length of the value to read or write, in bytes (1, 2 or 4).
 * @param value (optional): the value to write.
 * @param mask (optional): the bit mask to apply to the written value.
 * @return: if a value is specified, it is written in memory.
 *          else, the the read value is returned.
 */
function mem(address, bytes, value, mask){

  // Vars
  var i, prefix, write, view;

  // Detect write operations
  write = value !== undefined;

  // Select the right view
  if(bytes === 1){
    view = m8;
  }

  if(bytes === 2){
    view = m16;
  }

  if(bytes === 4){
    view = m32;
  }

  // Get prefix (bits 24-27 of address)
  prefix = rshift(address, 24);
  
  // Remove prefix from address and handle mirrors
  if(prefix < 8){
    address &= 0x00FFFFFF;
  }
  
  else{
    prefix = 8;
    if(prefix > 0xE){
      prefix = 0xE;
    }
  }
  
  if(mirrors[prefix]){
    address %= mirrors[prefix];
  }
  
  // Handle writes on I/O
  if(prefix === 4 && write){
    //io(address, value);
  }
  
  // Handle mirrors and writes on VRAM
  if(prefix === 6){
    if(address > 0x17FFF && address < 0x20000){
      address -= 8000;
    }
    if(write){
      //vram(address, value, bytes);
    }
  }

  // Write a value
  if(write){
    view[prefix][address / bytes] = value;
  }

  // Read a value
  else {
    return view[prefix][address / bytes] || 0;
  }
}

