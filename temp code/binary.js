/**
* This function performs a left bit shift without risk of making a nagative result
* (Native << produces negative numbers if the result is 0x80000000 or higher)
* @param number: the number to be shifted
* @param shift: the number of "0"s to add at the end of the number (in binary notation)
* @return the number, shifted
**/
function lshift(number, shift){
  return number * Math.pow(2, shift);
}

/**
* This function performs a right bit shift without risk of making a nagative result
* (Native >> produces negative numbers if the result is 0x80000000 or higher)
* @param number: the number to be shifted
* @param shift: the number of bits to remove at the end of the number (in binary notation)
* @return the number, shifted
**/
function rshift(number, shift){
  return Math.floor(number / Math.pow(2, shift));
}

/**
* This function extracts certain bits of a number
* @param number: the number to extract bits from
* @param start: first bit to read, starting at bit 0
* @param end (optional): number of bits to read. By default, one bit is read
* @return a number representing the bits extracted
**/
function bit(number, start, end){
  return rshift(number, start) & (Math.pow(2, (end || start) - start + 1) - 1);
}

/**
* This function performs a binary right rotation on a number
* @param number: the number to rotate
* @param length: the length of the bumber (in bits, with leading zeros if any)
* @param bits: the number of bits to rotate, starting at bit 0
* @return the number, rotated
**/
function ror(number, length, bits){
  return lshift((number & Math.pow(2, bits) - 1), length - bits) + rshift(number, bits);
}


/* MINIFIED CODE */
function lshift(b,a){return b*Math.pow(2,a)}
function rshift(b,a){return Math.floor(b/Math.pow(2,a))}
function bit(b,a,c){return rshift(b,a)&Math.pow(2,(c||a)-a+1)-1}
function ror(b,c,a){return lshift(b&Math.pow(2,a)-1,c-a)+rshift(b,a)};