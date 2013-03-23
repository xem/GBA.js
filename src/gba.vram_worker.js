/**********************
  VRAM for the worker
***********************/

GBA.vram_worker = function(address, value, bytes){
  self.postMessage({vram:[address, value, bytes]});
}
