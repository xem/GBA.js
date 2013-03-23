/****************
  Memory access
*****************/
GBA.mem = function(address, bytes, value, mask){

  // Quickly read from ROM
  if
  (
    value === undefined
    && address >= 0x8000000
    && address <= 0xDFFFFFF
  )
  {
    address = address % 0x2000000;                        // get subaddress
    switch(bytes){
      case 4:                                             // read a word
        return GBA.rom_word[address / 4];
      case 2:                                             // read a halfword
        return GBA.rom_halfword[address / 2];
      case 1:                                             // read a byte
        return GBA.m[address];
    }
  }

  // Manage prefixes, subaddresses and mirrors
  var i;                                                  // iterator
  var prefix = GBA.rshift(address, 24);                   // get prefix

  switch(prefix){
    case 2:                                               // EWRAM
      address = (address - 0x2000000) % 0x40000;
      break;

    case 3:                                               // IWRAM
      address = (address - 0x3000000) % 0x8000;
      break;

    case 4:                                               // I/O
      address = (address - 0x4000000);
      if(value !== undefined){                            // if a register is written
        //GBA.io(address, value);                         // update some I/O
      }
      break;

    case 5:                                               // Palette RAM
      address = (address - 0x5000000) % 0x400;
      break;

    case 6:                                               // VRAM
      address = (address - 0x6000000) % 0x20000;
      if(address > 0x17FFF && address < 0x20000){
        address -= 8000;
      }
      if(value !== undefined){                            // if the VRAM is written
        GBA.vram_worker(address, value, bytes);           // update canvas
      }
      break;

    case 7:                                               // OAM
      address = (address - 0x7000000) % 0x400;
      break;

    case 8:                                               // Game Pak ROM
    case 9:
    case 0xa:
    case 0xb:
    case 0xc:
    case 0xd:
      address = address % 0x2000000;
      prefix = 8;                                         // all the ROM is stored in m[8]
      break;

    case 0xE:                                             // Game Pak RAM
    case 0xF:
      prefix = 0xE;                                       // all the AM is stored in m[0xE]
      address = address % 0x1000000;                      // convert address and handle mirrors
      break;
  }
  
  // Write a value
  if(value !== undefined){
    mask = mask || 0xFFFFFFFF;                            // use provided mask, or none
    for                                                   // for each byte to write:
    (
      i = 0;
      i < bytes;
      i++,
      value = GBA.rshift(value, 8),                       // take the bits 8-15 of the value to write as bits 0-7
      mask = GBA.rshift(mask, 8)                          // take the bits 8-15 of the mask as bits 0-7
    )
    {
      GBA.m[prefix][address + i]                          // write in the right memory and address
      =
      (
        (GBA.m[prefix][address + i] || 0)                 // the byte already in memory (or 0)
        &
        (0xFF - (mask & 0xFF))                            // AND the opposite of the last byte of the mask
      )
      +
      (value & (mask & 0xFF));                            // plus the value to write AND the last byte of the mask
    }
  }

  // Read a value
  else {
    for(value = 0, i = bytes; i; i--){                    // for each byte to read:
      value
      =
      GBA.lshift(value, 8)                                // add one byte at the end of the temp value (left shift: 8)
      +
      (GBA.m[prefix][address + i - 1] || 0);              // add the byte in memory (or 0) at the end of the temp value
    }
    return value;                                         // and return it
  }
}
