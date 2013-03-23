/*******
  Play
********/

/** @expose */
play = function(file, canvas, progressbar){

  // Test canvas support
  if(!window.HTMLCanvasElement){                          // if canvas isn't supported
    return;                                               // stop the emulation
  }
  
  // Initialize canvas
  GBA.canvas = canvas.getContext("2d");
  GBA.pixels = GBA.canvas.createImageData(240, 160);

  // Test Web Worker support
  if(window.Worker){                                      // if workers are supported:
    GBA.worker = new Worker("src/gba.worker.js");         // start a worker
    GBA.worker.postMessage({"file": file});               // send the file to load
    
    // Handle messages
    GBA.worker.onmessage = function(e){                   // log its messages
      
      // VRAM
      if(e.data.vram){
        GBA.vram(e.data.vram[0], e.data.vram[1], e.data.vram[2]);
      }
      
      else{
        console.log(e.data);
      }
    }
  }
  else{                                                   // else (mainly on IE9):
    GBA.load(file);                                       // load the ROM
  }
  
  setInterval(function(){
    GBA.canvas.putImageData(GBA.pixels, 0, 0);            // display the pixels
  },500);
}
