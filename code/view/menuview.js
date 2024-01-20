function MenuView (content, parent) {

   /**
    * Private properties
    */
   var wrapper = content.parentNode;
   var entries = [];
   var named_entries = {};
   var interval;


   /**
    * Private methods
    */
   function open () {
      if ( !wrapper )
         return;
      content.addEventListener("mouseout", close, false);
      wrapper.classList.add("open");
      interval = setInterval(function () {
         if ( !content_open() )
            close();
      }, 501);
   }
   function close () {
      if ( interval )
         clearInterval(interval);
      content.removeEventListener("mouseout", close, false);
      wrapper.classList.remove("open");
   }
   function disable () {
      if ( is_open() ) {
         if ( !interval )
            open();
         content.removeEventListener("mouseout", close, false);
      }
      else
         content.classList.add("disabled");
   }
   function enable () {
      if ( is_open() )
         close();
      else
         content.classList.remove("disabled");
   }
   function is_open () {
      return wrapper && window.getComputedStyle && +getComputedStyle(wrapper).zIndex && +getComputedStyle(wrapper).opacity;
   }
   function content_open () {
      return window.getComputedStyle && !!(getComputedStyle(content).display == "block") && +getComputedStyle(wrapper).zIndex;
   }
   /* */
   function get_element (which) {
      for ( var i = 0; i < entries.length; i++ ) {
         if ( entries[i] == which )
            return which;
      }
      return (isNaN(which)) ? named_entries[which] : entries[which];
   }
   function select (which) {
      if ( (typeof which).toUpperCase() == "OBJECT" ) {
         multi_select(which);
         return;
      }
      var element = get_element(which);
      var j;
      for ( i = 0; i < entries.length; i++ ) {
         if ( element == entries[i] ) {
            entries[i].classList.add("selected");
            if ( entries[i].subentries ) {
               for ( j = 0; j < entries[i].subentries.length; j++ ) {
                  entries[i].subentries[j].element.classList.add("show");
               }
            }
         }
         else {
            entries[i].classList.remove("selected");
            if ( entries[i].subentries ) {
               for ( j = 0; j < entries[i].subentries.length; j++ ) {
                  entries[i].subentries[j].element.classList.remove("show");
               }
            }
         }
      }
   }
   function multi_select (raw_collection) {
      var collection = [];
      var i;
      var element;
      var elements = [];
      for ( i = 0; i < raw_collection.length; i++ ) {
         element = get_element(raw_collection[i]);
         if ( element )
            elements.push(element);
      }
      for ( i = 0; i < entries.length; i++ ) {
         if ( elements.includes(entries[i]) ) {
            entries[i].classList.add("selected");
            if ( entries[i].subentries ) {
               for ( j = 0; j < entries[i].subentries.length; j++ ) {
                  entries[i].subentries[j].element.classList.add("show");
               }
            }
         }
         else {
            entries[i].classList.remove("selected");
            if ( entries[i].subentries ) {
               for ( j = 0; j < entries[i].subentries.length; j++ ) {
                  entries[i].subentries[j].element.classList.remove("show");
               }
            }
         }
      }
   }
   function connect (which, fnc) {
      var element = get_element(which);
      if ( !element || !element.connect )
         return;
      element.connect(fnc);
   }


   /**
    * Public methods
    */
   parent.refill_html = function (text, index, subindex) {
      var element = entries[index];
      if ( !element )
         return;
      if ( subindex != undefined ) {
         element = element.subentries && element.subentries[subindex] && element.subentries[subindex].element;
         if ( !element )
            return;
      }
      element.innerHTML = text;
   };

   /**
    * Constructor
    */
   var raw_entries = content.querySelectorAll("div");
   var i, regular_entry, connector;
   for ( i = 0; i < raw_entries.length; i++ ) {
      if ( raw_entries[i].classList.contains("split") ) {
         subitems = raw_entries[i].querySelectorAll("span");
         for ( j = 0; j < subitems.length; j++ )
            entries.push(subitems[j]);
      }
      else {
         if ( !raw_entries[i].classList.contains("sub") ) {
            regular_entry = raw_entries[i];
            regular_entry.subentries = [];
            entries.push(regular_entry);
         }
         else {
            if ( regular_entry ) {
               connector = parent.standard_connector(raw_entries[i]);
               connector();
               regular_entry.subentries.push({element: raw_entries[i], connector: connector});
            }
         }
      }
   }
   var list_entries = [];
   var title;
   for ( i = 0; i < entries.length; i++ ) {
      entries[i].connect = parent.standard_connector(entries[i]);
      title = entries[i].innerHTML.trim();
      named_entries[title] = entries[i];
      list_entries.push( {index: i, title: title, subentries: entries[i].subentries || []} );
   }
   parent.menu = {
      open: (wrapper) ? open : invalidated,
      close: (wrapper) ? close : invalidated,
      disable: (wrapper) ? disable : invalidated,
      enable: (wrapper) ? enable : invalidated,
      get is_open () {
         return is_open();
      },
      select: select,
      connect: connect,
      entries: list_entries
   };
}
