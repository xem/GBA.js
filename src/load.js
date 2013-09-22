/** ROM loader **/

/*
 * load()
 * Load a ROM, save it in the memory and create different views
 * @param p: the ROM's path
 * @param c (optional): the function to call when rhe ROM is loaded (usually, "play")
 */
load = function(p, c){

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

    // Temp
    //debug=false;
    // for(i = 30; i--;){
      // trace();
    // }
    // end_current_loop();
    // for(i = 160; i--;){
      // trace();
    // }
    //debug=true;
    // trace();

    // Callback
    if(c){
      c();
    }
  }
}

