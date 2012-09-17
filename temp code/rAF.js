/** Cross-browser requestAnimationFrame
* Uses setTimeout as a fallback.
* Keeps a framerate as close to 60fps as possible.
* @url http://paulirish.com/2011/requestanimationframe-for-smart-animating
**/

/* HUMAN-READABLE CODE */
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
}());

/* HUMAN-READABLE CODE MINIFIED */
for(t=0,v=["ms","moz","webkit","o"],i=0;i<v.length&&!window.requestAnimationFrame;++i)window.requestAnimationFrame=window[v[i]+"RequestAnimationFrame"],window.a=window[v[i]+"CancelAnimationFrame"]||window[v[i]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(g){var d=(new Date).getTime(),e=Math.max(0,16-(d-t)),h=window.setTimeout(function(){g(d+e)},e);t=d+e;return h});