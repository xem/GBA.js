/** Screen **/
// The GBA's screen has four layers, each of them is represented by a canvas.
// There are four ImageData to edit each canvas as a bitmap.
canvas = [];
imagedata = [];
for(i = 0; i < 4; i++){
  canvas.push($("canvas" + i).getContext("2d"));
  imagedata.push(canvas[i].createImageData(240, 160));
}
