/** DOM **/

/*
 * $
 * Shortcut to select an element
 * @param i: the element's id
 */
$ = function(i){
  return document.getElementById(i);
}

/*
 * canvas, imagedata
 * The GBA's screen has four layers, each of them is represented by a canvas
 * There are four ImageData to edit each canvas as a bitmap
 */
var canvas = [];
var imagedata = [];
for(var i = 0; i < 4; i++){
  canvas.push($("canvas" + i).getContext("2d"));
  imagedata.push(canvas[i].createImageData(240, 160));
}

/*
 * update_debug_interface
 * for debug purpose only
 * update ROM, RAM, CPU flags and registers
 */
var update_debug_interface = function(){

  // Disable current highlight
  if(debug){
    document.getElementsByClassName("highlight")[0].className = "";
  }

  if(thumb){
    instr = $("thumb" + x(r[15]));
    instr.className = "highlight";
  }
  else{
    instr = $("arm" + x(r[15]));
    instr.className = "highlight";
  }
  instr.parentNode.scrollTop = instr.offsetTop - 100;

  // Update registers
  for(i = 0; i <= 16; i++){
    $("r" + i).innerHTML = x(r[i], 8);
  }

  // Update cpsr
  $("cpsr").innerHTML = x(cpsr, 8);

  // Update spsr
  $("spsr").innerHTML = x(spsr, 8);

  // Update flags
  $("flagn").checked = !!b(cpsr, 31);
  $("flagz").checked = !!b(cpsr, 30);
  $("flagc").checked = !!b(cpsr, 29);
  $("flagv").checked = !!b(cpsr, 28);
  $("flagi").checked = !!b(cpsr, 7);
  $("flagf").checked = !!b(cpsr, 6);
  $("flagt").checked = !!b(cpsr, 5);
  $("flagq").checked = !!b(cpsr, 27);
}