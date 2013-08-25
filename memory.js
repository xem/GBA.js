/** Memory **/
// The memory (m) contains 8 useful parts.
// Each part is a bytes array representing an address range:
// m2: on-board WRAM. (256kb)
// m3: on-chip WRAM. (32kb)
// m4: I/O registers. (1kb)
// m5: palette RAM. (1kb)
// m6: VRAM. (96kb)
// m7: OBJ attributes. (1kb)
// m8: Game Pak ROM. (32mb)
// mE: Game Pak SRAM. (64kb)
m = [
  ,,
  new ArrayBuffer(256 * 1024),
  new ArrayBuffer(32 * 1024),
  new ArrayBuffer(1024),
  new ArrayBuffer(1024),
  new ArrayBuffer(96 * 1024),
  new ArrayBuffer(1024),
  ,,,,,,
  new ArrayBuffer(64 * 1024)
];

// m8, m16 and m32 contain 8-bit, 16-bit and 32-bit views of the memory.
m8 = [];
m16 = [];
m32 = [];

/** mem() **/
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

  // Get the prefix-free address, handle the mirrors
  switch(prefix){
    case 2:
      address = (address - 0x2000000) % 0x40000;
      break;

    case 3:
      address = (address - 0x3000000) % 0x8000;
      break;

    case 4:
      address = (address - 0x4000000);
      if(write){
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
      if(write){
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
  if(write){
    view[prefix][address / bytes] = value;
  }

  // Read a value
  else {
    return view[prefix][address / bytes] || 0;
  }
}
