function Tab3 (content, app) {

   /**
    * Private properties
    */
   var myself = this;
   var is_active = false;
   var menu;
   var own_language = settings.languages[0];
   var css_loaded = false;

   var triangles, circles, squares;
   var active_part;


   /**
    * Private methods
    */
   function message_menu_closed (msg) {
      if ( !settings.messages_enabled || menu.is_open )
         return;
      navigation.message(msg);
   }
   function one_time_message (index) {
      if ( !settings.messages_enabled || !settings.one_time_messages )
         return;
      if ( (typeof index).toUpperCase() == "OBJECT" ) {
         for ( var i = 0; i < index.length; i++ )
            one_time_message(index[i]);
         return;
      }
      if ( settings.one_time_messages.includes(index) || !Messages[index] )
         return;
      navigation.message(Messages[index].de);
      var m = settings.one_time_messages;
      m.push(index);
      settings.one_time_messages = m;
   }
   function select_language (language) {
      if ( settings.language != language && settings.languages.includes(language) )
         settings.language = language;
      var selections = [settings.language];
      if ( active_part ) {
         if ( active_part == triangles )
            selections.push(2);
         else {
            if ( active_part == circles )
               selections.push(3);
            else
               selections.push(4);
         }
      }
      menu.select(selections);
      if ( is_active && settings.language != own_language ) {
         translation.translate("tab3", settings.language);
         own_language = settings.language;
      }
   }
   function select_triangles (event) {
      iD("confirmation").innerHTML = "";
      if ( active_part && active_part != triangles )
         active_part.set_active(false);
      active_part = triangles;
      triangles.set_active(true); // active_part.set_active(true);
      var selections = (settings.language) ? [settings.language] : [];
      selections.push(2);
      menu.select(selections);
      view.set_active("triangles", true);
      one_time_message([8, 9]);
   }
   function select_circles (event) {
      iD("confirmation").innerHTML = "";
      if ( active_part && active_part != circles )
         active_part.set_active(false);
      active_part = circles;
      circles.set_active(true); // active_part.set_active(true);
      var selections = (settings.language) ? [settings.language] : [];
      selections.push(3);
      menu.select(selections);
      view.set_active("circles", true);
      one_time_message(10);
   }
   function select_squares (event) {
      if ( active_part && active_part != squares )
         active_part.set_active(false);
      active_part = squares;
      squares.set_active(true);
      var selections = (settings.language) ? [settings.language] : [];
      selections.push(4);
      menu.select(selections);
      view.set_active("squares", true);
   }

   /**
    * Public methods
    */
   this.set_menu = function (element) {
      view.extend(element, MenuView);
      translation.register("tab3", element);
      menu = view.menu;
      myself.menu = menu.entries;
      if ( settings.language )
         menu.select(settings.language);
      menu.connect(0, function () {
         select_language("DE");
      });
      var en = (settings.languages.includes("EN")) ? (function(){select_language("EN");}) : null;
      menu.connect(1, en);
      // Clickable after successful load
      menu.connect(2);
      menu.connect(3);
      menu.connect(4);
      menu.open();
   };
   this.set_active = function (active) {
      if ( active != "pending" )
         is_active = !!active;
      if ( !is_active ) {
         if ( active_part )
            active_part.set_active(false);
         iD("confirmation").innerHTML = "";
         return;
      }
      if ( !menu ) {
         setTimeout(myself.set_active, 41, "pending");
         return;
      }

      var zone;
      if ( !css_loaded ) {
         io.css("fun_stuff", function () {
            css_loaded = true;
            setTimeout(myself.set_active, 17, "pending");
         });
         return;
      }
      if ( triangles === undefined ) {
         // No need to load a single tag
         zone = view.get_zone("triangles");
         if ( !zone ) {
            triangles = null;
            myself.set_active("pending");
            return;
         }
         translation.register("tab3", zone);
         io.ls("code/controllers/triangles", function () {
            if ( !window.Triangles ) {
               triangles = null;
               myself.set_active("pending");
               return;
            }
            triangles = new Triangles(zone);
            view.set_size_callback(triangles.set_size);
            menu.connect(2, select_triangles);
            menu.entries[2].subentries[0].connector(triangles.colourise);
            menu.entries[2].subentries[1].connector(triangles.reset);
            select_triangles();
            view.get_size();
            setTimeout(myself.set_active, 17, "pending");
         });
         return;
      }
      if ( circles === undefined ) {
         view.create_zone("circles", function (zone) {
            if ( !zone ) {
               circles = null;
               myself.set_active("pending");
               return;
            }
            translation.register("tab3", zone);
            io.ls("code/controllers/circles", function () {
               if ( !window.Circles ) {
                  circles = null;
                  myself.set_active("pending");
                  return;
               }
               circles = new Circles(zone);
               view.set_size_callback(circles.set_size);
               menu.connect(3, select_circles);
               view.get_size();
               if ( !active_part )
                  select_circles();
               setTimeout(myself.set_active, 17, "pending");
            });
         });
         return;
      }
      if ( squares === undefined ) {
         view.create_zone("squares", function (zone) {
            if ( !zone ) {
               squares = null;
               myself.set_active("pending");
               return;
            }
            translation.register("tab3", zone);
            io.ls("code/controllers/squares", function () {
               if ( !window.Squares ) {
                  squares = null;
                  myself.set_active("pending");
                  return;
               }
               squares = new Squares(zone);
               squares.solve_connector = menu.entries[4].subentries[0].connector;
               menu.connect(4, select_squares);
               if ( !active_part )
                  select_squares();
               menu.entries[4].subentries[1].connector(function () {
                  iD("confirmation").innerHTML = "";
                  var f = function () {
                     navigation.confirmation(null, function (amount, optimal) {
                        view.destroy_zone("squares");
                        var old_squares = squares;
                        var filename = "squares";
                        if ( amount != 16 )
                           filename = (amount < 16) ? "few_squares" : "many_squares";
                        view.create_zone("squares", function (zone) {
                           squares = new Squares(zone, optimal);
                           squares.solve_connector = old_squares.solve_connector;
                           squares.overwrite_solve_text = old_squares.overwrite_solve_text;
                           squares.show_amount_steps = old_squares.show_amount_steps;
                           old_squares = null;
                           var lang = settings.language || "DE";
                           translation.translate("tab3", lang);
                           select_squares();
                        }, filename);
                     }, "which_square", WhichSquare);
                  };
                  if ( window.WhichSquare )
                     f();
                  else
                     io.ls("code/controllers/which_square", f);
               });
               setTimeout(myself.set_active, 17, "pending");
               squares.overwrite_solve_text = function (t) {
                  view.refill_html(t, 4, 0);
               };
               squares.show_amount_steps = function (amount) {
                  var lang = (settings.language && settings.language.toLowerCase()) || "de";
                  var word = Messages[11][lang];
                  message_menu_closed( "<center>" + amount + " " + word + "</center>" );
               };
            });
         });
         return;
      }

      view.set_loaded();
      view.get_size();
      if ( active_part )
         active_part.set_active(true);
      if ( settings.language && settings.language != own_language ) {
         translation.translate("tab3", settings.language);
         own_language = settings.language;
      }
   };

   /**
    * Constructor
    */
   var view = new View();
   view.extend(content, Tab3View);
   translation.register("tab3", content);
}
