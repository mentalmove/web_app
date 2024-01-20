function App () {

   /**
    * Private properties
    */
   var myself = this;

   var tab1, tab2, tab3, preferences;
   var active_controller;
   var first_tab_index = 0;
   var pages;
   var extend_pages;
   var office_box;
   var tag_collector;

   var hidden_pages = [
      {
         page: "preferences",
         active: true,
         classList: {
            add: function() {},
            remove: function() {}
         }
         /* ,activate: true */
      }
   ];


   /**
    * Private methods
    */
   function activate_all (active) {
      for ( var page in pages )
         navigation.activate(myself, pages[page], active);
   }
   function evaluate_office_box (controller, key) {
      var queue = office_box[key];
      if ( !queue )
         return;
      var command;
      do {
         command = queue.get();
         if ( command && controller[command[0]] )
            controller[command[0]].apply(myself, command.slice(1));
      }
      while (command);
   }


   /**
    * Public methods
    */
   this.set_focus = function (tab) {
      var has_menu = !!tab.menu.innerHTML;
      var controller;
      switch ( tab.page ) {
         case "tab1":
            if ( !window.Tab1 )
               return;
            if ( !tab1 ) {
               tab1 = new Tab1(tab.content, myself);
            }
            controller = tab1;
         break;
         case "tab2":
            if ( !window.Tab2 )
               return;
            if ( !tab2 ) {
               tab2 = new Tab2(tab.content, myself);
            }
            controller = tab2;
         break;
         case "tab3":
            if ( !window.Tab3 )
               return;
            if ( !tab3 ) {
               tab3 = new Tab3(tab.content, myself);
            }
            controller = tab3;
         break;
         case "preferences":
            if ( !window.Preferences )
               return;
            if ( !preferences ) {
               preferences = new Preferences(tab.content, myself);
            }
            controller = preferences;
         break;
      }
      if ( controller ) {
         if ( !controller.menu && has_menu )
            controller.set_menu(tab.menu);
         if ( has_menu && office_box && office_box[tab.page] )
            evaluate_office_box(controller, tab.page);
         controller.set_active(true);
      }
      if ( active_controller && active_controller != controller )
         active_controller.set_active();
      active_controller = controller;
   };
   this.define_additional = function (collection) {
      myself.define_additional = invalidated;
      extend_pages = collection.extend_pages;
      pages = collection.pages;
   };
   this.message = function () {
      var args = arguments.callee.arguments;
      if ( args.length < 2 || !pages[args[0]] )
         return;
      var immediately = !!(args.length > 2) && args[2] == true;
      office_box = office_box || {};
      office_box[args[0]] = office_box[args[0]] || (new Queue());
      var a = [];
      for ( var i = 1; i < args.length; i++ )
         a.push(args[i]);
      office_box[args[0]].put(a);

      var controller;
      switch ( args[0] ) {
         case "tab1":
            controller = tab1;
         break;
         case "tab2":
            controller = tab2;
         break;
         case "tab3":
            controller = tab3;
         break;
         case "preferences":
            controller = preferences;
         break;
      }
      if ( controller && (immediately || controller == active_controller) )
         evaluate_office_box(controller, args[0]);
   };
   this.get_tag_collection = function (callback) {
      if ( tag_collector && tag_collector.collection )
         callback(tag_collector.collection);
      else
         tag_collector = new TagCollector(this, pages, callback);
   };


   /**
    * Constructor
    */
   window.io = new IO(this);
   window.settings = new Settings(this);
   if ( !settings.language && location.href.indexOf("github") >= 0 )
      settings.language ="EN";
   if ( !settings.profile ) {
      first_tab_index = -1;
      settings.callback("profile", function () {
         activate_all(true);
      });
   }
   window.translation = new Translation(this);
   window.navigation = new Navigation(this, first_tab_index);
   if ( hidden_pages.length && extend_pages ) {
      for ( var i = 0; i < hidden_pages.length; i++ )
         extend_pages(hidden_pages[i]);
   }
   if ( first_tab_index < 0 ) {
      activate_all();
      var wait = (function (preferences_tab) {
         return function () {
            if ( !preferences_tab.menu ) {
               setTimeout(wait, 41);
               return;
            }
            myself.message("preferences", "show_profile");
            navigation.preferences(myself);
         }
      })(pages.preferences);
      wait();
   }
   if ( !settings.privacy ) {
      setTimeout(navigation.confirmation, 1001, null, function () {
         settings.store("privacy", true);
         setTimeout(navigation.confirmation, 10001, "Sollen wir nicht doch ein paar Cookies setzen? Nur so aus Spaß?", null, null, null, "Nein!");
      }, "privacy");
   }
}
