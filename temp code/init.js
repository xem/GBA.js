/* HUMAN-READABLE CODE */

var

// JavaScript vars
i, x, y,                                                // Loop counters
t, u, v, w, z,                                          // Temp vars

// Main loop vars
interval,                                               // Interval handler (to execute instructions 10000 by 10000)
ii,                                                     // Inner loop (to count to 10000)

// Debug vars
trace,                                                  // Console trace
instructions = 0,                                       // Number of instructions executed

// AJAX
xhr = new XMLHttpRequest,                               // AJAX object

// CPU registers
r = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],                // CPU registers 0 - 15 (we'll use register 16 to store void operation results)
cpsr = 0x00000010,                                      // Current program status register (default setting: "user mode", "ARM state")
cpsr_c,                                                 // CPSR Carry flag
cpsr_n,                                                 // CPSR Negative flag
cpsr_z,                                                 // CPSR Zero flag
cpsr_v,                                                 // CPSR oVerflow flag
cpsr_t,                                                 // CPSR Thumb flag

// Banked registers
r_irq = [],                                             // IRQ banked registers (r13, r14)
cpsr_irq,                                               // IRQ banked cpsr
r_fiq = [],                                             // FIQ banked registers (r8-14)
cpsr_fiq,                                               // FIQ banked cpsr
r_svc = [],                                             // SVC banked registers (r13, r14)
cpsr_svc,                                               // SVC banked cpsr
r_abt = [],                                             // ABT banked registers (r13, r14)
cpsr_abt,                                               // ABT banked cpsr
r_und = [],                                             // UND banked registers (r13, r14)
cpsr_und,                                               // UND banked cpsr

// Memory
m = {                                                   // The whole memory
  0x2: [],                                              // EWRAM (addresses 0x02XXXXXX)
  0x3: [],                                              // IWRAM (addresses 0x03XXXXXX)
  0x4: [],                                              // I/0(addresses 0x04XXXXXX)
  0x5: [],                                              // Palette RAM (addresses 0x05XXXXXX)
  0x6: [],                                              // VRAM (addresses 0x06XXXXXX)
  0x7: [],                                              // OAM (addresses 0x07XXXXXX)
  0x8: [],                                              // Game Pak ROM (addresses 0x08XXXXXX and 0x09XXXXXX)
  0xE: []                                               // Game Pak RAM (addresses 0x0EXXXXXX)
},

// ARM / THUMB instructions and fields
instr,                                                  // Instruction to execute
cond,                                                   // Condition field
condname,                                               // Condition name
opcode,                                                 // Opcode field
mask,                                                   // Bit mask
rn,                                                     // Operand register
rd,                                                     // Destination register
rs,                                                     // Shift register
rm,                                                     // 2nd operand register
ro,                                                     // 3rd operand register
nn,                                                     // Signed offset
imm,                                                    // Immediate offset
sr,                                                     // Shift by register flag
s,                                                      // Set condition code
is,                                                     // ROR shift applied to NN
st,                                                     // Shift type
op,                                                     // Operand
op2,                                                    // 2nd operand
cy,                                                     // Carry
msbd,                                                   // Most significant bit of Rd
msbs,                                                   // Most significant bit of Rs
pclr,                                                   // Include PC/LR in PUSH/POP instructions
gameover;                                               // ROM end


// CPU registers default values
r[13] = 0x3007F00;                                      // default SR value, when processor mode is "user"
r[15] = 0x8000000;                                      // defaunt PC value, when playing from Game Pak ROM

// I/O registers default values
mem(0x4000088, 2, 0x0200);                              // SOUNDBIAS
mem(0x4000802, 2, 0x0D00);                              // REG_IMC_H
  
/* MINIFIED CODE */
var i,x,y,t,u,v,w,z,trace,xhr=new XMLHttpRequest,r=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cpsr=16,cpsr_c,cpsr_n,cpsr_z,cpsr_v,r_irq=[],cpsr_irq,r_fiq=[],cpsr_fiq,r_svc=[],cpsr_svc,r_abt=[],cpsr_abt,r_und=[],cpsr_und,m={2:[],3:[],4:[],5:[],6:[],7:[],8:[],14:[]},instr,cond,condname,opcode,mask,rn,rd,rs,rm,nn,imm,sr,s,is,st,op,op2,cy,msbd,msbs;r[13]=50364160;r[15]=134217728;mem(67109E3,2,512);mem(67110914,2,3328);
var i,x,y,t,u,v,w,z,interval,ii,trace,instructions=0,xhr=new XMLHttpRequest,r=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cpsr=16,cpsr_c,cpsr_n,cpsr_z,cpsr_v,cpsr_t,r_irq=[],cpsr_irq,r_fiq=[],cpsr_fiq,r_svc=[],cpsr_svc,r_abt=[],cpsr_abt,r_und=[],cpsr_und,m={2:[],3:[],4:[],5:[],6:[],7:[],8:[],14:[]},instr,cond,condname,opcode,mask,rn,rd,rs,rm,ro,nn,imm,sr,s,is,st,op,op2,cy,msbd,msbs,pclr,gameover;r[13]=50364160;r[15]=134217728;mem(67109E3,2,512);mem(67110914,2,3328);