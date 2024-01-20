function SlidingPuzzleSolver (data, extend) {


   /**
    * Private properties
    */
   var myself = this;
   var nothing_good;


   /**
    * Public properties
    */
   this.offset = data.offset || 0;
   this.moves_made = data.moves_made || [];
   this.sqrt = Math.sqrt(data.collection.length);
   this.initial_black_index = data.collection[data.black_index];

   function debug_situation (situation) {
      var j, c;
      for ( var i = 0; i < situation.length; i += myself.sqrt ) {
         c = [];
         for ( j = i; j < (i + myself.sqrt); j++ )
            c.push(situation[j] + 1);
         console.log( c );
      }
      console.log( "---" );
   }
   this.debug_situation = debug_situation;

   /**
    * Private methods
    */
   function eventually_continue_search (moves_made, situation, moving_piece_position, black_position, allowed_faults, preferred_pieces, deprecated_positions, taboo_pieces) {
      if ( !moves_made.length || situation[moving_piece_position] != moves_made[moves_made.length - 1] ) {
         var better = would_be_closer(moving_piece_position, black_position, situation[moving_piece_position]);
         if ( better || allowed_faults > 0 ) {

            var tmp_moves_made = moves_made.slice();
            tmp_moves_made.push(situation[moving_piece_position]);

            var tmp_situation = situation.slice();
            tmp_situation[black_position] = situation[moving_piece_position];
            tmp_situation[moving_piece_position] = situation[black_position];

            if ( better ) {
               myself.stack_search(tmp_situation, moving_piece_position, tmp_moves_made, allowed_faults, preferred_pieces, deprecated_positions, taboo_pieces);
               return true;
            }
            myself.stack_search(tmp_situation, moving_piece_position, tmp_moves_made, --allowed_faults, preferred_pieces, deprecated_positions, taboo_pieces);
         }
      }
      return false;
   }
   function would_be_closer (actual, eventual, wanted) {

      var actual_horizontal = Math.abs((actual % myself.sqrt) - (wanted % myself.sqrt));
      var actual_vertical = Math.abs( Math.floor(actual / myself.sqrt) - Math.floor(wanted / myself.sqrt) );
      var actual_distance = actual_horizontal + actual_vertical;

      var eventual_horizontal = Math.abs((eventual % myself.sqrt) - (wanted % myself.sqrt));
      var eventual_vertical = Math.abs( Math.floor(eventual / myself.sqrt) - Math.floor(wanted / myself.sqrt) );
      var eventual_distance = eventual_horizontal + eventual_vertical;

      return (eventual_distance < actual_distance);
   }


   /**
    * Public methods
    */
   this.stack_search = function (situation, black_position, moves_made, allowed_faults, preferred_pieces, deprecated_positions, taboo_pieces) {

      var conditions = [
         (black_position - myself.sqrt) >= 0,                           // move black piece up, other piece down
         (black_position % myself.sqrt) != (myself.sqrt - 1),           // move black piece to right, other piece to left
         (black_position + myself.sqrt) < (myself.sqrt * myself.sqrt),  // move black piece down, other piece up
         (black_position % myself.sqrt) != 0                            // move black piece to left, other piece to right
      ];
      var moving_piece_positions = [
         black_position - myself.sqrt,
         black_position + 1,
         black_position + myself.sqrt,
         black_position - 1
      ];

      var found_something_good = 0;
      var possible_moving_pieces = 0;
      var taboo_counter = 0;

      var moving_piece_position;
      for ( var i = 0; i < 4; i++ ) {
         if ( conditions[i] ) {
            moving_piece_position = moving_piece_positions[i];
            possible_moving_pieces++;
            if ( taboo_pieces.includes(situation[moving_piece_position]) ) {
               taboo_counter++;
               continue;
            }
            if ( eventually_continue_search(moves_made, situation, moving_piece_position, black_position, allowed_faults, preferred_pieces, deprecated_positions, taboo_pieces) )
               found_something_good = 1;
         }
      }

      if ( taboo_counter && possible_moving_pieces == taboo_counter ) {
         myself.stack_search(situation, black_position, moves_made, allowed_faults, preferred_pieces, deprecated_positions, []);
         return;
      }

      if ( !found_something_good )
         nothing_good(situation, deprecated_positions, preferred_pieces, moves_made);
   };

   this.set_nothing_good_method = function (f) {
      nothing_good = f;
   };
   this.msg = function (data) {
      postMessage(data);
   };


   /**
    * Constructor
    */
   if ( extend )
      extend(this, data);
}

