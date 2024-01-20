function IO (app) {

   /**
    * Private methods
    */
   function load_style (url, callback) {
      if ( !/\.s?css$/.test(url) )
         url += ".css";
      if ( url.indexOf("/") == -1 )
         url = "styles/" + url;
      var style_node = document.createElement("link");
      style_node.setAttribute("rel", "stylesheet");
      if ( callback )
         style_node.onload = callback;
      style_node.href = url;
      document.getElementsByTagName("head")[0].appendChild(style_node);
   }
   function load_script (url, callback, param) {
      if ( !/\.js$/.test(url) )
         url += ".js";
      var script_node = document.createElement("script");
      script_node.setAttribute("type", "text/javascript");
      script_node.onload = setTimeout(function (node) {
         if ( callback )
            callback(window[param]);
         node.parentNode.removeChild(node);
      }, 41, script_node);
      script_node.src = url;
      document.getElementsByTagName("head")[0].appendChild(script_node);
   }
   function load_html (url, data, success_callback, failure_callback, method) {
      var ajax_load, ajax_to_h;
      if ( APPOS == "IOS" || /https?:\/\//.test(url) ) {
         ajax_load = send;
         ajax_to_h = to_h;
      }
      else {
         ajax_load = replace_for_fetch;
         ajax_to_h = old2h;
      }

      method = method || ((data) ? "POST" : "GET");
      success_callback = success_callback || function (obj) {
         console.log( obj );
      };
      failure_callback = failure_callback || function (obj) {
         console.log( obj );
      };

      var b = JSON.stringify(data);
      var parameters = {
         method:        method/*,
         headers:       headers()*/
      };
      if ( method != "GET" && method != "HEAD" && b.length )
         parameters.body = "content=" + b;

      ajax_load(url, parameters)
         .then( response => {
            return ajax_to_h(response);
         })
         .then( success_callback ).catch( failure_callback );
   }

   /**
    * Utilities
    */
   function replace_for_fetch (url, parameter_object) {
      return new Promise(function(resolve, reject) {
         var req = new XMLHttpRequest();
         req.open(parameter_object.method, url, true);
         for ( var property in parameter_object.headers )
            req.setRequestHeader(property, parameter_object.headers[property]);
         req.onload = function () {
            if ( req.status == 200 )
               resolve( req.response );
            else
               reject( Error(req.statusText) );
         };
         req.onerror = function () {
            reject( Error("Network Problem") );
         };
         req.send(parameter_object.body);
      });
   }
   function old2h (response) {
      return response;
   }
   function new2h (response) {
      return response.text().catch( logged_error );
   }
   function headers (parameters, do_not_use) {
      var header_object = {
         'Content-type':      "application/x-www-form-urlencoded"
      };
      if ( do_not_use ) {
            for ( var i = 0; i < do_not_use.length; i++ ) {
                if ( header_object[do_not_use[i]] )
                    delete header_object[do_not_use[i]];
            }
        }
      if ( parameters ) {
         for ( var property in parameters )
            header_object[property] = parameters[property];
      }

      return (send == replace_for_fetch) ? header_object : new Headers(header_object);
   }


   /**
    * Public methods
    */
   this.css = load_style;
   this.ls = load_script;
   this.lh = load_html;

   /**
    * Constructor
    */
   var send = window.fetch || replace_for_fetch;
   var to_h = (send == replace_for_fetch) ? old2h : new2h;
}
