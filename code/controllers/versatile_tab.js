function versatileTab (tab) {

   switch (tab) {
      case "tab1":
         var rules = {
            html: ["index", "confirmation", "privacy", "reset_all"],
            css: ["main", "icons"],
            javascript: [
               "global",
               "/io",
               "settings",
               "utilities",
               "translation",
               "navigation",
               "app",
               "main"
            ]
         };
      break;
      case "tab2":
         var rules = {
            html: ["tab", "preferences", "circles", "squares", "which_square"],
            css: ["content", "icons", "fun_stuff"],
            javascript: [
               "view",
               "controllers",
               "dictionary",
               "workers"
            ]
         };
      break;
   }

   return function (content, app) {

      /**
       * Private properties
       */
      var myself = this;
      var is_active = false;
      var menu;
      var own_language = settings.languages[0];
      var collected_tags;
      var entries = {
         html: [],
         css: [],
         javascript: []
      };
      var selected_section;
      var section_indices = {
         html: 2,
         css: 3,
         javascript: 4
      };


      /**
       * Private methods
       */
      function select_section (section, index) {
         view[section]();
         if ( settings.language )
            menu.select([settings.language, section_indices[section]]);
         else
            menu.select(section_indices[section]);
         selected_section = section;
      }
      
      function select_language (language) {
         if ( settings.language != language && settings.languages.includes(language) )
            settings.language = language;
         if ( selected_section && section_indices[selected_section] )
            menu.select([settings.language, section_indices[selected_section]]);
         else
            menu.select(settings.language);
         if ( is_active && settings.language != own_language ) {
            translation.translate(tab, settings.language);
            own_language = settings.language;
         }
      }
      function goto_profile (event) {
         if ( navigation.preferences )
            navigation.preferences();
         else
            menu.connect(4);
      }
      function set_tags (tags) {
         collected_tags = tags;
         if ( menu )
            init();
      }

      function Entry (tag, category, view) {

         var myself = this;

         function open (open) {
            if ( !open ) {
               view.close();
               return;
            }
            view.open();
            for ( var category in entries ) {
               for ( var i = 0; i < entries[category].length; i++ ) {
                  if ( entries[category][i] != myself )
                     entries[category][i].view.close();
               }
            }
            if ( !tag.content ) {
               tag.load_content(function (c) {
                  view.content(c);
                  view.headline(tag.headline);
               });
               if ( settings.messages_enabled )
                  navigation.message(tag.url);
            }
         }

         view.headline(tag.headline);
         view.url(tag.url);
         if ( tag.content )
            view.content(tag.content);
         view.connect_open(open);
         this.view = view;
      }

      function init () {
         var j, entry, view_entry;
         for ( var category in collected_tags ) {
            for ( var i = 0; i < collected_tags[category].length; i++ ) {
               for ( j = 0; j < rules[category].length; j++ ) {
                  if ( collected_tags[category][i].url.indexOf(rules[category][j]) >= 0 ) {
                     view_entry = view.create_entry(category);
                     entry = new Entry(collected_tags[category][i], category, view_entry);
                     entries[category].push(entry);
                     break;
                  }
               }
            }
         }

         if ( entries.html.length ) {
            menu.connect(2, function () {
               select_section("html", 2); // this.innerHTML.trim().toLowerCase()
            });
            select_section("html", 2);
         }
         if ( entries.css.length ) {
            menu.connect(3, function () {
               select_section("css", 3);
            });
            if ( !selected_section )
               select_section("css", 3);
         }
         if ( entries.javascript.length ) {
            menu.connect(4, function () {
               select_section("javascript", 4);
            });
            if ( !selected_section )
               select_section("javascript", 4);
         }
      }


      /**
       * Public methods
       */
      this.set_menu = function (element) {
         view.extend(element, MenuView);
         translation.register(tab, element);
         menu = view.menu;
         myself.menu = menu.entries;
         if ( settings.language )
            menu.select(settings.language);
         menu.connect(0, function () {
            select_language("DE");
         });
         var en = (settings.languages.includes("EN")) ? (function(){select_language("EN");}) : null;
         menu.connect(1, en);
         for ( var i = 2; i < menu.entries.length; i++ )
            menu.connect(menu.entries[i].index);
         if ( menu.entries.length > 6 ) {
            if ( navigation.preferences )
               menu.connect(6, goto_profile);
            else
               menu.connect(6);
         }
         settings.callback("language", select_language, true);
         if ( collected_tags )
            init();
      };
      this.set_active = function (active) {
         is_active = !!active;
         if ( is_active && settings.language && settings.language != own_language ) {
            translation.translate(tab, settings.language);
            own_language = settings.language;
         }
      };


      /**
       * Constructor
       */
      var view = new View();
      view.extend(content, VersatileTabview);
      translation.register(tab, content);
      app.get_tag_collection(set_tags);
   };
}
var Tab1 = versatileTab("tab1");
var Tab2 = versatileTab("tab2");
