/** Loops **/

/*
 * loops
 * A loop counter.
 * Values:
 * -1: no loop
 * 0: loop suspected
 * 1+: looping, number of loops made
 */
var loops = -1;

/*
 * detect_loop
 * if an instruction branches to a near, lower address (between N-20 and N),
 * a loop can be suspected. It is confirmed if the same branch is made twice.
 * This information can be use for debug purpose, and to make optimizations.
 * @param a: the address, that will be compared to PC.
 */
var detect_loop = function(a){

  // Count loops
  if(a < r[15] && a > r[15] - 20){
    loops ++;
  }

  // Debug
  if(debug){
    $("endloop").disabled = false;
  }
}

/*
 * loop_end
 * This function is called when a loop ends.
 * If a loop is running and the looping branch isn't made, the loop counter is reset.
 */
var loop_end = function(){

  // reset loop counter
  loops = -1;

  // Debug
  if(debug){
    $("endloop").disabled = true;
  }
}

/*
 * end_current_loop
 * For debug purpose only
 * Executes the next instructions while a loop is running.
 */
end_current_loop = function(){
  var debug_backup = debug;
  debug = false;
  while(loops > -1){
    trace();
  }
  debug = debug_backup;
  loop_end();
  if(debug){
    update_debug_interface();
  }
}

