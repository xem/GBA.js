/** binary **/

/*
 * lshift()
 * left shift.
 * lshift(a,b) returns the correct value of a << b.
 */
function lshift(number, shift){
  return number * Math.pow(2, shift);
}

/*
 * rshift()
 * right shift.
 * rshift(a,b) returns the correct value of a >> b.
 */
function rshift(number, shift){
  return Math.floor(number / Math.pow(2, shift));
}

/*
 * bit()
 * Extracts some bits in the binary representation of a number.
 */
function bit(number, start, end){
  return rshift(number, start) & (Math.pow(2, (end || start) - start + 1) - 1);
}

/*
 * ror()
 * perform a right rotation in the binary representation of a number.
 */
function ror(number, length, bits){
  return lshift((number & Math.pow(2, bits) - 1), length - bits) + rshift(number, bits);
}

/*
 * hex()
 * Write a number in hexadecimal.
 * @param n: the number.
 * @param i (optional): the length of the hexadecimal value, with leading zeros.
 */
function hex(n,i){
    return ((i ? "0000000" : "") + n.toString(16).toUpperCase()).slice(-i);
}

