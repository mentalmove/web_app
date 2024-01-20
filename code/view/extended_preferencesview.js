function ExtendedPreferencesView (content, parent) {

   /**
    * Private properties
    */
   var template = content.querySelector("div[name='template']");
   var list = content.querySelector("span[name='list']");
   var save_button = content.querySelector("div[name='save_button']");
   var add_property_zone = content.querySelector("span[name='add_property_zone']");
   var add_property_button = content.querySelector("div[name='add_property_button']");
   var hide_property_button = add_property_zone.querySelector(".delete");
   var add_button = add_property_zone.querySelector("div[name='add_button']");
   var new_property = add_property_zone.querySelector("input[name='property']");
   var messages_enabled = content.querySelector("input[name='messages_enabled']");
   var message_test_button = content.querySelector("div[name='message_test']");


   /**
    * Public properties
    */
   parent.extended_profile = true;


   /**
    * Public methods
    */
   parent.clear_extended = function () {
      list.innerHTML = "";
   };
   parent.create_extended = function (key, value) {
      var element = template.cloneNode(true);
      var label = element.querySelector("span[name='property']");
      var input = element.querySelector("input[name='value']");
      var delete_button = element.querySelector(".delete");

      label.innerHTML = key;
      input.value = value || "";

      var o = {
         connect_value: parent.standard_element_connector(input, KEYUP),
         connect_delete: parent.standard_connector(delete_button),
         remove_item: function () {
            remove_me(element)
         }
      };

      list.appendChild(element);

      return o;
   };
   parent.connect_extended_save = parent.standard_connector(save_button);
   parent.connect_additional_property = parent.standard_connector(add_property_button);
   parent.connect_cancel_property = parent.standard_connector(hide_property_button);
   parent.show_additional_property = function (show) {
      add_property_zone.style.display = (show) ? "inline" : "none";
      if ( show ) {
         new_property.value = "";
         new_property.focus();
      }
   };
   var add_button_connect = parent.standard_connector(add_button);
   parent.connect_add_button = function (f) {
      if ( !f ) {
         add_button_connect();
         return;
      }
      var ff = function () {
         f(new_property.value);
      };
      add_button_connect(ff);
   };
   parent.set_messages_enabled = function (enabled) {
      messages_enabled.checked = !!enabled;
   };
   parent.connect_messages_enabled = parent.standard_checkbox_connector(messages_enabled);
   parent.connect_message_test = parent.standard_connector(message_test_button);


   /**
    * Constructor
    */
   remove_me(template);
   add_property_zone.style.display = "none";
}
