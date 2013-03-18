<pre>
<?php
function minify($buffer){
  $tmp = $buffer;
  $buffer = str_replace("canvas", "_c", $buffer);
  $buffer = str_replace("pixels", "_p", $buffer);
  $buffer = str_replace("trace", "_t", $buffer);
  $buffer = str_replace("rom_arm", "ra", $buffer);
  $buffer = str_replace("rom_thumb", "rt", $buffer);
  $buffer = str_replace("rom_word", "rw", $buffer);
  $buffer = str_replace("rom_halfword", "rh", $buffer);
  $buffer = str_replace("xhr", "_x", $buffer);
  $buffer = str_replace("convert", "fc", $buffer);
  $buffer = str_replace("loop", "fl", $buffer);
  $buffer = str_replace("lshift", "ls", $buffer);
  $buffer = str_replace("rshift", "rs", $buffer);
  $buffer = str_replace("GBA", "G", $buffer);
  echo "<title> Before: " . strlen($tmp) . ", now: " . strlen($buffer) . "</title>";
  return $buffer;
}
ob_start();

include("src/gba.js");
include("src/gba.play.js");
include("src/gba.convert.js");
include("src/gba.loop.js");
include("src/gba.arm.js");
include("src/gba.thumb.js");
include("src/gba.bin.js");
include("src/gba.mem.js");
include("src/gba.vram.js");

$out = ob_get_contents();
ob_end_clean();
echo minify($out);
echo "GBA=G;";