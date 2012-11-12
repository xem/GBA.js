GBA.js
======

A GameBoy Advance (GBA) emulator in your browser!

Online demo available on http://xem.github.com/GBA.js.

Here's the HTML code needed to use it:

    <!doctype html>
    <html>
    <head>
      <meta charset=utf-8>
      <title>GBA.js</title>
    </head>
    <body>
      <progress id=progress></progress>
      <canvas id=screen width=240 height=160></canvas>
      <script src=GBA.js></script>
      <script>gba('test.gba', document.getElementById('screen'), document.getElementById('progress'));</script>
    </body>
    </html>

Progress:

    - Gather free GBA homebrews:  done! (694 ROMs used with authorization, 1 ROM runs!)
    - Initializations:            done! (Global vars, default registers, canvas)
    - ROM Loader:                 done! (AJAX load, conversion in bytes array, IE fix)
    - Memory read/write :         done! (Little-Endian, 1/2/4byte, mask, mirror, IO, VRAM)
    - Binary operations:          done! (Left/right shift, rotation, bit extraction)
    - Main loop:                  30%   (loop, dispatch ARM/THUMB instructions, end)
    - CPU ARM/THUMB instructions: 50%   (ARM 3,4,5,6,9 - THUMB 1-10, 14-16,18,19)
    - Graphics:                   15%   (requestAnimationFrame, MODE 3)
    - BIOS funtions:              0%
    - Controls:                   0%
    - Sound:                      0%
    - Optimizations:              0%
    - Save/load:                  0%
    - Multiplayer:                0%
    - Read zips:                  0%


GBA.js also aims to be as light as possible:
the emulator (and its debugger) takes just one file, just one function,
and its code minified and gzipped is currently under 3.5ko!