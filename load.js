/** load() **/
// Load a ROM, put its data in m8 and convert it in ARM and THUMB instructions.
// @param p: the ROM's path
function load(p){

  // Use AJAX to read the ROM as an arraybuffer
  xhr = new XMLHttpRequest;
  xhr.open('GET', p);
  xhr.responseType = 'arraybuffer';
  xhr.send();
  xhr.onload = function(){
    
    m[8] = xhr.response;
    m8[8] = new Uint8Array(m[8]);
    m16[8] = new Uint16Array(m[8]);
    m32[8] = new Uint32Array(m[8]);
  }
}
