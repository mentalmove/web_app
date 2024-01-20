function Navigation (app, start_index) {

   /**
    * Private properties
    */
   var myself = this;

   var active_tab;

   var settings_zone = iD("header").querySelector(".settings");
   var content_zone = iD("content");
   var hidden_pages = [];
   var initialised_pages = {};


   /**
    * Private methods
    */
   function init_tab (tab, page, callback) {
      myself[page] = tab.show;
      initialised_pages[page] = tab;
      var div = document.createElement("div");
      div.style.display = "none";
      content_zone.appendChild(div);
      tab.content = div;
      io.lh("pages/" + page + ".html", null, function (response) {
         div.innerHTML = response;
         var menu = document.createElement("main");
         menu.style.display = "none";
         settings_zone.appendChild(menu);
         tab.menu = menu;
         io.lh("pages/submenu_" + page + ".html", null, function (response) {
            menu.innerHTML = response;
            if ( callback )
               callback();
         }, function (e) {
            if ( callback )
               callback();
         });
      }, function (e) {
         tab.content = null;
         console.log( e );
      });
   }
   function show_tab (tab) {
      if ( !tab.content )
         return;
      active_tab = tab;
      tab.classList.add("selected");
      tab.content.style.display = "block";
      tab.menu.style.display = "block";
      if ( !tab.menu.innerHTML ) {
         io.lh("pages/submenu_" + tab.page + ".html", null, function (response) {
            tab.menu.innerHTML = response;
            app.set_focus(tab);
         });
      }
      var i;
      for ( i = 0; i < tabs.length; i++ ) {
         if ( !tabs[i].page )
            continue;
         if ( tabs[i] != active_tab ) {
            tabs[i].classList.remove("selected");
            if ( tabs[i].content )
               tabs[i].content.style.display = "none";
            if ( tabs[i].menu )
               tabs[i].menu.style.display = "none";
         }
      }
      for ( i = 0; i < hidden_pages.length; i++ ) {
         if ( hidden_pages[i] != active_tab ) {
            if ( hidden_pages[i].content )
               hidden_pages[i].content.style.display = "none";
            if ( hidden_pages[i].menu )
               hidden_pages[i].menu.style.display = "none";
         }
      }

      app.set_focus(tab);
   }
   /* */
   function extend_pages (hidden_page) {
      page = hidden_page.page;
      fnc = (function (tab) {
         return function (invoker) {
            if ( tab == active_tab || (!tab.active && invoker != app) )
               return;
            show_tab(tab);
         };
      })(hidden_page);
      hidden_page.show = fnc;
      hidden_pages.push(hidden_page);
      if ( hidden_page.activate )
         init_tab(hidden_page, page, fnc);
      else
         init_tab(hidden_page, page);
   }
   function hide_confirmation () {
      iD("confirmation").innerHTML = "";
   }
   function show_confirmation (text, callback, page, controller, button_text) {
      if ( !page ) {
         if ( !text ) {
            hide_confirmation();
            return;
         }
         if ( !button_text )
            button_text = "OK";
         page = "standard_confirmation";
      }
      if ( !controller )
         controller = Confirmation;
      io.lh("pages/" + page + ".html", null, function (response) {
         var div = document.createElement("div");
         div.innerHTML = response;
         iD("confirmation").appendChild(div);
         var close = function () {
            div.querySelector(".close").removeEventListener(POINTERUP, close, false);
            remove_me(div);
            setTimeout(hide_confirmation, 667);
         };
         div.querySelector(".close").addEventListener(POINTERUP, close, false);
         new controller(div, text, button_text, close, callback);
      });
   }


   /**
    * Public methods
    */
   this.activate = function (certificator, tab, active) {
      if ( !tab || certificator != app )
         return;
      tab.active = active;
      if ( active )
         tab.classList.remove("inactive");
      else
         tab.classList.add("inactive");
   };
   this.message = function (text) {
      if ( !myself.message.queue ) {
         myself.message.queue = new Queue();
         io.ls("code/utilities/messenger", function () {
            new Messenger(function (f) {
               var queue = myself.message.queue;
               myself.message = function (t) {
                  f(t);
               };
               var msg;
               do {
                  msg = queue.get();
                  if ( msg )
                     myself.message(msg);
               }
               while (msg);
            });
         });
      }
      myself.message.queue.put(text);
   };



   /**
    * Constructor
    */
   app.define_additional({
      extend_pages: extend_pages,
      pages: initialised_pages
   });
   start_index = start_index || 0;
   var tabs = iD("header").querySelectorAll("span");
   translation.register("navigation", iD("header"));
   var page, fnc;
   for ( var i = 0; i < tabs.length; i++ ) {
      page = tabs[i].getAttribute("page");
      if ( !page )
         continue;
      tabs[i].page = page;
      tabs[i].active = !tabs[i].classList.contains("inactive");
      fnc = (function (tab) {
         return function (ev) {
            if ( tab == active_tab || (!tab.active && ev != app) )
               return;
            show_tab(tab);
         };
      })(tabs[i]);
      tabs[i].addEventListener(POINTERDOWN, fnc, false);
      tabs[i].show = fnc;
      if ( i == start_index )
         init_tab(tabs[i], page, fnc);
      else
         init_tab(tabs[i], page);
   }
   if ( settings.language && settings.language != "DE" )
      translation.translate("navigation", settings.language);
   settings.callback("language", function (lang) {
      translation.translate("navigation", lang);
   }, true);
   this.confirmation = (iD("confirmation")) ? show_confirmation : invalidated;
}
