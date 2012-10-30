GBA.js
======

A GameBoy Advance (GBA) emulator in your browser!

Online demo and making-of available on http://xem.github.com/GBA.js.

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

    - Gather free GBA homebrews:  done! (694 ROMs used with authorization)              705Mb
    - Initializations:            done! (Global vars, default registers)                0,379Kb
    - ROM Loader:                 done! (AJAX, conversion in bytes array, IE9 fix)      0,379Kb
    - Memory read/write :         done! (Little-Endian, 8/16/32bit, mask, mirrors)      0,586Kb
    - Binary operations:          done! (Left/right shift, rotation, bit extraction)    0,236Kb
    - Main loop:                  20%   (loop, dispatch ARM/THUMB instructions)         0,198Kb
    - CPU ARM/THUMB instructions: 40%   (ARM 3/4/5~/6/7/9 done - THUMB 1-6~,15,16,19~)  6,286kb
    - Graphics:                   10%   (requestAnimationFrame polyfill)                0,423Kb
    - BIOS funtions:              0%
    - Controls:                   0%
    - Sound:                      0%
    - Optimizations:              0%
    - Save/load:                  0%
    - Multiplayer:                0%
    - Read zips:                  0%