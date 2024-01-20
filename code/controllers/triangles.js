function Triangles (content) {

   /**
    * Private properties
    */
   var lable = content.querySelector("label");
   var canvas = content.querySelector("canvas");
   var height = 0;
   var ctx = canvas.getContext("2d");

   var AMOUNT = 3; // Well... Not a surprise when called `Triangles`...
   var points;
   var triangles;
   var surface;

   var clicked_point;
   var base_colour = 256;


   /**
    * Private methods
    */
   function pointerdown (ev) {
      clicked_point = {x: ev.layerX, y: ev.layerY};
      draw_point(clicked_point);
   }
   function pointerup (ev) {
      var point = clicked_point || {x: ev.layerX, y: ev.layerY};
      points.push(point);
      check_inside_out(point);
      clicked_point = null;
      if ( lable )
         lable.style.display = "none";
   }

   function draw_inside (index, triangle, to_delete) {
      var t1 = construct_triangle(triangle.points[0], triangle.points[1], index);
      var t2 = construct_triangle(triangle.points[0], triangle.points[2], index);
      var t3 = construct_triangle(triangle.points[1], triangle.points[2], index);
      triangles.push(t1);
      triangles.push(t2);
      triangles.push(t3);
      draw_triangle(t1);
      draw_triangle(t2);
      draw_triangle(t3);

      triangles.splice(to_delete, 1);
   }
   function draw_outside (index, added) {
      var j, k, edge, inner_triangle, outer_triangle, triangle_found, other_point;
      for ( var i = 0; i < surface.length; i++ ) {
         edge = surface[i];
         for ( j = 0; j < triangles.length; j++ ) {
            inner_triangle = triangles[j];
            triangle_found = false;
            for ( k = 0; k < 3; k++ ) {
               if ( inner_triangle.edges[k][0] == edge[0] && inner_triangle.edges[k][1] == edge[1] ) {
                  triangle_found = true;
                  break;
               }
            }
            if ( triangle_found )
               break;
         }
         if ( !triangle_found || !inner_triangle.size )
            continue;

         for ( k = 0; k < 3; k++ ) {
            if ( inner_triangle.points[k] != edge[0] && inner_triangle.points[k] != edge[1] ) {
               other_point = inner_triangle.points[k];
               break;
            }
         }

         outer_triangle = construct_triangle(edge[0], edge[1], index);
         if ( !outer_triangle.size )
            continue;

         if ( quadrilateral_size(points[edge[0]], points[other_point], points[edge[1]], points[index]) < (inner_triangle.size + outer_triangle.size) )
            continue;

         triangles.push(outer_triangle);
         draw_triangle(outer_triangle);

         var edge1 = [ edge[0], index ];
         var edge2 = [ edge[1], index ];
         edge1.sort(sort_asc);
         edge2.sort(sort_asc);
         if ( added ) {
            surface.splice(i, 1);
            var found = false;
            for ( j = 0; j < surface.length; j++ ) {
               if ( edge1[0] == surface[j][0] && edge1[1] == surface[j][1] ) {
                  found = true;
                  surface.splice(j, 1);
                  break;
               }
            }
            if ( !found )
               surface.push(edge1);
            found = false;
            for ( j = 0; j < surface.length; j++ ) {
               if ( edge2[0] == surface[j][0] && edge2[1] == surface[j][1] ) {
                  found = true;
                  surface.splice(j, 1);
                  break;
               }
            }
            if ( !found )
               surface.push(edge2);
         }
         else
            surface.splice(i, 1, edge1, edge2);

         draw_outside(index, true);
      }
   }
   function check_inside_out (point) {
      var j, tmp_size;
      for ( var i = 0; i < triangles.length; i++ ) {

         /**
          * Ignore already recognised points
          */
         for ( j = 0; j < 3; j++ ) {
            if ( points[triangles[i].points[j]].x == point.x && points[triangles[i].points[j]].y == point.y )
               return;
         }

         tmp_size = max_quadrilateral_size(points[triangles[i].points[0]], points[triangles[i].points[1]], points[triangles[i].points[2]], point);

         if ( tmp_size > triangles[i].size )
            continue;

         points.push(point);                          // Necessary? At least it doesn't do harm
         draw_inside(points.length - 1, triangles[i], i);
         //console.log( "INSIDE: " + point.x + ", " + point.y );
         return;
      }

      draw_outside(points.length - 1);
      //console.log( "OUTSIDE: " + point.x + ", " + point.y );
   }

   function draw_point (point) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
      ctx.lineWidth = 1;
   }
   function draw_triangle (triangle) {
      ctx.beginPath();
      var p1 = points[triangle.points[0]];
      var p2 = points[triangle.points[1]];
      var p3 = points[triangle.points[2]];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.closePath();
   }

   /**
    * Is in fact doubled size
    * Order does not matter
    */
   function triangle_size (p1, p2, p3) {
      var result = Math.abs( p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y) );
      return result;
   }
   /**
    * Is in fact doubled size
    * Order matters
    */
   function quadrilateral_size (p1, p2, p3, p4) {
      var result = Math.abs( p1.x * (p2.y - p4.y) + p2.x * (p3.y - p1.y) + p3.x * (p4.y - p2.y) + p4.x * (p1.y - p3.y) );
      return result;
   }
   /**
    * Is in fact doubled size
    * Order does not matter
    */
   function max_quadrilateral_size (p1, p2, p3, p4) {
      var s1 = quadrilateral_size (p1, p2, p3, p4);
      var s2 = quadrilateral_size (p1, p2, p4, p3);
      var s3 = quadrilateral_size (p1, p4, p2, p3);
      return Math.max(s1, s2, s3);
   }

   function colourise_triangle (triangle, colour) {
      ctx.fillStyle = colour;
      ctx.beginPath();
      var p1 = points[triangle.points[0]];
      var p2 = points[triangle.points[1]];
      var p3 = points[triangle.points[2]];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.fill();
      ctx.closePath();
   }
   function construct_triangle (point_index1, point_index2, point_index3) {
      var tmp_points = [point_index1, point_index2, point_index3];
      tmp_points.sort(sort_asc);
      var triangle = {
         points: tmp_points
      };
      triangle.size = triangle_size(points[tmp_points[0]], points[tmp_points[1]], points[tmp_points[2]]);
      triangle.edges = [
         [tmp_points[0], tmp_points[1]],
         [tmp_points[0], tmp_points[2]],
         [tmp_points[1], tmp_points[2]]
      ];
      return triangle;
   }
   function init () {
      points = [];
      var i, point;
      for ( i = 0; i < AMOUNT; i++ ) {
         point = {};
         point.x = Math.round(Math.random() * height / 2);
         point.x += i * height / 4;
         point.y = Math.round(Math.random() * parseInt(height / 3));
         point.y += (i % 2) ? 0 : parseInt(2 * height / 3);
         points.push(point);
      }
      triangles = [
         construct_triangle(0, 1, 2)
      ];
      surface = [
         [0, 1],
         [1, 2],
         [0, 2]
      ];
      for ( i = 0; i < points.length; i++ )
         draw_point(points[i]);
      draw_triangle(triangles[0]);
   }

   /**
    * Public methods
    */
   this.set_active = function (active) {
      if ( active ) {
         canvas.addEventListener(POINTERDOWN, pointerdown, false);
         canvas.addEventListener(POINTERUP, pointerup, false);
      }
      else {
         canvas.removeEventListener(POINTERDOWN, pointerdown, false);
         canvas.removeEventListener(POINTERUP, pointerup, false);
      }
   };
   this.set_size = function (s) {
      if ( !s )
         return;
      if ( height && s == height )
         return;
      height = s;
      canvas.width = height;
      canvas.height = height;
      canvas.style.width = height + "px";
      canvas.style.height = height + "px";
      canvas.style.cursor = "crosshair";
      init();
   };
   this.colourise = function () {
      var colour, j;
      for ( var i = 0; i < triangles.length; i++ ) {
         colour = "#";
         for ( j = 0; j < 3; j++ )
            colour += (Math.floor(Math.random() * 128) + 128).toString(16).toUpperCase();
         colourise_triangle(triangles[i], colour);
      }
   };
   this.reset = function () {
      ctx.clearRect(0, 0, height, height);
      init();
      base_colour -= 8;
      if ( base_colour >= 16 ) {
         var hex_colour = base_colour.toString(16);
         colourise_triangle(triangles[0], "#" + hex_colour + hex_colour + hex_colour);
      }
      else
         base_colour = 256;
   };

   /**
    * Constructor
    */
   ctx.strokeStyle = "#444444";
   ctx.lineWidth = 3;
}
