function Preferences (content, app) {

   /**
    * Private properties
    */
   var myself = this;
   var is_active = false;
   var menu;
   var own_language = settings.languages[0];

   var profile;
   var extended_properties;


   /**
    * Private methods
    */
   function do_reset () {
      if ( window.localStorage ) {
         localStorage.clear();
         setTimeout(function () {
            location.reload();
         }, 41);
      }
      else
         menu.connect(4);
   }
   function reset () {
      navigation.confirmation(null, do_reset, "reset_all");
   }
   function select_language (language) {
      if ( settings.language != language && settings.languages.includes(language) )
         settings.language = language;
      menu.select(settings.language);
      if ( is_active && settings.language != own_language ) {
         translation.translate("preferences", settings.language);
         own_language = settings.language;
         view.set_placeholders();
      }
   }
   function select_profile (event) {
      var selections = [];
      if ( settings.language )
         selections.push(settings.language);
      selections.push(2);
      menu.select(selections);
      view.show_profile(true);
      view.show_extended();
      if ( !settings.profile )
         return;
      menu.connect(2);
      menu.connect(3, select_extended);
   }
   function ExtendedEntry (key, value, view_entry) {
      var myself = this;
      function check () {
         var f = (extended_properties.length || settings.extended_properties) ? save_extended : null;
         for ( var i = 0; i < extended_properties.length; i++ ) {
            if ( !extended_properties[i].value ) {
               f = null;
               break;
            }
         }
         view.connect_extended_save(f);
         create_property(false);
      }
      function value_changed (v) {
         myself.value = v.trim() || null;
         check();
      }
      function delete_item () {
         for ( var i = 0; i < extended_properties.length; i++ ) {
            if ( extended_properties[i].key == key ) {
               extended_properties.splice(i, 1);
               view_entry.remove_item();
               break;
            }
         }
         check();
      }
      view_entry.connect_value(value_changed);
      view_entry.connect_delete(delete_item);
      this.key = key;
      this.value = value;
   }
   function select_extended (event) {
      if ( !settings.profile || !view.extended_profile ) {
         menu.connect(3);
         return;
      }
      var selections = [];
      if ( settings.language )
         selections.push(settings.language);
      selections.push(3);
      menu.select(selections);
      view.show_profile();
      view.show_extended(true);
      menu.connect(2, select_profile);
      menu.connect(3);

      if ( !extended_properties ) {
         extended_properties = [];
         if ( settings.extended_properties ) {
            var entry, view_entry;
            for ( var i = 0; i < settings.extended_properties.length; i++ ) {
               view_entry = view.create_extended(settings.extended_properties[i].key, settings.extended_properties[i].value);
               entry = new ExtendedEntry(settings.extended_properties[i].key, settings.extended_properties[i].value, view_entry);
               extended_properties.push(entry);
            }
         }
         view.connect_additional_property(function () {
            create_property(true);
         });
         view.connect_cancel_property(function () {
            create_property(false);
         });
         view.connect_add_button(property_created);
         view.connect_message_test(function () {
            navigation.message( Messages[0].de );
         });
      }
      view.set_messages_enabled(settings.messages_enabled);
      view.connect_messages_enabled(messages_setting_changed);
   }
   function create_property (create) {
      view.show_additional_property(!!create);
      if ( create )
         view.connect_additional_property();
      else {
         view.connect_additional_property(function () {
            create_property(true);
         });
      }
   }
   function property_created (value) {
      if ( !value.trim() )
         return;
      var view_entry = view.create_extended(value);
      var entry = new ExtendedEntry(value, null, view_entry);
      extended_properties.push(entry);
      create_property(false);
   }
   function messages_setting_changed (enabled) {
      if ( enabled ) {
         navigation.message(Messages[3].de);
         if ( settings.messages_enabled == null )
            navigation.message(Messages[4].de)
      }
      else {
         navigation.message(Messages[1].de);
         navigation.message(Messages[2].de);
      }
      settings.store("messages_enabled", enabled);
      if ( enabled && !settings.one_time_messages )
         settings.store("one_time_messages", []);
   }

   function profile_value_changed (parameter, value) {
      var valid = false;
      var save_fnc = null;
      value = value.trim();
      switch ( parameter ) {
         case "first_name":
            if ( /^[A-Z]/.test(value) && /[a-z]/.test(value) ) {
               valid = true;
               if ( /^[A-Z]/.test(profile.last_name) && /[a-z]/.test(profile.last_name) && profile.shoe_size )
                  save_fnc = save;
            }
         break;
         case "last_name":
            if ( /^[A-Z]/.test(value) && /[a-z]/.test(value) ) {
               valid = true;
               if ( /^[A-Z]/.test(profile.first_name) && /[a-z]/.test(profile.first_name) && profile.shoe_size )
                  save_fnc = save;
            }
         break;
         case "shoe_size":
            if ( !isNaN(value) && +value ) {
               valid = true;
               value = +value;
               if ( /^[A-Z]/.test(profile.first_name) && /[a-z]/.test(profile.first_name) && /^[A-Z]/.test(profile.last_name) && /[a-z]/.test(profile.last_name) )
                  save_fnc = save;
            }
         break;
      }
      view.set_valid(parameter, valid);
      if ( valid )
         profile[parameter] = value;
      view.connect_save(save_fnc);
   }
   function save () {
      var has_profile = !!settings.profile;
      menu.enable();
      view.connect_save();
      settings.callback("profile", set_profile);
      settings.profile = profile;
      menu.connect(3, select_extended);
      menu.connect(5, reset);
      if ( !has_profile || settings.messages_enabled ) {
         navigation.message(Messages[5].de);
         if ( !has_profile )
            navigation.message(Messages[6].de);
      }
   }
   function save_extended () {
      var o = [];
      for ( var i = 0; i < extended_properties.length; i++ ) {
         if ( extended_properties[i].key && extended_properties[i].value )
            o.push({
               key: extended_properties[i].key,
               value: extended_properties[i].value
            });
      }

      if ( o.length )
         settings.store("extended_properties", o);
      else
         settings.store("extended_properties", null);

      extended_properties = null;
      view.clear_extended();
      view.connect_extended_save();
      setTimeout(select_extended, 17);
      if ( settings.messages_enabled )
         navigation.message(Messages[7].de);
   }

   function set_profile (p) {
      profile = {
         first_name: "" + ((p && p.first_name) || (profile && profile.first_name) || ""),
         last_name: "" + ((p && p.last_name) || (profile && profile.last_name) ||  ""),
         shoe_size: (p && p.shoe_size) || (profile && profile.shoe_size) || 0
      };
      view.shoe_options(Math.min(32, profile.shoe_size || 45), Math.max(58, profile.shoe_size || 45));
      view.set_data(profile);
   }


   /**
    * Public methods
    */
   this.set_menu = function (element) {
      view.extend(element, MenuView);
      translation.register("preferences", element);
      menu = view.menu;
      myself.menu = menu.entries;
      if ( settings.language )
         menu.select(settings.language);
      menu.connect(0, function () {
         select_language("DE");
      });
      var en = (settings.languages.includes("EN")) ? (function(){select_language("EN");}) : null;
      menu.connect(1, en);

      menu.connect(2/*, select_profile*/);
      menu.connect(3, select_extended);
      menu.connect(4);
      menu.connect(5, reset);
      myself.show_profile = function () {
         menu.open();
         select_profile();
         menu.disable();
         menu.connect(3);
         menu.connect(5);
      };
      
      settings.callback("language", select_language, true);
   };
   this.set_active = function (active) {
      is_active = !!active;
      if ( is_active && settings.language && settings.language != own_language ) {
         translation.translate("preferences", settings.language);
         own_language = settings.language;
         view.set_placeholders();
      }
   };


   /**
    * Constructor
    */
   var view = new View();
   view.extend(content, PreferencesView);
   translation.register("preferences", content);
   view.set_placeholders();
   set_profile(settings.profile);
   view.connect_first_name(profile_value_changed, "first_name");
   view.connect_last_name(profile_value_changed, "last_name");
   view.connect_shoe_size(profile_value_changed, "shoe_size");
}
