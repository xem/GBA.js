/************/
/** GBA.js **/
/************/

/** Debug tools **/

// Debug mode disabled by default
debug_mode = false;

// Trace mode (step-by-step execution), disabled by default
trace_mode = false

// x: write a number in hexadecimal
// @param n: the number
// @param i (optional): the length of the hexadecimal value, with leading zeros (max: 8)
x = function(n,i){return((i?1e7:"")+n.toString(16).toUpperCase()).slice(-i)}

// Debug page initialization
init_debugger = function(){

  var html;

  // Enable debug mode
  debug_mode = true;

  // Populate ARM debugger
  html="<b>ARM</b><br>";for(i=0x8000000;i<=0x8001000;i+=4){if((i>0x8000000&&i<0x80000C0)||(i>0x80000C0&&i<0x80000E0)){continue}html+="<span id=debug_arm_"+x(i)+">"+x(i)+" <span id=debug_arm_value_"+x(i)+">????????</span> <span id=debug_arm_name_"+x(i)+">?</span></span>\n";if(i==0x8000000||i==0x80000C0){html += "...\n"}}debug_arm.innerHTML=html;

  // Populate THUMB debugger
  html="<b>THUMB</b><br>";for(i=0x8000000;i<=0x8001000;i+=2)0x8000000==i&&(html+="...\n"),0x80000E0>i||(html+="<span id=debug_thumb_"+x(i)+"><span id=debug_thumb_address_"+x(i)+">"+x(i)+"</span> <span id=debug_thumb_value_"+x(i)+">????</span> <span id=debug_thumb_name_"+x(i)+">?</span></span>\n");debug_thumb.innerHTML=html;

  // Populate IWRAM debugger
  html="<b>WRAM</b><br>";for(i=0x3008000;i>=0x3000000;i-=4)html+=x(i)+" <span id=memory"+x(i)+">00000000</span>\n";debug_wram.innerHTML=html;

  // Highlight first ARM instruction
  debug_arm_8000000.className = "debug_highlight";
}