function View () {

   /**
    * Public methods
    */
   this.extend = function (content, fnc) {
      fnc(content, this);
   };

   /**
    * Methods used to create other methods
    */
   this.standard_connector = function (element) {
      return function (fnc) {
         if ( element.callback )
            element.removeEventListener(POINTERUP, element.callback, false);
         if ( !fnc ) {
            element.classList.add("inactive");
            return;
         }
         element.addEventListener(POINTERUP, fnc, false);
         element.callback = fnc;
         element.classList.remove("inactive");
      };
   };
   this.standard_element_connector = function (element, event) {
      return function (fnc, parameter) {
         if ( element.callback )
            element.removeEventListener(event, element.callback, false);
         if ( !fnc ) {
            element.disabled = true;
            return;
         }
         var f;
         if ( parameter ) {
            f = function () {
               fnc(parameter, this.value);
            };
         }
         else {
            f = function () {
               fnc(this.value);
            };
         }
         element.addEventListener(event, f, false);
         element.callback = f;
         element.disabled = false;
      };
   };
   this.standard_checkbox_connector = function (element) {
      return function (fnc) {
         if ( element.callback )
            element.removeEventListener("change", element.callback, false);
         if ( !fnc ) {
            element.disabled = true;
            return;
         }
         var f = function () {
            fnc(this.checked);
         };
         element.addEventListener("change", f, false);
         element.callback = f;
         element.disabled = false;
      };
   };
}
