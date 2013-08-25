/** Screen **/
// The GBA's screen has four layers, each of them is represented by a canvas.
// There are four ImageData to edit each canvas as a bitmap.
canvas = [];
imagedata = [];
for(i = 0; i < 4; i++){
  canvas.push($("canvas" + i).getContext("2d"));
  imagedata.push(canvas[i].createImageData(240, 160));
}

/** Registers **/
// The GBA's CPU has 16 registers (unsigned, 32-bit).
// r0-r12: general purpose.
// r13: stack pointer (SP).
// r14: link register (LR).
// r15: program counter (PC).
// r16: used here to store the result of void operations.
r = new Uint16Array(new ArrayBuffer(32));
r[13] = 0x3007F00;
r[15] = 0x8000000;

// Current program status register,
// And its backup, stored program status register.
cpsr = 0;
spsr = 0;

/** Memory **/
// The memory contains 8 useful parts.
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

// m8, m16 and m32 are 8-bit, 16-bit and 32-bit views of the memory.
m8 = [];
m16 = [];
m32 = [];
for(i = 0; i < 16; i++){
  if(m[i]){
    m8[i] = new Uint8Array(m[i]);
    m16[i] = new Uint16Array(m[i]);
    m32[i] = new Uint32Array(m[i]);
  }
}