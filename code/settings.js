function Settings (app) {

   /**
    * Private properties
    */
   var myself = this;
   var storage = window.localStorage;
   var stored = {
      language: null,
      profile: null,
      store: public_store,
      callback: set_callback
   };
   var callbacks = {
      persistent: {}
   };
   var storage_items = [];

   /**
    * Public properties
    */
   this.languages = ["DE", "EN"];

   /**
    * Private methods
    */
   function do_callbacks (property) {
      var cb;
      do {
         cb = callbacks[property] && callbacks[property].pop();
         if ( cb )
            cb(stored[property]);
      } while (cb);
      if ( callbacks.persistent[property] ) {
         for ( var i = 0; i < callbacks.persistent[property].length; i++ )
            callbacks.persistent[property][i](stored[property]);
      }
   }
   function store_persistent (key, item) {
      if ( (typeof item).toUpperCase() == "FUNCTION" )
         return;
      localStorage.setItem(key, JSON.stringify(item));
      if ( storage_items.includes(key) )
         return;
      storage_items.push(key);
      setTimeout(function () {
         localStorage.setItem("properties", JSON.stringify(storage_items));
      }, 17);
   }
   function store (property) {
      Object.defineProperty(myself, property, {
         get: function () {
            return stored[property];
         },
         set: function (v) {
            stored[property] = v;
            do_callbacks(property);
            store_persistent(property, stored[property]);
         },
         enumerable: false,
         configurable: false
      });
   }
   function public_store (property, value, ignore_persistence) {
      if ( stored[property] !== undefined ) {
         if ( value !== undefined )
            myself[property] = value;
         return;
      }
      Object.defineProperty(myself, property, {
         get: function () {
            return stored[property];
         },
         set: function (v) {
            stored[property] = v;
            do_callbacks(property);
            store_persistent(property, stored[property]);
         },
         enumerable: true,
         configurable: false
      });
      stored[property] = (value === undefined) ? null : value;
      if ( !ignore_persistence )
         store_persistent(property, stored[property]);
   }
   function set_callback (property, fnc, persistent) {
      if ( stored[property] === undefined || !fnc || (typeof fnc).toUpperCase() != "FUNCTION" )
         return;
      var o = (persistent) ? callbacks.persistent : callbacks;
      o[property] = o[property] || [];
      o[property].push( fnc );
   }

   /**
    * Public methods
    * Already defined in `stored` as `public_store` with alias `store`
    */
   //this.store = function (property, value) {};

   /**
    * Constructor
    */
   window.Settings = invalidated;
   for ( var property in stored )
      store( property );
   storage_items = JSON.parse(storage.getItem("properties")) || [];
   var value;
   for ( var i = 0; i < storage_items.length; i++ ) {
      value = JSON.parse(storage.getItem(storage_items[i]));
      if ( stored[storage_items[i]] === undefined )
         public_store(storage_items[i], value, true);
      else
         stored[storage_items[i]] = value;
   }
}
