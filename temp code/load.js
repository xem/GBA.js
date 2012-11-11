/** 
* This code loads the game ROM in memory
**/

/* HUMAN-READABLE CODE */                               // AJAX object
  xhr.addEventListener('progress', function(e){         // When the file is loading
    if(progressbar){
      progressbar.value = e.loaded / e.total;           // Update the progressbar
    }
  });
  xhr.open('GET', file);                                // Open the file
  xhr.responseType = 'arraybuffer';                     // Read it as an arrayuffer
  xhr.onload = function(){                              // When the file is loaded
    if(typeof VBArray != 'undefined'){                  // On IE
      m[0x8] = VBArray(xhr.responseBody).toArray();     // Use a VBArray to convert the response body to a bytes array
    }
    else {                                              // On other browsers
      m[0x8] = new Uint8Array(xhr.response);            // Use an array buffer to convert the response to a bytes array
    }
    if(progressbar){
      progressbar.style.visibility = 'hidden';          // Hide the progressbar
    }
    play();                                             // Play the game ROM
  }

  xhr.send();                                           // Send the AJAX request

  if(progressbar){
    progressbar.style.visibility = 'visible';           // Show the progressbar
  }

/* HAND-OPTIMIZED CODE */
xhr.addEventListener('progress', function(e){
 if(progressbar) progressbar.value = e.loaded / e.total;
});
xhr.open('GET', file);
xhr.responseType = 'arraybuffer';
xhr.onload = function(){
  m[0x8] = typeof VBArray != 'undefined' ? VBArray(xhr.responseBody).toArray() : new Uint8Array(xhr.response);
  progressbar.style.visibility = 'hidden';
  play();
}
xhr.send();
if(progressbar) progressbar.style.visibility = 'visible';

/* CODE HANDLING IE10 */
xhr.addEventListener('progress', function(e){
 if(progressbar) progressbar.value = e.loaded / e.total;
});
xhr.open('GET', file);
xhr.responseType = 'arraybuffer';
xhr.onload = function(){
  m[0x8] = (ie&&ie<10) ? VBArray(xhr.responseBody).toArray() : new Uint8Array(xhr.response);
  progressbar.style.visibility = 'hidden';
  play();
}
xhr.send();
if(progressbar) progressbar.style.visibility = 'visible';

/* HUMAN-READABLE CODE MINIFIED */
xhr.addEventListener("progress",function(a){progressbar&&(progressbar.value=a.loaded/a.total)});xhr.open("GET",file);xhr.responseType="arraybuffer";xhr.onload=function(){m[8]="undefined"!=typeof VBArray?VBArray(xhr.responseBody).toArray():new Uint8Array(xhr.response);progressbar&&(progressbar.style.visibility="hidden");play()};xhr.send();progressbar&&(progressbar.style.visibility="visible");

/* HAND-OPTIMIZED CODE MINIFIED */
xhr.addEventListener("progress",function(a){progressbar&&(progressbar.value=a.loaded/a.total)});xhr.open("GET",file);xhr.responseType="arraybuffer";xhr.onload=function(){m[8]="undefined"!=typeof VBArray?VBArray(xhr.responseBody).toArray():new Uint8Array(xhr.response);progressbar.style.visibility="hidden";play()};xhr.send();progressbar&&(progressbar.style.visibility="visible");

/* CODE HANDLING IE10 MINIFIED */
xhr.addEventListener("progress",function(a){progressbar&&(progressbar.value=a.loaded/a.total)});xhr.open("GET",file);xhr.responseType="arraybuffer";xhr.onload=function(){m[8]=(ie&&ie<10)?VBArray(xhr.responseBody).toArray():new Uint8Array(xhr.response);progressbar.style.visibility="hidden";play()};xhr.send();progressbar&&(progressbar.style.visibility="visible");