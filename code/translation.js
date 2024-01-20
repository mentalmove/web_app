function Translation (app) {

   /**
    * Private properties
    */
   var collection = {};


   /**
    * Public methods
    */
   this.register = function (name, element) {
      var nodes = element.querySelectorAll("[translatable]");
      if ( !nodes || !nodes.length || !Dictionary[name] )
         return;
      collection[name] = collection[name] || [];
      var node_value;
      for ( var i = 0; i < nodes.length; i++ ) {
         node_value = nodes[i].innerHTML.trim().replace(/\s+/g, " ");
         if ( !Dictionary[name][node_value] )
            continue;
         collection[name].push({
            element: nodes[i],
            de: node_value,
            en: Dictionary[name][node_value]
         });
      }
   };
   this.translate = function (context, language) {
      language = language.toLowerCase();
      var section = collection[context];
      if ( !section )
         return;
      for ( var i = 0; i < section.length; i++ ) {
         if ( section[i][language] )
            section[i].element.innerHTML = section[i][language];
      }
   };
}
