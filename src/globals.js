/** Globals **/

/*
 * debug
 * Debug mode, disabled by default
 */
debug = false;
 
/*
 * canvas, imagedata
 * The GBA's screen has four layers, each of them is represented by a canvas.
 * There are four ImageData to edit each canvas as a bitmap.
 */
canvas = [];
imagedata = [];
for(i = 0; i < 4; i++){
  canvas.push(document.getElementById("canvas" + i).getContext("2d"));
  imagedata.push(canvas[i].createImageData(240, 160));
}

/*
 * r
 * The GBA's CPU has 16 registers (unsigned, 32-bit).
 * r0-r12: general purpose.
 * r13: stack pointer (SP). Initial value: 0x3007F00.
 * r14: link register (LR).
 * r15: program counter (PC). Initial value: 0x8000000.
 * r16: used here to store the result of void operations.
 */
r = new Uint32Array(new ArrayBuffer(17 * 4));
r[13] = 0x3007F00;
r[15] = 0x8000000;

/*
 * cpsr
 * Current program status register, stored program status register.
 */
cpsr = 0;

/*
 * spsr
 * Stored program status register.
 */
spsr = 0;

/*
 * m
 * The GBA's memory contains 8 useful parts.
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
m = [
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
 * m8, m16 and m32 
 * 8-bit, 16-bit and 32-bit views of the memory.
 */
m8 = [];
m16 = [];
m32 = [];

/* 
 * arm_opcode, arm_params, arm_asm, arm_cond, thumb_opcode, thumb_params, thumb_asm
 * The ROM is interpreted as ARM (32-bit) and THUMB (16-bit) instructions.
 * These arrays contain each opcode's function, params and assembler code.
 * ARM opcodes are conditional, their conditions are stored in arm_cond.
 */
arm_opcode = [];
arm_params = [];
arm_asm = [];
arm_cond = [];

thumb_opcode = [];
thumb_params = [];
thumb_asm = [];

/*
 * condnames
 * suffix for conditional ARM instructions.
 */
condnames =
[
  "EQ",
  "NE",
  "CS",
  "CC",
  "MI",
  "PL",
  "VS",
  "VC",
  "HI",
  "LS",
  "GE",
  "LT",
  "GT",
  "LE",
  "",
  "NV"
];

/*
 * mirrors
 * size of the mirrors for each address range
 */
mirrors =
[
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

