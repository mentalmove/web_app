function PreferencesView (content, parent) {

   /**
    * Private properties
    */
   var profile_content = content.querySelector(".main_content");
   var extended_content = content.querySelector(".main_content[name='extended']");
   var label_first_name = profile_content.querySelector("span[name='label_first_name']");
   var first_name = profile_content.querySelector("input[name='first_name']");
   var label_last_name = profile_content.querySelector("span[name='label_last_name']");
   var last_name = profile_content.querySelector("input[name='last_name']");
   var shoe_size = profile_content.querySelector("select[name='shoe_size']");
   var save_button = profile_content.querySelector("div[name='save_button']");
   var option_to_delete = profile_content.querySelector("option");


   /**
    * Public methods
    */
   parent.set_placeholders = function () {
      first_name.setAttribute("placeholder", label_first_name.innerHTML.trim());
      last_name.setAttribute("placeholder", label_last_name.innerHTML.trim());
   };
   parent.connect_first_name = parent.standard_element_connector(first_name, KEYUP);
   parent.connect_last_name = parent.standard_element_connector(last_name, KEYUP);
   parent.connect_shoe_size = parent.standard_element_connector(shoe_size, "change");
   parent.connect_save = parent.standard_connector(save_button);
   parent.set_data = function (profile) {
      if ( !profile )
         return;
      first_name.value = profile.first_name || "";
      last_name.value = profile.last_name || "";
      if ( profile.shoe_size ) {
         shoe_size.value = profile.shoe_size;
         remove_me(option_to_delete);
      }
   };
   parent.shoe_options = function (min, max) {
      var i;
      if ( shoe_size.options.length > 1 ) {
         var first_index = (option_to_delete && option_to_delete.parentNode) ? 1 : 0;
         var last_index = shoe_size.options.length - 1;
         if ( +shoe_size.options[first_index].value <= min && +shoe_size.options[last_index].value >= max )
            return;
         for ( i = last_index; i >= first_index; i-- )
            remove_me(shoe_size.options[i]);
      }
      var option;
      for ( i = min; i <= max; i++ ) {
         option = document.createElement("option");
         option.value = i;
         option.text = i;
         shoe_size.appendChild(option);
      }
   };
   parent.set_valid = function (parameter, valid) {
      var element;
      switch ( parameter ) {
         case "first_name":
            element = first_name;
         break;
         case "last_name":
            element = last_name;
         break;
         case "shoe_size":
            element = shoe_size;
         break;
      }
      if ( !element )
         return;
      if ( valid ) {
         element.classList.remove("warn");
         if ( element == shoe_size )
            remove_me(option_to_delete);
      }
      else
         element.classList.add("warn");
   };
   parent.show_profile = function (show) {
      if ( show )
         profile_content.classList.remove("hidden");
      else
         profile_content.classList.add("hidden");
   };
   parent.show_extended = function (show) {
      if ( show )
         extended_content.classList.remove("hidden");
      else
         extended_content.classList.add("hidden");
   };

   /**
    * Constructor
    */
   io.ls("code/view/extended_preferencesview", function () {
      parent.extend(extended_content, ExtendedPreferencesView);
   });
}
