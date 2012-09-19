/* HUMAN-READABLE CODE */

var

// JavaScript vars
i, x, y,              // Loop counters
t, u, v, w, z,        // Temp vars

// AJAX
xhr = new XMLHttpRequest,

// CPU registers
r = [],               // CPU registers 0 - 14
cpsr = 0x00000010,    // Current program status register (default setting: "user mode", "ARM state")
pca = 0x8000000,      // Program counter address
pc,                   // Program counter (current instruction)

// Banked registers
r_irq = [],           // IRQ banked registers (r13, r14)
cpsr_irq,             // IRQ banked cpsr
r_fiq = [],           // FIQ banked registers (r8-14)
cpsr_fiq,             // FIQ banked cpsr
r_svc = [],           // SVC banked registers (r13, r14)
cpsr_svc,             // SVC banked cpsr
r_abt = [],           // ABT banked registers (r13, r14)
cpsr_abt,             // ABT banked cpsr
r_und = [],           // UND banked registers (r13, r14)
cpsr_und,             // UND banked cpsr

// Memory
m = {                 // The whole memory
  0x2: [],            // EWRAM (addresses 0x02XXXXXX)
  0x3: [],            // IWRAM (addresses 0x03XXXXXX)
  0x4: [],            // I/0(addresses 0x04XXXXXX)
  0x5: [],            // Palette RAM (addresses 0x05XXXXXX)
  0x6: [],            // VRAM (addresses 0x06XXXXXX)
  0x7: [],            // OAM (addresses 0x07XXXXXX)
  0x8: [],            // Game Pak ROM (addresses 0x08XXXXXX and 0x09XXXXXX)
  0xE: []             // Game Pak RAM (addresses 0x0EXXXXXX)
},

// Bit masks to access regions of I/O registers
bit0 = 0x1,
bit1 = 0x2,
bit2 = 0x4,
bit3 = 0x8,
bit4 = 0x10,
bit5 = 0x20,
bit6 = 0x40,
bit7 = 0x80,
bit8 = 0x100,
bit9 = 0x200,
bit10 = 0x400,
bit11 = 0x800,
bit12 = 0x1000,
bit13 = 0x2000,
bit14 = 0x4000,
bit15 = 0x8000,
bit27 = 0x8000000,
bits0_1 = 0x3,
bits0_2 = 0x7,
bits0_3 = 0xF,
bits0_4 = 0x1F,
bits0_5 = 0x3F,
bits0_7 = 0xFF,
bits0_9 = 0x3FF,
bits0_A = 0x7FF,
bits0_D = 0x3FFF,
bits0_F = 0xFFFF,
bits1_9 = 0x3FE,
bits2_3 = 0xC,
bits4_5 = 0x30,
bits4_6 = 0x70,
bits4_7 = 0xF0,
bits5_6 = 0x60,
bits6_7 = 0xC0,
bits7_8 = 0x180,
bits8_9 = 0x300,
bits8_A = 0x700,
bits8_B = 0xF00,
bits8_C = 0x1F00,
bits8_E = 0x7F00,
bits8_F = 0xFF00,
bitsC_D = 0x3000,
bitsC_F = 0xF000,
bitsD_F = 0xE000,
bitsE_F = 0xC000,
bits0_26 = 0x7FFFFFF,
bits0_27 = 0xFFFFFFF,
bits0_31 = 0xFFFFFFFF,
bits8_26 = 0x7FFFF00;

// CPU registers default values */
r[13] = 0x3007F00;                   // default r13 value when processor mode is "user"

// I/O registers default values */
mem(0x4000088, 2, 0x0200);           // SOUNDBIAS
mem(0x4000802, 2, 0x0D00);           // REG_IMC_H

/* MINIFIED CODE */
var i,x,y,t,u,v,w,z,xhr=new XMLHttpRequest,r=[],cpsr=16,pca=134217728,pc,r_irq=[],cpsr_irq,r_fiq=[],cpsr_fiq,r_svc=[],cpsr_svc,r_abt=[],cpsr_abt,r_und=[],cpsr_und,m={2:[],3:[],4:[],5:[],6:[],7:[],8:[],14:[]},bit0=1,bit1=2,bit2=4,bit3=8,bit4=16,bit5=32,bit6=64,bit7=128,bit8=256,bit9=512,bit10=1024,bit11=2048,bit12=4096,bit13=8192,bit14=16384,bit15=32768,bit27=134217728,bits0_1=3,bits0_2=7,bits0_3=15,bits0_4=31,bits0_5=63,bits0_7=255,bits0_9=1023,bits0_A=2047,bits0_D=16383,bits0_F=65535,bits1_9=1022, bits2_3=12,bits4_5=48,bits4_6=112,bits4_7=240,bits5_6=96,bits6_7=192,bits7_8=384,bits8_9=768,bits8_A=1792,bits8_B=3840,bits8_C=7936,bits8_E=32512,bits8_F=65280,bitsC_D=12288,bitsC_F=61440,bitsD_F=57344,bitsE_F=49152,bits0_26=134217727,bits0_27=268435455,bits0_31=4294967295,bits8_26=134217472;r[13]=50364160;mem(67109E3,2,512);mem(67110914,2,3328);