/** Emulator tests
* The test results appear in the debug console.
**/

/* HUMAN-READABLE CODE */
function test(){
  console.log('*************************');
  console.log('* ROM load verification *');
  console.log('*************************');
  console.log('The ROM "' + file + '" ( ' + m[8].length + ' bytes ) was loaded successfully.');

  console.log('*********************');
  console.log('* Memory operations *');
  console.log('*********************');
  console.log('8-bit value stored at the address 0x02000005: ' + mem(0x02000005, 1) + ' (0 expected)');
  console.log('Storing the 8-bit value 0xEE at the address 0x02000005.');
  mem(0x02000005, 1, 0xEE);
  console.log('Reading the 8-bit value stored at the address 0x02000005: 0x' + mem(0x02000005, 1).toString(16).toUpperCase() + ' (0xEE expected)');
  console.log('Reading the 8-vit value stored at the address 0x02080005, a mirror of 0x02000005: 0x' + mem(0x02080005, 1).toString(16).toUpperCase() + ' (0xEE expected)');
  console.log('Storing the 32-bit value 0x12345678 at the address 0x02040005, a mirror of 0x02000005.');
  mem(0x02000005, 4, 0x12345678);
  console.log('Reading the 32-bit value stored at the address 0x02000005: 0x' + mem(0x02000005, 4).toString(16).toUpperCase() + ' (0x12345678 expected)');
  console.log('Reading the 8-bit value stored at the address 0x02000005: 0x' + mem(0x02000005, 1).toString(16).toUpperCase() + ' (0x78 expected)');
  console.log('Reading the 8-bit value stored at the address 0x02000006: 0x' + mem(0x02000006, 1).toString(16).toUpperCase() + ' (0x56 expected)');
  console.log('Reading the 8-bit value stored at the address 0x02000007: 0x' + mem(0x02000007, 1).toString(16).toUpperCase() + ' (0x34 expected)');
  console.log('Reading the 8-bit value stored at the address 0x02000008: 0x' + mem(0x02000008, 1).toString(16).toUpperCase() + ' (0x12 expected)');
  console.log('Reading the 32-bit value stored at the address 0x02000002: 0x' + mem(0x02000002, 4).toString(16).toUpperCase() + ' (0x78000000 expected)');
  console.log('Reading the 32-bit value stored at the address 0x02000008: 0x' + mem(0x02000008, 4).toString(16).toUpperCase() + ' (0x12 expected)');
  console.log('Reading the 16-bit value stored at the address 0x02000005: 0x' + mem(0x02000005, 2).toString(16).toUpperCase() + ' (0x5678 expected)');
  console.log('Reading the 16-bit value stored at the address 0x02000007: 0x' + mem(0x02000007, 2).toString(16).toUpperCase() + ' (0x1234 expected)');
  console.log('Setting the bits 0-4 to 0b10101 (0x15) at the address 0x02000005".');
  mem(0x02000005, 1, 0x15, bits0_4);
  console.log('Reading the 8-bit value stored at the address 0x02000005: 0x' + mem(0x02000005, 1).toString(16).toUpperCase() + ' (0x75 expected - 0x78 with 0b10101 at the end)');
  console.log('Setting the 16-bit value 0xFFFF at the address 0x04000000. But in this register, bit 3 is read-only.');
  mem(0x04000000, 2, 0xFFFF);
  console.log('Reading the 16-bit value stored at the address 0x04000000: 0x' + mem(0x04000000, 2).toString(16).toUpperCase() + ' (0xFFF7 expected)');
  console.log('Setting the 16-bit value 0xFFFF at the address 0x04000000 and force write.');
  mem(0x04000000, 2, 0xFFFF, 0xFFFF, true);
  console.log('Reading the 16-bit value stored at the address 0x04000000: 0x' + mem(0x04000000, 2).toString(16).toUpperCase() + ' (0xFFFF expected)');
  console.log('Setting the bits 1-9 to 0b010101010 of the 16-bit value at the address 0x04000000 and force write.');
  mem(0x04000000, 2, 0x0D54, bits1_9, true);
  console.log('Reading the 16-bit value stored at the address 0x04000000: 0x' + mem(0x04000000, 2).toString(16).toUpperCase() + ' (0xFD55 expected)');
  console.log('Setting the 8-bit value 0x56 at the address 0x05000002. But in this memory, 8-bit writes are done twice.');
  mem(0x05000002, 1, 0x56);
  console.log('Reading the 8-bit value stored at the address 0x05000002: 0x' + mem(0x05000002, 1).toString(16).toUpperCase() + ' (0x56 expected)');
  console.log('Reading the 8-bit value stored at the address 0x05000003: 0x' + mem(0x05000003, 1).toString(16).toUpperCase() + ' (0x56 expected)');
  console.log('Setting the 8-bit value 0x56 at the address 0x07000002. But in this memory, 8-bit writes have no effect.');
  mem(0x07000002, 1, 0x56);
  console.log('Reading the 8-bit value stored at the address 0x07000002: 0x' + mem(0x07000002, 1).toString(16).toUpperCase() + ' (0x0 expected)');
}

/* MINIFIED CODE */
function test(){console.log("*************************");console.log("* ROM load verification *");console.log("*************************");console.log('The ROM "'+file+'" ( '+m[8].length+" bytes ) was loaded successfully.");console.log("*********************");console.log("* Memory operations *");console.log("*********************");console.log("8-bit value stored at the address 0x02000005: "+mem(0x02000005,1)+" (0 expected)");console.log("Storing the 8-bit value 0xEE at the address 0x02000005."); mem(0x02000005,1,238);console.log("Reading the 8-bit value stored at the address 0x02000005: 0x"+mem(0x02000005,1).toString(16).toUpperCase()+" (0xEE expected)");console.log("Reading the 8-vit value stored at the address 0x02080005, a mirror of 0x02000005: 0x"+mem(0x02080005,1).toString(16).toUpperCase()+" (0xEE expected)");console.log("Storing the 32-bit value 0x12345678 at the address 0x02040005, a mirror of 0x02000005.");mem(0x02000005,4,305419896);console.log("Reading the 32-bit value stored at the address 0x02000005: 0x"+ mem(0x02000005,4).toString(16).toUpperCase()+" (0x12345678 expected)");console.log("Reading the 8-bit value stored at the address 0x02000005: 0x"+mem(0x02000005,1).toString(16).toUpperCase()+" (0x78 expected)");console.log("Reading the 8-bit value stored at the address 0x02000006: 0x"+mem(0x02000006,1).toString(16).toUpperCase()+" (0x56 expected)");console.log("Reading the 8-bit value stored at the address 0x02000007: 0x"+mem(0x02000007,1).toString(16).toUpperCase()+" (0x34 expected)");console.log("Reading the 8-bit value stored at the address 0x02000008: 0x"+ mem(0x02000008,1).toString(16).toUpperCase()+" (0x12 expected)");console.log("Reading the 32-bit value stored at the address 0x02000002: 0x"+mem(0x02000002,4).toString(16).toUpperCase()+" (0x78000000 expected)");console.log("Reading the 32-bit value stored at the address 0x02000008: 0x"+mem(0x02000008,4).toString(16).toUpperCase()+" (0x12 expected)");console.log("Reading the 16-bit value stored at the address 0x02000005: 0x"+mem(0x02000005,2).toString(16).toUpperCase()+" (0x5678 expected)"); console.log("Reading the 16-bit value stored at the address 0x02000007: 0x"+mem(0x02000007,2).toString(16).toUpperCase()+" (0x1234 expected)");console.log('Setting the bits 0-4 to 0b10101 (0x15) at the address 0x02000005".');mem(0x02000005,1,21,bits0_4);console.log("Reading the 8-bit value stored at the address 0x02000005: 0x"+mem(0x02000005,1).toString(16).toUpperCase()+" (0x75 expected - 0x78 with 0b10101 at the end)");console.log("Setting the 16-bit value 0xFFFF at the address 0x04000000. But in this register, bit 3 is read-only."); mem(0x04000000,2,65535);console.log("Reading the 16-bit value stored at the address 0x04000000: 0x"+mem(0x04000000,2).toString(16).toUpperCase()+" (0xFFF7 expected)");console.log("Setting the 16-bit value 0xFFFF at the address 0x04000000 and force write.");mem(0x04000000,2,65535,65535,!0);console.log("Reading the 16-bit value stored at the address 0x04000000: 0x"+mem(0x04000000,2).toString(16).toUpperCase()+" (0xFFFF expected)");console.log("Setting the bits 1-9 to 0b010101010 of the 16-bit value at the address 0x04000000 and force write."); mem(0x04000000,2,3412,bits1_9,!0);console.log("Reading the 16-bit value stored at the address 0x04000000: 0x"+mem(0x04000000,2).toString(16).toUpperCase()+" (0xFD55 expected)");console.log("Setting the 8-bit value 0x56 at the address 0x05000002. But in this memory, 8-bit writes are done twice.");mem(0x05000002,1,86);console.log("Reading the 8-bit value stored at the address 0x05000002: 0x"+mem(0x05000002,1).toString(16).toUpperCase()+" (0x56 expected)");console.log("Reading the 8-bit value stored at the address 0x05000003: 0x"+ mem(0x05000003,1).toString(16).toUpperCase()+" (0x56 expected)");console.log("Setting the 8-bit value 0x56 at the address 0x07000002. But in this memory, 8-bit writes have no effect.");mem(0x07000002,1,86);console.log("Reading the 8-bit value stored at the address 0x07000002: 0x"+mem(0x07000002,1).toString(16).toUpperCase()+" (0x0 expected)")};