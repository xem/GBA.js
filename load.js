/** load() **/
// Load a ROM, put its data in m8 and convert it in ARM and THUMB instructions.
// @param p: the ROM's path
function load(p){

  // Vars
  var i, xhr;

  // Use AJAX to read the ROM as an arraybuffer
  xhr = new XMLHttpRequest;
  xhr.open('GET', p);
  xhr.responseType = 'arraybuffer';
  xhr.send();
  xhr.onload = function(){

    // Add it to the memory
    m[8] = xhr.response;

    // Create 8-bits, 16-bits and 32-bits views of the 8 memory sections
    for(i = 0; i < 16; i++){
      if(m[i]){
        m8[i] = new Uint8Array(m[i]);
        m16[i] = new Uint16Array(m[i]);
        m32[i] = new Uint32Array(m[i]);
      }
    }

  }
}
