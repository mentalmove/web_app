function TagCollector (app, pages, callback) {

   /**
    * Private properties
    */
   var myself = this;

   pages = pages || {};
   var additional_html = [
      "standard_confirmation",
      "privacy",
      "reset_all",
      "circles",
      "squares",
      "which_square"
   ];
   var additional_css = [
      "mobile_main",
      "fun_stuff"
   ];
   var additional_javascript = [
      "code/view/mobile_main_companion",
      "code/view/extended_preferencesview",
      "code/utilities/messenger",
      "code/controllers/triangles",
      "code/controllers/circles",
      "code/controllers/squares",
      "code/utilities/sliding_puzzle_solver",
      "code/workers/prepare_squares",
      "code/workers/partial_square_solution",
      "code/controllers/which_square"
   ];

   /**
    * Public properties
    * No need to really mention `collection` - will be or will not be created
    */
   //this.collection = null;

   /**
    * Private methods
    */
   function Entry (url, headline, content, type) {
      var me = this;
      this.url = url;
      this.headline = headline;
      this.content = content || null;

      this.load_content = function (callback, do_anyway, hide_line_numbers) {
         if ( me.content && callback && !do_anyway ) {
            callback(me.content);
            return;
         }
         if ( !me.url )
            return;
         io.lh(me.url, null, function (response) {
            if ( !response )
               return;
            if ( type && type != "html" ) {
               me.line_numbers = !hide_line_numbers;
               var content = response;
               if ( type == "javascript" ) {
                  var headline_match = content.match(/^function\s+([A-Z]\w+)\s*\(/);
                  if ( headline_match )
                     me.headline = headline_match[1];
                  content = highlight_code(content);
               }
               if ( !hide_line_numbers )
                  content = add_line_numbers(content);
               me.content = content;
            }
            else
               me.content = response;
            if ( callback )
               callback(me.content);
         });
      };
   }
   function ucfirst (s) {
      if ( !s )
         return null;
      return s.substr(0, 1).toUpperCase() + s.substr(1);
   }
   function camelCase (s) {
      if ( !s )
         return null;
      return s.replace(/_(\w)/g, function (a, m) {
         return m.toUpperCase();
      });
   }
   function format_lines (num, digits) {
      var num_string = "" + num;
      for ( var i = num_string.length; i < digits; i++ )
         num_string = "0" + num_string;
   
      return "<tt style='color: #555555'>" + num_string + "</tt>" + "\t";
   }
   function add_line_numbers (s) {
      if ( !s )
         return s;
      var total = parseInt(s.match(/\n/g).length);
      var digits = 1;
      while ( total >= 10 ) {
         total /= 10;
         digits++;
      }
      var line = 1;
      return format_lines(line, digits) + s.replace(/(\n)/g, function (m, p1) {
         return p1 + format_lines(++line, digits);
      });
   }
   /* */
   function not_the_comma (s, col) {
      return s.replace(/([^,]+)/g, "<span style='color: " + col + "'>$1</span>");
   }
   var all_functions = [];
   function remember_function (f) {
      all_functions.push(f.trim());
      return f + "*";
   }
   function highlight_called_functions (code) {
      var regEx1, regEx2;
      for ( var i = 0; i < all_functions.length; i++ ) {
         regEx1 = new RegExp("(" + all_functions[i] + ")(\\*)", "g");
         regEx2 = new RegExp("(" + all_functions[i] + ")(\s?\\()", "g");
         code = code.replace(regEx2, "<span style='color: #A8B4CC'>$1</span>$2");
         code = code.replace(regEx1, "$1");
      }
      return code;
   }
   function highlight_code (code) {
      // Green single line comments
      code = code.replace(/(\/\/\s?[^\n]+)/g,
         "<span style='color: #007700'>$1</span>");
      // Green multi line comments
      code = code.replace(/(\/\*\*?[^\/]+\/)/g,
         "<span style='color: #007700'>$1</span>");
      // Blue function names, discreet orange function parameters - comma to be untouched
      code = code.replace(/(function\s+)(\w+)(\s?\()([^\)]*)/g,
         function(m, p1, p2, p3, p4) { 
            var colour = (p2.charAt(0) == p2.charAt(0).toUpperCase()) ? "#6699FF" : "#A8CCFF";
            return p1
            + "<span style='color: " + colour + "'>" + remember_function(p2) + "</span>"
            + p3 + not_the_comma(p4, "#D79800") });
      // Obtrusive orange variables - comma to be untouched
      code = code.replace(/(var\s+)(\w+)(,+\s?\w+\s?)*/g,
         function (m, p1) {
            return p1 + not_the_comma(m.replace(p1, ""), "#FF8000")
         });
      // Special colours when prototypes are used
      code = code.replace(/(\w+\.)(prototype)(\.\w+)/g,
         "<span style='color: #A8C700'>$1</span><span style='color: #CFB070'>$2</span>"
         + "<span style='color: #A8C700'>$3</span>");
      // So-called public properties
      code = code.replace(/(this\.)(\w+)(\s*=\s)([^\n|;]+)/g,
         function(m, p1, p2, p3, p4) {
            var is_function = (p4.indexOf("function") != -1) ? 1 : 0;
            var colour = (is_function) ? "#A8CCFF" : "#FF8000";
            if ( is_function )
               p2 = remember_function(p2);
            return p1 + "<span style='color: " + colour + "'>" + p2 + "</span>"  + p3 + p4;
         });
      code = code.replace(/(parent\.)(\w+)(\s*=\s)([^\n|;]+)/g,
         function(m, p1, p2, p3, p4) {
            var is_function = (p4.indexOf("function") != -1) ? 1 : 0;
            var colour = (is_function) ? "#A8CCFF" : "#FF8000";
            if ( is_function )
               p2 = remember_function(p2);
            return p1 + "<span style='color: " + colour + "'>" + p2 + "</span>"  + p3 + p4;
         });

      // Light blue for all functions defined above
      code = highlight_called_functions(code);

      return code;
   }
   /* */


   /**
    * Constructor
    */
   var entry, i, prop, url, headline;
   io.lh("index.html", null, function (response) {
      if ( !response )
         return;
      var div = document.createElement("div");
      div.innerHTML = response;
      var scripts = div.querySelectorAll("script");
      var styles = div.querySelectorAll("link");
      var body = response.match(/(<body>)(.*)(<\/body>)/s)[2];
      if ( !scripts.length || !styles.length || !body )
         return;
      body = body.replace(/^\n+/, "");
      body = body.replace(/\s+$/s, "");
      myself.collection = {
         html: [],
         css: [],
         javascript: []
      };

      entry = new Entry("index.html", "Root", body);
      myself.collection.html.push(entry);
      for ( prop in pages ) {
         url = "pages/" + pages[prop].page + ".html";
         headline = ucfirst(pages[prop].page);
         if ( pages[prop].innerText )
            headline += " (" + pages[prop].innerText + ")";
         entry = new Entry(url, headline, pages[prop].content.innerHTML);
         myself.collection.html.push(entry);

         url = "pages/submenu_" + pages[prop].page + ".html";
         headline += " Menu";
         entry = new Entry(url, headline, pages[prop].menu.innerHTML);
         myself.collection.html.push(entry);
      }
      for ( i = 0; i < additional_html.length; i++ ) {
         url = "pages/" + additional_html[i] + ".html";
         headline = camelCase(ucfirst(additional_html[i]));
         entry = new Entry(url, headline);
         myself.collection.html.push(entry);
      }
      
      for ( i = 0; i < styles.length; i++ ) {
         url = styles[i].getAttribute("href");
         if ( !url )
            continue;
         headline = url.match(/\/([\w-]+)\.s?css$/)[1];
         headline = camelCase(ucfirst(headline));
         entry = new Entry(url, headline, null, "css");
         myself.collection.css.push(entry);
      }
      for ( i = 0; i < additional_css.length; i++ ) {
         url = "styles/" + additional_css[i] + ".css";
         headline = url.match(/\/([\w-]+)\.s?css$/)[1];
         headline = camelCase(ucfirst(headline));
         entry = new Entry(url, headline, null, "css");
         myself.collection.css.push(entry);
      }

      for ( i = 0; i < scripts.length; i++ ) {
         url = scripts[i].getAttribute("src");
         if ( !url )
            continue;
         headline = url.match(/\/([\w-]+)\.js$/)[1];
         headline = camelCase(ucfirst(headline));
         entry = new Entry(url, headline, null, "javascript");
         myself.collection.javascript.push(entry);
      }
      for ( i = 0; i < additional_javascript.length; i++ ) {
         url = additional_javascript[i];
         if ( !/\.js$/.test(url) )
            url += ".js";
         headline = url.match(/\/([\w-]+)\.js$/)[1];
         headline = camelCase(ucfirst(headline));
         entry = new Entry(url, headline, null, "javascript");
         myself.collection.javascript.push(entry);
      }

      if ( callback )
         callback( myself.collection );
    });
}
