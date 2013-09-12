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

