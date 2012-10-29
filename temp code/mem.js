/**
* This function allows to read and write in the GBA memory, and abstracts completely its little-endianness.
* @param address: the address to read from / write to.
* @param bytes: the number of bytes to read / write (1, 2 or 4, respectively for 8, 16 or 32-bit values).
* @param value (optional): 8/16/32bit value to write in memory, byte per byte, starting at the specified address.
* @param mask (optional): a 8/16/32bit mask defining on which bits the function has to write.
* @param force_write (for internal use only), allows the function to write on read-only addresses. (not sure if useful)
* @return a 8/16/32-bit value read in memory at the specified address (if only 2 parameters are provided).
**/

/* HUMAN-READABLE CODE */
function mem(address, bytes, value, mask /*, force_write */){
  var prefix = address >> 24,                         // Address prefix (subarray index)
  subaddress;                                         // Address equivalent in the sub-array

  switch(prefix){
    case 0x2:                                         // EWRAM
      subaddress = ((address - 0x2000000) % 0x40000); // Handle sub-address and mirrors
      break;

    case 0x3:                                         // IWRAM
      subaddress = ((address - 0x3000000) % 0x8000);  // Handle sub-address and mirrors
      break;

    case 0x4:                                         // I/0
      subaddress = address - 0x4000000;               // Handle sub-address
      // I/O mirrors (not sure if useful)
      /*
      if(subaddress % 0x10000 == 0x800){
        subaddress = 0x800;                           // Handle mirrors
      }
      else if(subaddress % 0x10000 == 0x801){
        subaddress = 0x801;
      }
      */
      break;

    case 0x5:                                         // Palette RAM
      subaddress = ((address - 0x5000000) % 0x400);
      break;

    case 0x6:                                         // VRAM
      subaddress = ((address - 0x6000000) % 0x20000); // Handle sub-address
      if(subaddress > 0x17FFF && subaddress < 0x20000){
        subaddress -= 8000;                           // Handle mirrors
      }
      break;

    case 0x7:                                         // OAM
      subaddress = ((address - 0x7000000) % 0x400);   // Handle sub-address and mirrors
      break;

    case 0x8:                                         // Game Pak ROM
    case 0x9:
      prefix = 8;
      subaddress = address - 0x8000000;               // Handle sub-address
      break;

    case 0xA:                                         // Game Pak ROM mirror 1
    case 0xB:
      prefix = 8;
      subaddress = address - 0xA000000;               // Handle sub-address
      break;

    case 0xC:                                         // Game Pak ROM mirror 2
    case 0xD:
      prefix = 8;
      subaddress = address - 0xC000000;               // Handle sub-address and mirrors
      break;

    case 0xE:                                         // Game Pak RAM
    case 0xF:
      prefix = 0xE;
      subaddress = ((address - 0xE000000) % 0x1000000);
      break;
  }

  // Handle read-only I/O registers (not sure if useful)
  /*
  z = 0xFFFFFFFF;                                     // No mask (default)
  if(!force_write && prefix == 0x4){
    if(subaddress == 0x0){
      z = 0xFFF7;                                     // Bit 3 of REG_DISPCNT
    }
    if(subaddress == 0x4){
      z = 0xFFF8;                                     // Bits 0-2 of REG_DISPSTAT
    }
    if(subaddress == 0x84){
      z = 0xFFF0;                                     // Bits 0-4 of REG_SOUNDCNT_X
    }
    if(subaddress == 0x120
    || subaddress == 0x122
    || subaddress == 0x124
    || subaddress == 0x126){
      if(bit(mem(0x4000128, 2), 0xC, 0xD) == 0x2000){ // In multi-player mode (bits C-D of REG_SCCNT_L == 10)
        z = 0x0000;                                   // Bits 0-16 of REG_SCD0/1/2/3
      }
    }
    if(subaddress == 0x128){
      if(bit(mem(0x4000128, 2), 0xC, 0xD) == 0x1000){ // In 32-bit normal mode (bits C-D of REG_SCCNT_L == 01)
        z = 0xFFFB;                                   // Bit 2 of REG_SCCNT_L
      }
      else
      if(bit(mem(0x4000128, 2), 0xC, 0xD) == 0x2000){ // In multi-player mode (bits C-D of REG_SCCNT_L == 10)
        z = 0xFF83;                                   // Bits 2-6 of REG_SCCNT_L
      }
      else
      if(bit(mem(0x4000128, 2), 0xC, 0xD) == 0x3000){ // In UART mode (bits C-D of REG_SCCNT_L == 11)
        z = 0xFF8F;                                   // Bits 4-6 of REG_SCCNT_L
      }
    }
    if(subaddress == 0x130){
      z = 0xF300;                                     // Bits 0-9 of REG_KEY
    }
    if(subaddress == 0x130){
      z = 0x7FFF;                                     // Bit 16 of REG_WSCNT
    }
  }
  */

  // Handle forbidden 1-byte writes (not sure if useful)
  /*
  if(value && bytes == 1){                            // If we try to write 1 byte...
    if(
      prefix == 7                                     // On OAM
      ||                                              // Or OBJ region of VRAM in tiled mode
      (
        prefix == 6
        && (bit(mem(0x4000000, 2), 0, 2) >= 0x0)
        && (bit(mem(0x4000000, 2), 0, 2) <= 0x2)
        && subaddress >= 0x10000
        && subaddress <= 0x17FFF
      )
      ||                                              // Or OBJ region of VRAM in bitmap mode
      (
        prefix == 6
        && (bit(mem(0x4000000, 2), 0, 2) >= 0x3)
        && (bit(mem(0x4000000, 2), 0, 2) <= 0x5)
        && subaddress >= 0x14000
        && subaddress <= 0x17FFF
      )
    ){
      return;                                         // Nothing is written
    }
    if(
      prefix == 5                                     // If we try to write 1 byte on Palette RAM
      ||                                              // Or BG region of VRAM in tiled mode
      (
        prefix == 6
        && (bit(mem(0x4000000, 2), 0, 2) >= 0x0)
        && (bit(mem(0x4000000, 2), 0, 2) <= 0x2)
        && subaddress >= 0x0
        && subaddress <= 0xFFFF
      )
      ||                                              // Or BG region of VRAM in bitmap mode
      (
        prefix == 6
        && (bit(mem(0x4000000, 2), 0, 2) >= 0x3)
        && (bit(mem(0x4000000, 2), 0, 2) <= 0x5)
        && subaddress >= 0x0
        && subaddress <= 0x13FFF
      )
    ){
      bytes = 2;                                      // It's written twice (16 bits)
      value = value * 0x100 + value;
    }
  }
  */

  // Write a value
  if(value){
    mask = mask || 0xFFFFFFFF;                        // Set default mask (all the bits are writable)
    // Read-only (not sure if useful)
    /*  mask = mask & z;                              // Apply a read-only mask defined above */
    for(i = 0; i < bytes; i++){                       // For each byte of the source value
      t = m[prefix][subaddress + i] || 0;             // Get the target value in memory (or 0 by default)
      u = mask & 0xFF;                                // Get the last byte of the mask
      v = 0xFF - u;                                   // And its opposite
      w = value & u;                                  // Apply the mini-mask to the source value
      t = t & v;                                      // Set the target bits to 0 ("actual value" AND "opposite of mask")
      t = t + w;                                      // Set the target bits to their real value ("actual value zeroed" + "source value masked")
      m[prefix][subaddress + i] = t;                  // Write that byte in memory
      value = value >> 8;                             // Offset the value (to access the next byte)
      mask = mask >> 8;                               // Offset the mask
    }
  }

  // Read a value
  else {
    for(t = 0, i = bytes; i; i--){                    // For each byte of the value in memory
      u = m[prefix][subaddress + i - 1] || 0;         // Read the byte (or 0 if undefined)
      t = t * 0x100 + u;                              // Add it at the end of the final result
    }
    return t;                                         // And return it
  }
}

/* HAND-OPTIMIZED CODE */
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
      break;

    case 0x5:
      address = (address - 0x5000000) % 0x400;
      break;

    case 0x6:
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

/* MINIFIED */
function mem(a,e,b,c){var d=rshift(a,24),c=c||4294967295;switch(d){case 2:a=(a-33554432)%262144;break;case 3:a=(a-50331648)%32768;break;case 4:a=(a-67108864)%65536;break;case 5:a=(a-83886080)%1024;break;case 6:a=(a-100663296)%131072;98303<a&&131072>a&&(a-=8E3);break;case 7:a=(a-117440512)%1024;break;case 8:case 9:case 10:case 11:case 12:case 13:d=8;a=(a-134217728)%33554432;break;case 14:case 15:d=14,a=(a-234881024)%16777216}if(b)for(i=0;i<e;i++,b=rshift(b,8),c=rshift(c,8))m[d][a+i]=((m[d][a+i]||0)& 255-(c&255))+(b&c&255);else{b=0;for(i=e;i;i--)b=256*b+(m[d][a+i-1]||0);return b}};