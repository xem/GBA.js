<?php
header("Content-Type: text/javascript; charset=utf-8");
function minify($buffer){
  $tmp = $buffer;

  $buffer = str_replace("\n", "\n  ", $buffer);
  
  // JS shortcuts
  /*$buffer = str_replace("$", "$", $buffer);
  $buffer = str_replace("new ArrayBuffer", "A", $buffer);
  $buffer = str_replace("new Uint8Array", "B", $buffer);
  $buffer = str_replace("new Uint16Array", "C", $buffer);
  $buffer = str_replace("new Uint32Array", "D", $buffer);
  $buffer = str_replace("Math", "M", $buffer);*/

  // ARM
  /*$buffer = str_replace("arm_bx", "aa", $buffer);
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
  $buffer = str_replace("armbc_rrn", "aq", $buffer);
  $buffer = str_replace("armbc_ri", "ar", $buffer);
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
  */

  // GBA.js globals
  /*$buffer = str_replace("canvas", "a", $buffer);
  $buffer = str_replace('"a"', '"canvas"', $buffer);
  $buffer = str_replace("imagedata", "b", $buffer);
  $buffer = str_replace("cpsr", "c", $buffer);
  $buffer = str_replace("c_", "cpsr_", $buffer);
  $buffer = str_replace("spsr", "d", $buffer);
  $buffer = str_replace("s_", "spsr_", $buffer);
  $buffer = str_replace("thumb", "e", $buffer);
  $buffer = str_replace('"e"', '"thumb"', $buffer);
  $buffer = str_replace("arm_opcode", "g", $buffer);
  $buffer = str_replace("arm_params", "h", $buffer);
  $buffer = str_replace("arm_asm", "j", $buffer);
  $buffer = str_replace("arm_cond", "k", $buffer);
  $buffer = str_replace("thumb_opcode", "l", $buffer);
  $buffer = str_replace("thumb_params", "n", $buffer);
  $buffer = str_replace("thumb_asm", "o", $buffer);
  $buffer = str_replace("condnames", "p", $buffer);

  $buffer = str_replace("mem", "q", $buffer);

  $buffer = str_replace("convert_ARM", "E", $buffer);
  $buffer = str_replace("convert_THUMB", "F", $buffer);

  $buffer = str_replace("lshift", "G", $buffer);
  $buffer = str_replace("rshift", "H", $buffer);
  $buffer = str_replace("bit", "I", $buffer);
  $buffer = str_replace("function J", "function hex", $buffer);
  $buffer = str_replace("ror", "K", $buffer);*/

  //$buffer .= "// Before: " . strlen($tmp) . ", now: " . strlen($buffer);
  return $buffer;
}
ob_start();

include("../src/dom.js");
include("../src/cpu.js");
include("../src/memory.js");
include("../src/screen.js");
include("../src/load.js");
include("../src/convert.js");
include("../src/trace.js");
include("../src/play.js");
include("../src/thumb.js");
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
<?php echo "*      ( in " . (strlen($out) + 530) . " bytes )                  *\n"; ?>
\******************************************/

(function(){

  <?php


echo minify($out);
// echo $out;
?>

})()