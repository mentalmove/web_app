importScripts("../utilities/sliding_puzzle_solver.js");
var solver;

function PartialSquareSolution (parent, data) {

   /**
    * Private properties
    */
   var solution_found = false;


   /**
    * Private methods
    */
   function nothing_good (situation, deprecated_positions, preferred_pieces, moves_made) {

      for ( var i = 0; i < preferred_pieces.length; i++ ) {
         if ( situation[preferred_pieces[i]] != preferred_pieces[i] )
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

   if ( data.taboo_positions.includes(data.black_index) )
      data.taboo_positions = [];

   var taboo_pieces = [];
   for ( var i = 0; i < data.taboo_positions.length; i++ )
      taboo_pieces.push(data.collection[data.taboo_positions[i]]);

   var offset = parent.offset;

   var time_limit = (new Date()).getTime() + (Math.pow(data.collection.length, 2) * 20);
   do {
      parent.stack_search(data.collection.slice(), data.black_index, parent.moves_made, offset, data.preferred_positions, [], taboo_pieces);
      offset++;
   }
   while ( !solution_found && ((new Date()).getTime() < time_limit || data.unlimited) );

   setTimeout(function () {
      if ( solution_found )
         return;
      parent.msg({success: false});
   }, 41);
};

onmessage = function (event) {
   if ( !solver ) {
      solver = new SlidingPuzzleSolver(event.data, PartialSquareSolution);
      return;
   }
};
