function SingleJoinedList () {

   /**
    * Private properties
    */
   var first, last;

   /**
    * Private methods
    */
   function wrap (v) {
      return {
         value: v
      };
   }

   /**
    * Public methods
    */
   this.push_left = function (v) {
      var element = wrap(v);
      if ( !first ) {
         first = element;
         last = element;
         return;
      }
      element.next = first;
      first = element;
   };
   this.push_right = function (v) {
      var element = wrap(v);
      if ( !last ) {
         first = element;
         last = element;
         return;
      }
      last.next = element;
      last = element;
   };
   this.pop_left = function () {
      if ( !first )
         return null;
      var tmp = first;
      first = tmp.next;
      if ( !tmp.next )
         last = null;
      return tmp.value;
   };
}
function Stack () {
   var list = new SingleJoinedList();
   this.get = list.pop_left;
   this.put = list.push_left;
}
function Queue () {
   var list = new SingleJoinedList();
   this.get = list.pop_left;
   this.put = list.push_right;
}
