/** CPU **/
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
