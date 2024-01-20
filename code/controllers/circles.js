function Circles (content) {

   /**
    * Private properties
    */
   var circles = content.querySelectorAll(".circle");
   var size = 0;
   var single_size = 0;
   var active = false;
   var active_element;
   var coordinates = [0, 0];
   var css_classes = [];


   /**
    * Private methods
    */
   function make_colour () {
      var colours = [ "#", [] ];
      var tmp;
      for ( var i = 0; i < 3; i++ ) {
         tmp = Math.floor(Math.random() * 192);
         colours[0] += (tmp + 64).toString(16);
         colours[1].push( parseInt(tmp / 4) + 16 );
      }
      return colours;
   }
   function colourise_background (colour, cx, cy) {
      cx = cx || 50;
      cy = cy || 50;
      content.style.background = "radial-gradient(at " + cx + "% " + cy + "%, transparent, " + colour[0] + ", transparent, transparent, #FCFCFC)";
      content.style.backgroundColor = "rgba(" + colour[1][0] + ", " + colour[1][1] + ", " + colour[1][2] + ", 0.25)";
   }

   function check_order () {
      var class_names = [];
      var doublicated_elements = [];
      var i;
      for ( i = 0; i < circles.length; i++ ) {
         if ( !circles[i].classList.contains("animated") )
            circles[i].classList.add("animated");
         if ( class_names.includes(circles[i].className) )
            doublicated_elements.push(circles[i]);
         else
            class_names.push(circles[i].className);
      }
      if ( !doublicated_elements.length )
         return;
      var j;
      for ( i = 0; i < doublicated_elements.length; i++ ) {
         for ( j = 0; j < css_classes.length; j++ ) {
            if ( !class_names.includes(css_classes[j]) ) {
               class_names.push(css_classes[j]);
               doublicated_elements[i].className = css_classes[j];
               break;
            }
         }
      }
   }

   function elementactivated (ev) {
      if ( !active || !ev.target )
         return;
      content.style.overflow = "hidden";
      var x = 0;
      var y = 0;
      var xm = this.className.match(/x(\d+)/);
      if ( xm )
         x = parseInt(xm[1]) + 10;
      var ym = this.className.match(/y(\d+)/);
      if ( ym )
         y = parseInt(ym[1]) + 10;
      colourise_background(this.colour, x, y);

      if ( active_element )
         elementdeactivated({target: active_element});

      active_element = ev.target;
      active_element.remembered = {
         class_name: active_element.className,
         x: (ev.touches && ev.touches[0].layerX) || ev.layerX,
         y: (ev.touches && ev.touches[0].layerY) || ev.layerY,
         zone_x: (x && (x - 10)) || 0,
         zone_y: (y && (y - 10)) || 0
      };

      active_element.classList.remove("animated");
      active_element.style.zIndex = 1;
      content.addEventListener(POINTERMOVE, wrapper_move, false);
      active_element.addEventListener(POINTEROUT, elementdeactivated, false);
   }
   function elementdeactivated (ev) {
      if ( !ev.target )
         return;
      ev.target.removeEventListener(POINTEROUT, elementdeactivated, false);
      content.removeEventListener(POINTERMOVE, wrapper_move, false);
      if ( !active_element )
         return;
      active_element.style.zIndex = 0;
      active_element.style.removeProperty("left");
      active_element.style.removeProperty("top");
      active_element.className = active_element.remembered.class_name;
      var colour = ["transparent", [active_element.colour[1][0] * 3, active_element.colour[1][1] * 3, active_element.colour[1][2] * 3]];
      colourise_background(colour, (active_element.remembered.zone_x + 10), (active_element.remembered.zone_y + 10));
      active_element = null;

      check_order();
   }
   function wrapper_move (ev) {
      if ( !active_element )
         return;
      var x = (ev.touches && ev.touches[0].clientX) || ev.clientX;
      var y = (ev.touches && ev.touches[0].clientY) || ev.clientY;
      x -= (coordinates[0] + active_element.remembered.x);
      y -= (coordinates[1] + active_element.remembered.y);
      active_element.style.left = x + "px";
      active_element.style.top = y + "px";
      var zone_x = Math.round(5 * x / size) * 20;
      if ( zone_x < 0 )
         zone_x = 0;
      if ( zone_x > 80 )
         zone_x = 80;
      var zone_y = Math.round(5 * y / size) * 20;
      if ( zone_y < 0 )
         zone_y = 0;
      if ( zone_y > 80 )
         zone_y = 80;
      if ( zone_x == active_element.remembered.zone_x && zone_y == active_element.remembered.zone_y )
         return;
      var swap_element = content.querySelector(".circle.x" + zone_x + ".y" + zone_y);
      if ( !swap_element )
         return;
      var remembered_class_name = swap_element.className;
      swap_element.className = active_element.remembered.class_name;
      active_element.remembered.class_name = remembered_class_name;
      active_element.classList.remove("animated");
      active_element.remembered.zone_x = zone_x;
      active_element.remembered.zone_y = zone_y;
      colourise_background(["#FCFCFC", [252, 252, 252]]);
   }

   /**
    * Public methods
    */
   this.set_size = function (s) {
      if ( !s || size == s )
         return;
      size = s;
      single_size = Math.round( size / 5 );
      content.style.borderRadius = Math.floor(single_size / 2) + "px";
      var x = 0;
      var y = 0;
      var parent = content;
      while (parent && parent != document.body ) {
         x += parent.offsetLeft;
         y += parent.offsetTop;
         parent = parent.parentNode;
      }
      coordinates = [x, y];
   };
   this.set_active = function (a) {
      if ( a && size ) {
         active = true;
      }
      else {
         active = false;
         colourise_background(["#FCFCFC", [252, 252, 252]]);
         content.style.overflow = "initial";
      }
   };

   /**
    * Constructor
    */
   content.style.transition = "background-color 2s";
   var i, colour, cx, cy;
   for ( i = 0; i < circles.length; i++ ) {
      cx = i % 5;
      cy = Math.floor( i / 5 );
      cx = cx * 15 + Math.round(Math.random() * 40);
      cy = cy * 15 + Math.round(Math.random() * 40);
      colour = make_colour();
      circles[i].colour = colour;
      circles[i].style.background = "radial-gradient(at " + cx + "% " + cy + "%, " + colour[0] + ", rgba(" + colour[1][0] + ", " + colour[1][1] + ", " + colour[1][2] + ", 0.92))";
      circles[i].addEventListener(POINTERDOWN, elementactivated, false);
      circles[i].addEventListener(POINTERUP, elementdeactivated, false);
      circles[i].addEventListener(POINTERCANCEL, elementdeactivated, false);
      css_classes.push(circles[i].className);
   }
}
