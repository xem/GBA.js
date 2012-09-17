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
      <script> emulate('test.gba', document.getElementById('screen'), document.getElementById('progress'));</script>
    </body>
    </html>


Progress:

- ROM Loader:                 100%
- Read/write in the memories: 100%
- CPU THUMB instructions:     in progress...
- CPU ARM instructions:       0%
- BIOS funtions:              0%
- Graphics:                   0%
- Controls:                   0%
- Sound:                      0%
- Save:                       0%
- Multiplayer:                0%

