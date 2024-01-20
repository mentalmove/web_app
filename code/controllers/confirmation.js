function Confirmation (content, text, button_text, close, callback) {

   /**
    * Private methods
    */
   function confirm () {
      if ( callback )
         callback();
      close();
   }


   /**
    * Constructor
    */
   var view = new View();
   var text_zone = content.querySelector(".text");
   if ( text )
      text_zone.innerHTML = text;
   var button = content.querySelector(".button");
   if ( button_text )
      button.innerHTML = button_text;
   var connect_confirmation = view.standard_connector(button);
   translation.register("confirmation", content);
   if ( settings.language && settings.language != "DE" )
      translation.translate("confirmation", settings.language);
   settings.callback("language", function (lang) {
      translation.translate("confirmation", lang);
   });
   connect_confirmation(confirm);
}
