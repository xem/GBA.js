/** ROM loader **/

/*
 * load()
 * Load a ROM, save it in the memory and create different views
 * @param p: the ROM's path
 */
function load(p){

  // Vars
  var i, xhr;

  // Load and read the ROM as an arraybuffer
  xhr = new XMLHttpRequest;
  xhr.open('GET', p);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  // When it is loaded:
  xhr.onload = function(){

    // Add it in the memory
    m[8] = xhr.response;

    // Create 8-bits, 16-bits and 32-bits views of the 8 memory sections
    for(i = 0; i < 16; i++){
      if(m[i]){
        m8[i] = new Uint8Array(m[i]);
        m16[i] = new Uint16Array(m[i]);
        m32[i] = new Uint32Array(m[i]);
      }
    }

    // Convert the first ARM instruction
    convert_ARM(0);
  }
}

