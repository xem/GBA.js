/** mem() **/
function mem(address, bytes, value, mask){

  // Manage prefixes and mirrors
  var i;
  var prefix = rshift(address, 24);

  switch(prefix){
    case 2:
      address = (address - 0x2000000) % 0x40000;
      break;

    case 3:
      address = (address - 0x3000000) % 0x8000;
      break;

    case 4:
      address = (address - 0x4000000);
      if(value !== undefined){
        //io(address, value);
      }
      break;

    case 5:
      address = (address - 0x5000000) % 0x400;
      break;

    case 6:
      address = (address - 0x6000000) % 0x20000;
      if(address > 0x17FFF && address < 0x20000){
        address -= 8000;
      }
      if(value !== undefined){
        //vram(address, value, bytes);
      }
      break;

    case 7:
      address = (address - 0x7000000) % 0x400;
      break;

    case 8:
    case 9:
    case 0xa:
    case 0xb:
    case 0xc:
    case 0xd:
      prefix = 8;
      address = address % 0x2000000;
      break;

    case 0xE:
    case 0xF:
      prefix = 0xE;
      address = address % 0x1000000;
      break;
  }
  
  // Write a value
  if(value !== undefined){
    if(bytes === 1){
      m8[address] = value;
    }
    
    if(bytes === 2){
      m16[address / 2] = value;
    }
    
    if(bytes === 4){
      m32[address / 4] = value;
    }
  }

  // Read a value
  else {
    if(bytes === 1){
      return m8[address] || 0;
    }
    
    if(bytes === 2){
      return m16[address / 2] || 0;
    }
    
    if(bytes === 4){
      return m32[address / 4] || 0;
    }
  }
}
