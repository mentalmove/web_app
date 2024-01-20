function iD (x) {
    return document.getElementById(x);
}
function remove_me (el) {
   if ( el && el.parentNode )
      el.parentNode.removeChild(el);
}
function invalidated () {}
function random_colour (element) {
   if ( !element )
      return;
   var r, g, b, lightness;
   do {
      r = Math.floor(Math.random() * 240) + 16;
      g = Math.floor(Math.random() * 240) + 16;
      b = Math.floor(Math.random() * 240) + 16;
      lightness = Math.sqrt(Math.pow(r, 2) + Math.pow(g, 2) + Math.pow(b, 2)) / Math.sqrt(3);
   }
   while ( lightness < 172 && g > r && g > b );
   var colour = "#" + r.toString(16) + g.toString(16) + b.toString(16);
   element.backgroundColour = [r, g, b];
   element.style.backgroundColor = colour;
   if ( lightness >= 172 )
      element.style.color = "#181818";
   return element;
}
function sort_asc (a, b) {
   return a - b;
}

function load_styles (u, script) {
   if ( !window.io ) {
      setTimeout(load_styles, 17, u, script);
      return;
   }
   if ( (typeof u).toUpperCase() != "STRING" ) {
      for ( var i = 0; i < u.length; i++ ) {
         if ( i < (u.length - 1) || !script )
            load_styles(u[i]);
         else
            load_styles(u[i], script);
      }
      return;
   }
   var callback = null;
   if ( script )
      callback = function () {
         io.ls(script);
      };
   io.css(u, callback);
}

var APPTYPE, APPOS;
if ( !window.navigator || !navigator.userAgent || !navigator.platform ) {
   APPTYPE = "DESKTOP";
}
else {
   if ( /IP(HONE|AD|OD)/.test(navigator.userAgent.toUpperCase()) || /IP(HONE|AD|OD)/.test(navigator.platform.toUpperCase()) )
      APPOS = "IOS";
   else {
      if ( /ANDROID/.test(navigator.userAgent.toUpperCase()) )
         APPOS = "ANDROID";
  }
  if ( APPOS )
      APPTYPE = "MOBILE";
  else {
      APPTYPE = "DESKTOP";
      APPOS = navigator.platform;
  }
}
if ( APPTYPE == "MOBILE" ) {
   load_styles( "mobile_main", "code/view/mobile_main_companion" );
   var POINTERDOWN = "touchstart";
   var POINTERUP = "touchend";
   var POINTERMOVE = "touchmove";
   var POINTERCANCEL = "touchcancel";
   var POINTEROUT = "pointerout";
   var KEYUP = "change";
}
else {
   var POINTERDOWN = "pointerdown";
   var POINTERUP = "pointerup";
   var POINTERMOVE = "pointermove";
   var POINTERCANCEL = "pointercancel";
   var POINTEROUT = "pointerout";
   var KEYUP = "keyup";
}
