function VersatileTabview (content, parent) {

   /**
    * Private properties
    */
   var zones = {
      html: content.querySelector("div[name='html']"),
      css: content.querySelector("div[name='css']"),
      javascript: content.querySelector("div[name='javascript']")
   };
   var entry = content.querySelector(".entry[name='template']");
   var end_line_breaks = {};


   /**
    * Private methods
    */
   function end_line_break (section) {
      if ( !end_line_breaks[section] ) {
         line_break = document.createElement("span");
         line_break.innerHTML = "&nbsp;";
         end_line_breaks[section] = line_break;
      }
      return end_line_breaks[section];
   }

   /**
    * Public methods
    */
   parent.html = function () {
      zones.html.classList.remove("hidden");
      zones.css.classList.add("hidden");
      zones.javascript.classList.add("hidden");
   };
   parent.css = function () {
      zones.html.classList.add("hidden");
      zones.css.classList.remove("hidden");
      zones.javascript.classList.add("hidden");
   };
   parent.javascript = function () {
      zones.html.classList.add("hidden");
      zones.css.classList.add("hidden");
      zones.javascript.classList.remove("hidden");
   };
   parent.create_entry = function (section) {
      var element = entry.cloneNode(true);

      var headline = element.querySelector("span.subheadline");
      var url_zone = element.querySelector("span.linky");
      var icon = element.querySelector(".icon");
      var content_zone = element.querySelector(".machine");
      if ( section == "javascript" )
         content_zone.classList.add("code");

      var connect_icon_open = parent.standard_connector(icon);
      var connect_url_zone_open = parent.standard_connector(url_zone);

      var o = {
         headline: function (s) {
            headline.innerHTML = s;
         },
         url: function (s) {
            url_zone.innerHTML = s;
         },
         content: function (s) {
            if ( section == "html" ) {
               // Will probably look weird in application-own code view
               s = s.replace(/</g, "&lt;");
               s = s.replace(/>/g, "&gt;");
            }
            content_zone.innerHTML = s;
         },
         open: function () {
            element.classList.add("open");
            url_zone.classList.add("visited");
         },
         close: function () {
            element.classList.remove("open");
         },
         // The more letters `f`, the better
         connect_open: function (f) {
            var ff = function () {
               f(!element.classList.contains("open"));
            };
            connect_icon_open(ff);
            var fff = function () {
               if ( element.classList.contains("open") )
                  return;
               f(true);
            };
            connect_url_zone_open(fff);
         }
      };
      element.appendChild(end_line_break(section));
      zones[section].appendChild(element);
      
      return o;
   };

   /**
    * Constructor
    */
   remove_me(entry);
}
