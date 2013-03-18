 GBA.js ~ A HTML5 GBA emulator
===============================

* Super-complete: GBA.js is bundled with 694 free GBA homebrews hosted with their authors' permission. Two are playable!
* Super-fast: GBA.js instantaneously executes millions of operations!
* Super-compatible: GBA.js works on IE9+, Firefox, Chrome...
* Super-lightweight: GBA.js source currently weighs 65kb / 15k minified / 4k gzipped and has no dependencies
<br>
<br>

***

Demo
====

http://xem.github.com/GBA.js
<br>
<br>

***

How to use it
=============

* In development, include the JavaScript files present in the folder "/src" in your HTML &lt;head>, starting with "gba.js".
* In production, include "gba.min.js" in your HTML &lt;head>.


To launch a ROM, call the function "GBA.play()" with three parameters:
- the ROM path.
- a canvas element.
- a progressbar/input element.
<br>
<br>

***

Documentation
=============

gba.js
------
This file must be placed first. It introduces the "GBA" object.
This object contains structures representing the various GBA registers and its memory.
The following source files will populate this object with many functions.


gba.play.js
-----------
This file introduces GBA.play().
This function loads the ROM in memory, and calls GBA.convert() and GBA.loop().


gba.convert.js
--------------
This file introduces GBA.convert().
This function converts the ROM from its original format (a bytes array) to:
- A word array
- A halfword array
- An array of ARM instructions with the right parameters
- An array of THUMB instructions with the right parameters


gba.loop.js
-----------
This file introduces GBA.loop().
This function executes the ROM opcodes in the right order and with the right parameters and contexts.
TODO: thread it.


gba.arm.js
----------
This file introduces one function for each executable ARM opcode.


gba.thumb.js
------------
This file introduces one function for each executable THUMB opcode.


gba.mem.js
----------
This file introduces GBA.mem(), often used when executing opcodes.
This function abstracts the access to the memory and accepts 4 parameters:
- An address
- A size in bytes (1, 2 or 4)
- A value (optional)
- A bit mask (optional)

mem(address, size) reads data from memory.

mem(address, size, value) writes data in memory.

mem(address, size, value, mask) writes data in memory with a bit mask applied to it.

Writing in I/O (@0x4*******) or in VRAM (@0x6*******) memories provoke respectively a call to GBA.io() and GBA.vram().


gba.bin.js
----------
This file introduces binary operations, often used when executing opcodes.
- GBA.lshift(): left shift
- GBA.rshift(): right shift
- GBA.ror(): right binary rotation
- GBA.bit(): bit field extraction


gba.io.js
---------
todo


gba.vram.js
-----------
todo