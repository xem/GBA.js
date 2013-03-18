/*******
  VRAM
********/

GBA.vram = function(address, value, bytes){
  var pr, pg, pb, pr2, pg2, pb2;                          // temp color values

  pr = GBA.bit(value, 0, 4) * 8;                          // get red value of pixel (bits 0-4)
  pg = GBA.bit(value, 5, 9) * 8;                          // get green value of pixel (bits 5-9)
  pb = GBA.bit(value, 10, 14) * 8;                        // get blue value of pixel (bits 10-14)

  if(bytes == 4){                                         // If 4 bytes are set, 2 pixels are drawn
    pr2 = GBA.bit(value, 0, 4) * 8;                       // get red value of pixel 2 (bits 0-4)
    pg2 = GBA.bit(value, 5, 9) * 8;                       // get green value of pixel 2 (bits 5-9)
    pb2 = GBA.bit(value, 10, 14) * 8;                     // get blue value of pixel 2 (bits 10-14)
  }                                                       

  //switch(dispcnt_m){                                      
  //  case 0x3:                                           // in mode 3
      GBA.pixels.data[address * 2] = pr;                  // set the pixel's red value
      GBA.pixels.data[address * 2 + 1] = pg;              // set the pixel's green value
      GBA.pixels.data[address * 2 + 2] = pb;              // set the pixel's blue value
      GBA.pixels.data[address * 2 + 3] = 255;             // set the pixel's alpha value (totally opaque)

      if(bytes == 4){                                     // if we draw 2 pixels
        GBA.pixels.data[address * 2 + 4] = pr2;           // set the pixel 2's red value
        GBA.pixels.data[address * 2 + 5] = pg2;           // set the pixel 2's green value
        GBA.pixels.data[address * 2 + 6] = pb2;           // set the pixel 2's blue value
        GBA.pixels.data[address * 2 + 7] = 255;           // set the pixel 2's alpha value (totally opaque)
  //    }
  //    break;
  }
}
