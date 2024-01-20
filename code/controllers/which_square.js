function WhichSquare (content, redundant1, redundant2, close, callback) {

   /**
    * Private properties
    */
   var squares = content.querySelectorAll(".clickable");
   var button = content.querySelector(".button");
   var checkbox = content.querySelector("input[type='checkbox']");
   var description = content.querySelector(".description");
   var amount;


   /**
    * Private methods
    */
   function confirm () {
      if ( callback )
         callback(amount, checkbox.checked);
      close();
   }
   function chosen () {
      for ( var i = 0; i < squares.length; i++ ) {
         if ( squares[i] == this )
            squares[i].classList.add("chosen");
         else
            squares[i].classList.remove("chosen");
      }
      if ( this.amount == amount )
         return;
      amount = this.amount;
      checkbox.checked = !!(amount < 16);
      checkbox.disabled = !(amount == 16);
      if ( amount == 16 )
         description.classList.remove("disabled");
      else
         description.classList.add("disabled");
   }

   /**
    * Constructor
    */
   var view = new View();
   var connect;
   for ( var i = 0; i < squares.length; i++ ) {
      // The executing machine is alled `computer`, not `calculator`
      squares[i].amount = squares[i].querySelectorAll("td").length;
      connect = view.standard_connector(squares[i]);
      connect(chosen);
   }
   (chosen.bind(squares[1]))();
   var connect_confirmation = view.standard_connector(button);
   translation.register("confirmation", content);
   if ( settings.language && settings.language != "DE" )
      translation.translate("confirmation", settings.language);
   settings.callback("language", function (lang) {
      translation.translate("confirmation", lang);
   });
   connect_confirmation(confirm);
}
