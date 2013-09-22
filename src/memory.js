/** Memory **/

/*
 * m
 * The GBA's memory contains 8 useful parts
 * Each part is an ArrayBuffer representing an address range:
 * m2: on-board WRAM. (256kb)
 * m3: on-chip WRAM. (32kb)
 * m4: I/O registers. (1kb)
 * m5: palette RAM. (1kb)
 * m6: VRAM. (96kb)
 * m7: OBJ attributes. (1kb)
 * m8: Game Pak ROM. (32mb)
 * mE: Game Pak SRAM. (64kb)
 */
var m = [
  ,
  ,
  new ArrayBuffer(256 * 1024),
  new ArrayBuffer(32 * 1024),
  new ArrayBuffer(1024),
  new ArrayBuffer(1024),
  new ArrayBuffer(96 * 1024),
  new ArrayBuffer(1024),
  ,
  ,
  ,
  ,
  ,
  ,
  new ArrayBuffer(64 * 1024)
];

/*
 * mirrors
 * the size of the mirrors for each section of the memory
 */
var mirrors = [
  ,
  ,
  0x40000,
  0x8000,
  ,
  0x400,
  0x20000,
  0x400,
  0x2000000,
  ,
  ,
  ,
  ,
  ,
  0x1000000
];

/*
 * m8, m16 and m32
 * 8-bit, 16-bit and 32-bit views of the memory
 */
var m8 = [];
var m16 = [];
var m32 = [];

/*
 * mem()
 * read or write data in the memory
 * @param address: the address to read or write
 * @parambytes: the length of the value to read or write, inbytes (1, 2 or 4)
 * @param value (optional): the value to write
 * @param mask (optional): thebit mask to apply to the written value
 * @return: if a value is specified, it is written in memory
 *          else, the the read value is returned
 */
var mem = function(address, bytes, value, mask){

  // Vars
  var i, prefix, write, view;

  // Detect write operations
  write = value !== undefined;

  // Select the right view
  if(bytes === 1){
    view = m8;
  }

  else if(bytes === 2){
    view = m16;
  }

  else if(bytes === 4){
    view = m32;
  }

  // Get prefix (bits 24-27 of address)
  prefix = rshift(address, 24);

  // Remove prefix from address
  if(prefix < 8){
    address &= 0x00FFFFFF;
  }

  else if(prefix > 0xE){
    prefix = 0xE;
  }

  else{
    prefix = 8;
  }

  // Handle mirrors
  address %= mirrors[prefix];

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
      vram(address, value, bytes);
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

