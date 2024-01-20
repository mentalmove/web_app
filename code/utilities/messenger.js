function Messenger (callback) {

   /**
    * Private properties
    */
   var message_zone = iD("messenger");
   var template = message_zone.querySelector("div");
   var block_time = 0;
   var timestamp = 0;


   /**
    * Private methods
    */
   function fade (element) {
      element.classList.add("shrink");
      setTimeout(remove_me, 1001, element);
   }
   function message (text, do_anyway) {
      var new_timestamp = (new Date()).getTime();
      var difference = new_timestamp - timestamp;
      if ( difference < 975 ) {
         setTimeout(message, (block_time + 1000 - difference), text, true);
         block_time += 1000;
         return;
      }
      else
         block_time = 0;
      timestamp = new_timestamp;
      var div = template.cloneNode();
      if ( settings.language && settings.language != "DE" && Dictionary.messages[text] )
         text = Dictionary.messages[text];
      div.innerHTML= text;
      var t = 5001;
      if ( text.length && text.length > 250 )
         t += (100 * (text.length - 250));
      div.ondblclick = function () {
         remove_me(this);
      };
      setTimeout(fade, t, div);
      random_colour(div);
      message_zone.appendChild(div);
   }


   /**
    * Constructor
    */
   message_zone.innerHTML = "";
   template.style.display = "block";
   message_zone.style.display = "block";
   for ( var i = 0; i < Messages.length; i++ )
      Dictionary.messages[Messages[i].de] = Messages[i].en;
   if ( callback )
      callback(message);
}

