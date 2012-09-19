/**
* This function allows to read and write in the GBA memory.
* Note that the GBA uses Little-Endianness (the 32-bit value 0x12345678 is stored as 0x78, 0x56, 0x34, 0x12).
* This function's parameters and return value, however, are in human-readable form (Big-Endian).
* @param address: the address to read from / write to.
* @param bytes: the number of bytes to read / write (1, 2 or 4, respectively for 8, 16 or 32-bit values).
* @param value (optional): 8/16/32bit value to write in memory, byte per byte, starting at the specified address.
* @param mask (optional): a 8/16/32bit mask defining on which bits the function has to write.
* @param force_write (for internal use only), allows the function to write on read-only addresses. 
* @return a 8/16/32-bit value read in memory at the specified address (if only 2 parameters are provided).
**/

/* HUMAN-READABLE CODE */
function mem(address, bytes, value, mask, force_write){
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
      if(subaddress % 0x10000 == 0x800){
        subaddress = 0x800;                           // Handle mirrors
      }
      else if(subaddress % 0x10000 == 0x801){
        subaddress = 0x801;
      }
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

  // Handle read-only I/O registers
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
      if(mem(0x4000128, 2) & bitsC_D == 0x2000){      // In multi-player mode (bits C-D of REG_SCCNT_L == 10)
        z = 0x0000;                                   // Bits 0-16 of REG_SCD0/1/2/3
      }
    }
    if(subaddress == 0x128){
      if(mem(0x4000128, 2) & bitsC_D == 0x1000){      // In 32-bit normal mode (bits C-D of REG_SCCNT_L == 01)
        z = 0xFFFB;                                   // Bit 2 of REG_SCCNT_L
      }
      else if(mem(0x4000128, 2) & bitsC_D == 0x2000){ // In multi-player mode (bits C-D of REG_SCCNT_L == 10)
        z = 0xFF83;                                   // Bits 2-6 of REG_SCCNT_L
      }
      else if(mem(0x4000128, 2) & bitsC_D == 0x3000){ // In UART mode (bits C-D of REG_SCCNT_L == 11)
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

  // Handle forbidden 1-byte writes
  if(value && bytes == 1){                            // If we try to write 1 byte...
    if(
      prefix == 7                                     // On OAM
      ||                                              // Or OBJ region of VRAM in tiled mode
      (
        prefix == 6
        && (mem(0x4000000, 2) & bits0_2 >= 0x0)
        && (mem(0x4000000, 2) & bits0_2 <= 0x2)
        && subaddress >= 0x10000
        && subaddress <= 0x17FFF
      )
      ||                                              // Or OBJ region of VRAM in bitmap mode
      (
        prefix == 6
        && (mem(0x4000000, 2) & bits0_2 >= 0x3)
        && (mem(0x4000000, 2) & bits0_2 <= 0x5)
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
        && (mem(0x4000000, 2) & bits0_2 >= 0x0)
        && (mem(0x4000000, 2) & bits0_2 <= 0x2)
        && subaddress >= 0x0
        && subaddress <= 0xFFFF
      )
      ||                                              // Or BG region of VRAM in bitmap mode
      (
        prefix == 6
        && (mem(0x4000000, 2) & bits0_2 >= 0x3)
        && (mem(0x4000000, 2) & bits0_2 <= 0x5)
        && subaddress >= 0x0
        && subaddress <= 0x13FFF
      )
    ){
      bytes = 2;                                      // It's written twice (16 bits)
      value = value * 0x100 + value;
    }
  }

  // Write a value
  if(value){
    mask = mask || 0xFFFFFFFF;                        // Set default mask (all the bits are writable)
    mask = mask & z;                                  // Apply a read-only mask defined above
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
      t = t * 0x100 + u;                              // Add it at the end of the final result                         // Add it at the end of the final result
    }
    return t;                                         // And return it
  }
}

/* HAND-OPTIMIZED CODE */
function mem(address, bytes, value, mask, force_write){
  var prefix = address >> 24;
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

      if(!force_write){
        if(address == 0x0)
          mask &= 0xFFF7;

        if(address == 0x4)
          mask &= 0xFFF8;

        if(address == 0x84)
          mask &= 0xFFF0;

        if(address % 2 && address > 0x11F && address < 0x127 && (mem(0x4000128, 2, null, null, null) & bitsC_D == 0x2000))
          mask &= 0x0000;

        if(address == 0x128){
          switch(mem(0x4000128, 2, null, null, null) & bitsC_D){
            case 0x1000:
              mask &= 0xFFFB;
              break;

            case 0x2000:
              mask &= 0xFF83;
              break;

            case 0x300:
              mask &= 0xFF8F;
              break;
          }
        }

        if(address == 0x130)
          mask &= 0xF300;

        if(address == 0x130)
          mask &= 0x7FFF;
      }
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

  if(value && bytes == 1){
    t = mem(0x4000000, 2, null, null, null) & bits0_2;
    if(
      prefix == 7 
      ||
      (
        prefix == 6 && 
        (
          (t >= 0x0 && t <= 0x2 && address >= 0x10000 && address <= 0x17FFF) 
          ||
          (t >= 0x3 && t <= 0x5 && address >= 0x14000 && address <= 0x17FFF)
        )
      )
    ){
      return;
    }

    if(
      prefix == 5
      ||
      (
        prefix == 6 && 
        (
          (t >= 0x0 && t <= 0x2 && address >= 0x0 && address <= 0xFFFF)
          ||
          (t >= 0x3 && t <= 0x5 && address >= 0x0 && address <= 0x13FFF)
        )
      )
    ){
      bytes = 2;
      value = value * 0x100 + value;
    }
  }

  if(value)
    for(i = 0; i < bytes; i++, value = value >> 8, mask = mask >> 8)
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
function mem(a,e,c,b,f){var d=a>>24,b=b||4294967295;switch(d){case 2:a=(a-33554432)%262144;break;case 3:a=(a-50331648)%32768;break;case 4:a=(a-67108864)%65536;if(!f){0==a&&(b&=65527);4==a&&(b&=65528);132==a&&(b&=65520);a%2&&(287<a&&295>a&&mem(67109160,2,null,null,null)&8192==bitsC_D)&&(b&=0);if(296==a)switch(mem(67109160,2,null,null,null)&bitsC_D){case 4096:b&=65531;break;case 8192:b&=65411;break;case 768:b&=65423}304==a&&(b&=62208);304==a&&(b&=32767)}break;case 5:a=(a-83886080)%1024;break;case 6:a= (a-100663296)%131072;98303<a&&131072>a&&(a-=8E3);break;case 7:a=(a-117440512)%1024;break;case 8:case 9:case 10:case 11:case 12:case 13:d=8;a=(a-134217728)%33554432;break;case 14:case 15:d=14,a=(a-234881024)%16777216}if(c&&1==e){t=mem(67108864,2,null,null,null)&bits0_2;if(7==d||6==d&&(0<=t&&2>=t&&65536<=a&&98303>=a||3<=t&&5>=t&&81920<=a&&98303>=a))return;if(5==d||6==d&&(0<=t&&2>=t&&0<=a&&65535>=a||3<=t&&5>=t&&0<=a&&81919>=a))e=2,c=256*c+c}if(c)for(i=0;i<e;i++,c>>=8,b>>=8)m[d][a+i]=((m[d][a+i]||0)&255-(b&255))+(c&b&255);else{c=0;for(i=e;i;i--)c=256*c+(m[d][a+i-1]||0);return c}};