/*******
  Load
********/

GBA.load = function(file){

  // Initialize I/O registers
  GBA.mem(0x4000088, 2, 0x0200);                          // SOUNDBIAS
  GBA.mem(0x4000802, 2, 0x0D00);                          // REG_IMC_H

  // Load ROM
  var xhr = new XMLHttpRequest;                           // AJAX object
  xhr.open('GET', file);                                  // open the file
  xhr.responseType = 'arraybuffer';                       // read it as an array buffer
  xhr.send();                                             // send the AJAX request
  xhr.addEventListener('progress', function(e){           // when the file is loading
    //progressbar.value = e.loaded / e.total;             // update the progressbar
  });
  xhr.onload = function(){                                // when the file is loaded:
    GBA.m[8] = navigator.userAgent.indexOf("IE 9") !== -1 // copy its bytes at 0x08000000
               ? VBArray(xhr.responseBody).toArray()      // on IE9, use a VBArray
               : new Uint8Array(xhr.response);            // on other browsers, use an array buffer
    GBA.convert();                                        // convert the ROM
    GBA.loop();                                           // play the ROM
  }
}