/*********
  Binary
**********/

GBA.lshift = function(number, shift){
  return number * Math.pow(2, shift);                     // left shift is replaced by a multiplication with 2 ^ shift value
}

GBA.rshift = function(number, shift){
  return Math.floor(number / Math.pow(2, shift));         // right shift is replaced by a division with 2 ^ shift value
}

GBA.bit = function(number, start, end){                   // to extract some bits of a value
  return GBA.rshift(number, start)                        // return the value right shifted (to place the bits to extract at the end of the number)
         &
         (Math.pow(2, (end || start) - start + 1) - 1);   // AND a mask (equal to 2 ^ the number of bits to extract)
}

GBA.ror = function(number, length, bits){                 // to rotate bits
  return GBA.lshift(
          (number & Math.pow(2, bits) - 1), length - bits // put the last bits of the number first
         )
         +
         GBA.rshift(number, bits);                        // and the first bits, last
}
