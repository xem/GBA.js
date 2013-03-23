/*********
  Worker
**********/

// Import useful scripts
importScripts("gba.js", "gba.load.js", "gba.convert.js", "gba.loop.js", "gba.arm.js", "gba.thumb.js", "gba.mem.js", "gba.bin.js" , "gba.vram_worker.js");

// Handle messages
self.onmessage = function(e) { 
  
  // Load a ROM
  if(e.data.file){
    GBA.load("../" + e.data.file);
  }
  
}