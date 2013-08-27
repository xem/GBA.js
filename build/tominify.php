<?php
function minify($buffer){
  $tmp = $buffer;
  
  $buffer = str_replace("document.getElementById", "$", $buffer);
  $buffer = str_replace("new ArrayBuffer", "A", $buffer);
  $buffer = str_replace("new Uint8Array", "B", $buffer);
  $buffer = str_replace("new Uint16Array", "C", $buffer);
  $buffer = str_replace("new Uint32Array", "D", $buffer);
  $buffer = str_replace("Math", "M", $buffer);
  
  $buffer = str_replace("arm_bx", "aa", $buffer);
  $buffer = str_replace("arm_blx", "ab", $buffer);

  $buffer = str_replace("arm_b", "ac", $buffer);
  $buffer = str_replace("arm_bl", "ad", $buffer);

  $buffer = str_replace("arm_and_rrn", "ae", $buffer);
  $buffer = str_replace("arm_and_ri", "af", $buffer);
  $buffer = str_replace("arm_eor_rrn", "ag", $buffer);
  $buffer = str_replace("arm_eor_ri", "ah", $buffer);
  $buffer = str_replace("arm_sub_rrn", "ai", $buffer);
  $buffer = str_replace("arm_sub_ri", "aj", $buffer);
  $buffer = str_replace("arm_rsb_rrn", "ak", $buffer);
  $buffer = str_replace("arm_rsb_ri", "al", $buffer);
  $buffer = str_replace("arm_add_rrn", "am", $buffer);
  $buffer = str_replace("arm_add_ri", "an", $buffer);
  $buffer = str_replace("arm_adc_rrn", "aok", $buffer);
  $buffer = str_replace("arm_adc_ri", "ap", $buffer);
  $buffer = str_replace("arm_sbc_rrn", "aq", $buffer);
  $buffer = str_replace("arm_sbc_ri", "ar", $buffer);
  $buffer = str_replace("arm_rsc_rrn", "as", $buffer);
  $buffer = str_replace("arm_rsc_ri", "at", $buffer);
  $buffer = str_replace("arm_tst_rn", "au", $buffer);
  $buffer = str_replace("arm_teq_rn", "av", $buffer);
  $buffer = str_replace("arm_cmp_rn", "aw", $buffer);
  $buffer = str_replace("arm_cmn_rn", "ax", $buffer);
  $buffer = str_replace("arm_orr_rrn", "ay", $buffer);
  $buffer = str_replace("arm_orr_ri", "az", $buffer);
  $buffer = str_replace("arm_mov_rn", "ba", $buffer);
  $buffer = str_replace("arm_bic_rrn", "bb", $buffer);
  $buffer = str_replace("arm_bic_ri", "bc", $buffer);
  $buffer = str_replace("arm_mvn_rn", "bd", $buffer);

  $buffer = str_replace("arm_mrs_cpsr", "be", $buffer);
  $buffer = str_replace("arm_mrs_spsr", "bf", $buffer);
  $buffer = str_replace("arm_msr_cpsr", "bg", $buffer);
  $buffer = str_replace("arm_msr_spsr", "bh", $buffer);

  $buffer = str_replace("arm_str_rrn", "bi", $buffer);
  $buffer = str_replace("arm_str_ri", "bj", $buffer);
  $buffer = str_replace("arm_ldr_rrn", "bk", $buffer);
  $buffer = str_replace("arm_ldr_ri", "bl", $buffer);
  
  $buffer = str_replace("canvas", "a", $buffer);
  $buffer = str_replace('"a"', '"canvas"', $buffer);
  $buffer = str_replace("imagedata", "b", $buffer);
  $buffer = str_replace("cpsr", "c", $buffer);
  $buffer = str_replace("spsr", "d", $buffer);
  $buffer = str_replace("arm_opcode", "e", $buffer);
  $buffer = str_replace("arm_params", "f1", $buffer);
  $buffer = str_replace("arm_asm", "g", $buffer);
  $buffer = str_replace("arm_cond", "h", $buffer);
  $buffer = str_replace("thumb_opcode", "i", $buffer);
  $buffer = str_replace("thumb_params", "j", $buffer);
  $buffer = str_replace("thumb_asm", "k", $buffer);
  $buffer = str_replace("condnames", "n", $buffer);

  $buffer = str_replace("mem", "o", $buffer);

  $buffer = str_replace("convert_ARM", "p", $buffer);
  $buffer = str_replace("convert_THUMB", "q", $buffer);
  
  $buffer = str_replace("lshift", "s", $buffer);
  $buffer = str_replace("rshift", "t", $buffer);
  $buffer = str_replace("bit", "u", $buffer);
  $buffer = str_replace("ror", "v", $buffer);
  $buffer = str_replace("hex", "x", $buffer);
  $buffer = str_replace("function x", "function hex", $buffer);

  // echo "<title> Before: " . strlen($tmp) . ", now: " . strlen($buffer) . "</title>";
  return $buffer;
}
ob_start();

include("../src/globals.js");
include("../src/cpu.js");
include("../src/memory.js");
include("../src/screen.js");
include("../src/load.js");
include("../src/convert.js");
include("../src/trace.js");
include("../src/play.js");
include("../src/arm.js");
include("../src/binary.js");

$out = ob_get_contents();
ob_end_clean();
?>
/******************************************\
*   _____   ____                  _        *
*  / ____| |  _ \     /\         (_)       *
* | |  __  | |_) |   /  \         _   ___  *
* | | |_ | |  _ <   / /\ \       | | / __| *
* | |__| | | |_) | / ____ \   _  | | \__ \ *
*  \_____| |____/ /_/    \_\ (_) | | |___/ *
*                               _/ |       *
*  == A HTML5 GBA EMULATOR ==  |__/        *
\******************************************/

/** Shortcuts **/

function $(i){return document.getElementById(i)}
function A(i){return new ArrayBuffer(i)}
function B(i){return new Uint8Array(i)}
function C(i){return new Uint16Array(i)}
function D(i){return new Uint32Array(i)}

<?php
echo minify($out);
// echo $out;
?>

x = hex;
M = Math;