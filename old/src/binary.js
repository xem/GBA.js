/**binary **/

/*
 * lshift()
 * left shift
 * lshift(a,b) returns the correct value of a << b
 */
var lshift = function(number, shift){
  return number * Math.pow(2, shift);
}

/*
 * rshift()
 * right shift
 * rshift(a,b) returns the correct value of a >> b
 */
var rshift = function(number, shift){
  return Math.floor(number / Math.pow(2, shift));
}

/*
 * b()
 * Extracts some bits in the binary representation of a number
 */
var b = function(number, start, end){
  return rshift(number, start) & (Math.pow(2, (end || start) - start + 1) - 1);
}

/*
 * ror()
 * perform a right rotation in the binary representation of a number
 */
var ror = function(number, length, bits){
  return lshift((number & Math.pow(2,bits) - 1), length -bits) + rshift(number, bits);
}

/*
 * x()
 * Write a number in hexadecimal
 * @param n: the number
 * @param i (optional): the length of the hexadecimal value, with leading zeros
 */
x = function(n, i){
    return ((i ? "0000000" : "") + n.toString(16).toUpperCase()).slice(-i);
}

