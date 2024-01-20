function Squares (content, OPTIMAL_SOLUTION) {

   /**
    * Private properties
    */
   var myself = this;

   var raw_squares = content.querySelectorAll(".square");
   var sqrt = Math.floor(Math.sqrt(raw_squares.length));
   var amount = Math.pow(sqrt, 2);
   var size = 100 / sqrt;
   var squares = [];

   var BLOCK_TIME = 200;
   var initialised = false;
   var active = false;
   var timestamp = (new Date()).getTime();
   var solved = false;

   var solvers = [];
   var moves_to_make;
   var move_timeout;
   var taboo_positions;
   var solve_counter = 0;
   var human_solve_counter = 0;
   var solve_start_timestamp;
   OPTIMAL_SOLUTION = !!OPTIMAL_SOLUTION; // Might or might not succeed...


   /**
    * Private methods
    */
   function init () {
      var i, tmp, tgt;
      for ( i = 0; i < amount; i++ ) {
         do
            tgt = Math.floor(Math.random() * amount);
         while ( tgt == black_index );
         tmp = squares[i];
         squares[i] = squares[tgt];
         squares[tgt] = tmp;
         if ( i == black_index )
            black_index = tgt;
      }
      if ( !solvable(is_even) ) {
         init();
         return;
      }
      var black_piece_neighbours = neighbours();
      var pos;
      for ( i = 0; i < amount; i++ ) {
         pos = position(i);
         squares[i].style.left = pos.col * size + "%";
         squares[i].style.top = pos.row * size + "%";
         squares[i].actual_index = i;
         squares[i].style.zIndex = i;
         squares[i].style.cursor = (black_piece_neighbours.includes(squares[i].actual_index)) ? "pointer" : "default";
      }
   }
   function move () {
      if ( !active )
         return;
      var black_piece_neighbours = neighbours();
      if ( !black_piece_neighbours.includes(this.actual_index) || solved )
         return;
      var t = (new Date()).getTime();
      var difference = t - timestamp;
      if ( difference < BLOCK_TIME )
         return;
      timestamp = t;

      var src = position(this.actual_index);
      var tgt = position(black_index);

      this.style.top = tgt.row * size + "%";
      this.style.left = tgt.col * size + "%";
      squares[black_index].style.top = src.row * size + "%";
      squares[black_index].style.left = src.col * size + "%";

      var black_piece = squares[black_index];
      black_piece.actual_index = this.actual_index;

      var remembered_index = this.actual_index;
      this.actual_index = black_index;
      black_index = remembered_index;

      squares[this.actual_index] = this;
      squares[black_index] = black_piece;
      solved = true;
      black_piece_neighbours = neighbours();
      var i;
      for ( i = 0; i < squares.length; i++ ) {
         squares[i].actual_index = i;
         squares[i].style.zIndex = i;
         squares[i].style.cursor = (black_piece_neighbours.includes(squares[i].actual_index)) ? "pointer" : "default";
         if ( squares[i].actual_index != squares[i].index )
            solved = false;
      }
      if ( solve_counter || moves_to_make ) {
         solve_counter++;
         human_solve_counter = 0;
      }
      else
         human_solve_counter++;

      if ( moves_to_make && taboo_positions && this.actual_index == this.index && taboo_positions.includes(this.index) && !moves_to_make.includes(this.index) ) {
         this.style.outline = "2px solid " + "rgb(" + this.backgroundColour + ")";
         setTimeout(function (element) {
            if ( !element.backgroundColour )
               return;
            element.style.removeProperty("background");
            element.style.backgroundColor = "rgb(" + element.backgroundColour + ")";
            element.backgroundColour = null;
         }, 127, this);
         setTimeout(function (element) {
            element.style.removeProperty("outline");
         }, 375, this);
      }

      if ( !solved )
         return;

      myself.solve_connector();

      for ( i = 0; i < squares.length; i++ ) {
         if ( squares[i].style.background && squares[i].backgroundColour ) {
            setTimeout(function (element) {
               element.style.removeProperty("background");
               element.style.backgroundColor = "rgb(" + element.backgroundColour + ")";
            }, (i * 40 + 17), squares[i]);
         }
         squares[i].style.cursor = "default";
         setTimeout(function (ii) {
            squares[ii].style.opacity = 1;
         }, 640, i);
      }

      if ( myself.show_amount_steps )
         myself.show_amount_steps( Math.max(solve_counter, human_solve_counter) );
   }
   function even () {
      var n2 = (sqrt %2 == 0) ? Math.floor(black_index / sqrt + 1) : 0;
      return (n2 % 2 == 0) ? true : false;
   }
   function solvable (is_even) {
      var n2 = (sqrt % 2 == 0) ? Math.floor(black_index / sqrt + 1) : 0;
      var n1 = 0;
      var j;
      for ( var i = 0; i < amount; i++ ) {
         if ( i == black_index )
            continue;
         for ( j = 0; j < i; j++ ) {
            if ( j == black_index )
               continue;
            if ( squares[i].index < squares[j].index )
               n1++;
         }
      }
      var tmp_is_even = ((n1 + n2) % 2 == 0);
      return (is_even == tmp_is_even);
   }
   function position (index) {
      return {
         col: index % sqrt,
         row: Math.floor(index / sqrt)
      };
   }
   function neighbours () {
      var a = [];
      if ( black_index >= sqrt )
         a.push(black_index - sqrt);
      if ( black_index < (squares.length - 1) && (black_index + 1) % sqrt )
         a.push(black_index + 1);
      if ( black_index < (squares.length - sqrt) )
         a.push(black_index + sqrt);
      if ( black_index % sqrt )
         a.push(black_index - 1);
      return a;
   }
   function edge (which) {
      var addition = (which == "top" || which == "bottom") ? 1 : sqrt;
      var start = 0;
      switch (which) {
         case "bottom":
            start = amount - sqrt;
         break;
         case "right":
            start = sqrt - 1;
      }
      var collection = [start];
      for ( var i = 1; i < sqrt; i++ )
         collection[i] = collection[i - 1] + addition;
      return collection;
   }

   function show_solution () {
      if ( move_timeout ) {
         clearTimeout(move_timeout);
         move_timeout = null;
      }
      if ( !active || solved || !moves_to_make )
         return;
      if ( !moves_to_make.length ) {
         move_timeout = setTimeout(show_solution, 1001);
         return;
      }
      var number = moves_to_make.shift();
      if ( number == null )
         return;
      move_timeout = setTimeout(show_solution, 251);
      var entry;
      for ( var i = 0; i < squares.length; i++ ) {
         if ( squares[i].index == number ) {
            entry = squares[i];
            break;
         }
      }
      if ( !entry )
         return;
      (move.bind(entry))();
   }
   function solve () {
      if ( !active || solved )
         return;
      myself.solve_connector();
      solve_start_timestamp = (new Date()).getTime();
      var i, colour;
      var collection = [];
      for ( i = 0; i < squares.length; i++ ) {
         squares[i].removeEventListener(POINTERDOWN, move, false);
         squares[i].style.cursor = "default";
         if ( squares[i].backgroundColour ) {
            colour = [Math.round(squares[i].backgroundColour[0] / 2), Math.round(squares[i].backgroundColour[1] / 2), Math.round(squares[i].backgroundColour[2] / 2)];
            squares[i].style.background = "radial-gradient(rgb(" + squares[i].backgroundColour + "), rgba(" + colour[0] + ", " + colour[1] + ", " + colour[2] + ", 0.92))";
         }
         collection.push( squares[i].index );
      }

      BLOCK_TIME = 100;

      var worker1data, worker2data;

      if ( collection[black_index] < (amount / 2) ) {
         worker1data = {
            black_index: black_index,
            collection: collection,
            preferred_positions: edge("bottom"),
            taboo_positions: edge("top")
         };
      }
      else {
         worker1data = {
            black_index: black_index,
            collection: collection,
            preferred_positions: edge("top"),
            taboo_positions: edge("bottom")
         };
      }
      if ( (collection[black_index] % sqrt) < (sqrt / 2) ) {
         worker2data = {
            black_index: black_index,
            collection: collection,
            preferred_positions: edge("right"),
            taboo_positions: edge("left")
         };
      }
      else {
         worker2data = {
            black_index: black_index,
            collection: collection,
            preferred_positions: edge("left"),
            taboo_positions: edge("right")
         };
      }
      worker1data.task = "prepare";
      worker2data.task = "prepare";

      if ( !OPTIMAL_SOLUTION ) {
         var worker1 = new Worker( "code/workers/prepare_squares.js" );
         solvers.push( worker1 );
         worker1.onmessage = solver_response;
         worker1.postMessage(worker1data);

         var worker2 = new Worker( "code/workers/prepare_squares.js" );
         solvers.push( worker2 );
         worker2.onmessage = solver_response;
         worker2.postMessage(worker2data);
      }
      else {
         var data = {
            black_index: black_index,
            collection: collection,
            preferred_positions: collection.slice(),
            taboo_positions: [],
            unlimited: true,
            task: "step3"
         }
         var worker = new Worker( "code/workers/partial_square_solution.js" );
         solvers.push( worker );
         worker.onmessage = solver_response;
         worker.postMessage(data);
         myself.overwrite_solve_text( "..." );
      }
   }
   function solver_response (event) {
      var solver, i;
      for ( i = 0; i < solvers.length; i++ ) {
         if ( solvers[i] && solvers[i] == this ) {
            solver = solvers[i];
            solvers[i] = null;
            break;
         }
      }

      if ( !event.data.success ) {
         var success = !!solved;
         for ( i = 0; i < solvers.length; i++ ) {
            if ( solvers[i] ) {
               success = true;
               break;
            }
         }
         if ( !success ) {
            var language = settings.language || settings.languages[0];
            language = language.toLowerCase()
            navigation.confirmation(Messages[12][language]);
            myself.overwrite_solve_text( ":-(" );
         }
      }

      var worker;
      switch ( event.data.task ) {
         case "prepare":
            if ( solver )
               solver.terminate();
            worker = new Worker( "code/workers/partial_square_solution.js" );
            solvers.push( worker );
            worker.onmessage = solver_response;
            event.data.task = "step1";
            worker.postMessage(event.data);
            if ( myself.overwrite_solve_text )
               myself.overwrite_solve_text( "." );
         break;

         case "step1":
            for ( i = 0; i < solvers.length; i++ ) {
               if ( solvers[i] ) {
                  solvers[i].terminate();
                  solvers[i] = null;
               }
            }
            if ( moves_to_make )
               return;
            moves_to_make = event.data.moves_made.slice();
            show_solution();

            var actual_black_index = event.data.black_index;
            var initial_black_index = event.data.collection[event.data.black_index];
            var left_right = !!(event.data.preferred_positions[1] - event.data.preferred_positions[0] == 1)
            var possibilities = (left_right) ? [edge("left"), edge("right")] : [edge("top"), edge("bottom")];
            var preferred;
            if ( possibilities[0].includes(initial_black_index) )
               preferred = possibilities[1];
            if ( !preferred && possibilities[1].includes(initial_black_index) )
               preferred = possibilities[0];
            if ( !preferred ) {
               if ( left_right ) {
                  if ( (actual_black_index % sqrt) < (sqrt / 2) )
                     preferred = edge("left");
                  else
                     preferred = edge("right");
               }
               else {
                  if ( actual_black_index < (amount / 2) )
                     preferred = edge("top");
                  else
                     preferred = edge("bottom");
               }
            }
            event.data.taboo_positions = event.data.preferred_positions;
            event.data.preferred_positions = [];
            for ( i = 0; i < preferred.length; i++ ) {
               if ( !event.data.taboo_positions.includes(preferred[i]) )
                  event.data.preferred_positions.push(preferred[i]);
            }
            event.data.task = "step2";
            event.data.moves_made = null;
            worker = new Worker( "code/workers/partial_square_solution.js" );
            solvers.push( worker );
            worker.onmessage = solver_response;
            worker.postMessage(event.data);
            if ( myself.overwrite_solve_text )
               myself.overwrite_solve_text( ".." );
         break;

         case "step2":
            if ( solver )
               solver.terminate();
            if ( moves_to_make.length && event.data.moves_made.length ) {
               while ( moves_to_make[moves_to_make.length - 1] == event.data.moves_made[0] ) {
                  moves_to_make.pop();
                  event.data.moves_made.shift();
               }
            }
            for ( i = 0; i < event.data.moves_made.length; i++ )
               moves_to_make.push(event.data.moves_made[i]);

            for ( i = 0; i < event.data.preferred_positions.length; i++ )
               event.data.taboo_positions.push( event.data.preferred_positions[i] );
            event.data.preferred_positions = [];
            for ( i = 0; i < amount; i++ ) {
               if ( !event.data.taboo_positions.includes(i) )
                  event.data.preferred_positions.push(i);
            }
            event.data.task = "step3";
            event.data.moves_made = null;
            worker = new Worker( "code/workers/partial_square_solution.js" );
            solvers.push( worker );
            worker.onmessage = solver_response;
            worker.postMessage(event.data);

            taboo_positions = event.data.taboo_positions;
            if ( myself.overwrite_solve_text )
               myself.overwrite_solve_text( "..." );
         break;

         case "step3":
            if ( solver )
               solver.terminate();
            if ( OPTIMAL_SOLUTION ) {
               moves_to_make = [];
               setTimeout(show_solution, 41);
            }
            else {
               if ( moves_to_make.length && event.data.moves_made.length ) {
                  while ( moves_to_make[moves_to_make.length - 1] == event.data.moves_made[0] ) {
                     moves_to_make.pop();
                     event.data.moves_made.shift();
                  }
               }
            }
            for ( i = 0; i < event.data.moves_made.length; i++ )
               moves_to_make.push(event.data.moves_made[i]);
            var solve_end_timestamp = (new Date()).getTime();
            if ( myself.overwrite_solve_text )
               myself.overwrite_solve_text( (solve_end_timestamp - solve_start_timestamp) + " ms" );
            else
               console.log( (solve_end_timestamp - solve_start_timestamp) + " ms" );
            if ( OPTIMAL_SOLUTION )
               console.log( event.data.moves_made.length + " moves needed" );
      }
   }
   

   /**
    * Public methods
    */
   this.set_active = function (a) {
      active = !!a;
      if ( active )
         show_solution();
      if ( initialised || !active )
         return;
      initialised = true;
      init();
      myself.solve_connector(solve);
   };
   this.solve_connector = invalidated;

   /**
    * Constructor
    */
   var i;
   for ( i = (raw_squares.length - 1); i >= amount; i-- )
      remove_me(raw_squares[i]);
   var col, row;
   for ( i = 0; i < amount; i++ ) {
      squares.push(raw_squares[i]);
      squares[i].index = i;
      squares[i].innerHTML = (i + 1);
      squares[i].addEventListener(POINTERDOWN, move, false);
      random_colour(squares[i]);
      col = i % sqrt;
      row = Math.floor(i / sqrt);
      squares[i].style.width = size + "%";
      squares[i].style.height = size + "%";
      if ( !row && !col )
         squares[i].style.borderTopLeftRadius = "25%";
      if ( !row && col == (sqrt - 1) )
         squares[i].style.borderTopRightRadius = "25%";
      if ( row == (sqrt - 1) && !col )
         squares[i].style.borderBottomLeftRadius = "25%";
      if ( row == (sqrt - 1) && col == (sqrt - 1) )
         squares[i].style.borderBottomRightRadius = "25%";
   }
   var black_index = Math.floor(Math.random() * squares.length);
   var is_even = even();
   squares[black_index].style.opacity = 0;
   content.style.borderRadius = (25 / sqrt) + "%";
   content.style.backgroundColor = "#282828";
}
