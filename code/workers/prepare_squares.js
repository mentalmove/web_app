importScripts("../utilities/sliding_puzzle_solver.js");
var solver;

function PrepareSquares (parent, data) {

   /**
    * Private properties
    */
   var solution_found = false;


   /**
    * Private methods
    */
   function remove_last (situation, moves_made, black_index) {
      var value = moves_made.pop();
      var black_value = situation[black_index];
      var index;
      for ( i = 0; i < situation.length; i++ ) {
         if ( situation[i] == value ) {
            index = i;
            break;
         }
      }
      situation[index] = black_value;
      situation[black_index] = value;
      return index;
   }
   function nothing_good (situation, deprecated_positions, preferred_pieces, moves_made) {

      var i;
      for ( i = 0; i < parent.sqrt; i++ ) {
         if ( situation[deprecated_positions[i]] == parent.initial_black_index || deprecated_positions.includes(situation[data.taboo_positions[i]]) )
            return;
      }

      solution_found = true;
      parent.set_nothing_good_method(function(){});

      //parent.debug_situation( situation );

      var black_index;
      for ( i = 0; i < situation.length; i++ ) {
         if ( situation[i] == parent.initial_black_index ) {
            black_index = i;
            break;
         }
      }

      while ( moves_made.length && !deprecated_positions.includes(moves_made[moves_made.length - 1]) ) {
         black_index = remove_last(situation, moves_made, black_index);
      }

      parent.msg({
         collection: situation,
         preferred_positions: data.preferred_positions,
         taboo_positions: data.taboo_positions,
         moves_made: moves_made,
         black_index: black_index,
         task: data.task,
         success: true
      });
   }


   /**
    * Constructor
    */
   parent.set_nothing_good_method(nothing_good);

   if ( data.taboo_positions.includes(data.black_index) ) {
      var addition = parent.sqrt + 1 - (data.taboo_positions[1] - data.taboo_positions[0]);
      if ( data.taboo_positions[0] )
         addition *= -1;
      var moved_entry = data.collection[data.black_index + addition];
      data.collection[data.black_index + addition] = data.collection[data.black_index];
      data.collection[data.black_index] = moved_entry;
      data.black_index += addition;
      parent.moves_made.push( moved_entry );
   }

   var taboo_pieces = [];
   var preferred_pieces = [];

   for ( var i = 0; i < data.taboo_positions.length; i++ ) {
      taboo_pieces.push( data.collection[data.taboo_positions[i]] );
      preferred_pieces.push( data.collection[data.preferred_positions[i]] );
   }

   var offset = parent.offset;

   var time_limit = (new Date()).getTime() + (Math.pow(data.collection.length, 2) * 20);
   do {
      parent.stack_search(data.collection.slice(), data.black_index, parent.moves_made, offset, taboo_pieces, data.preferred_positions, preferred_pieces);
      offset++;
   }
   while ( !solution_found && (new Date()).getTime() < time_limit );

   setTimeout(function () {
      if ( solution_found )
         return;
      parent.msg({success: false});
   }, 41);
}

onmessage = function (event) {
   if ( !solver ) {
      solver = new SlidingPuzzleSolver(event.data, PrepareSquares);
      return;
   }
};
