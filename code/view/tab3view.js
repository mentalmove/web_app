function Tab3View (content, parent) {

   /**
    * Private properties
    */
   var wrapper = iD("fun_stuff_square");
   var zones = {
      triangles: wrapper.querySelector(".zone[name='triangles']")
   };
   var size_callbacks = [];


   /**
    * Public methods
    */
   parent.set_loaded = function () {
      wrapper.classList.add("loaded");
   };
   parent.get_zone = function (name) {
      return zones[name];
   };
   parent.create_zone = function (name, callback, replacing_name) {
      var filename = replacing_name || name;
      var zone = document.createElement("div");
      zone.className = "zone";
      io.lh("pages/" + filename + ".html", null, function (response) {
         zone.innerHTML = response;
         zones[name] = zone;
         callback(zone);
      }, function (e) {
         callback(null);
      });
      wrapper.appendChild(zone);
      return zone;
   };
   parent.destroy_zone = function (name) {
      if ( zones[name] )
         remove_me(zones[name]);
      delete zones[name];
   };
   parent.set_active = function (zone, active) {
      for ( var zone_name in zones )
         zones[zone_name].style.display = (zone_name == zone && active) ? "block" : "none";
   };
   parent.get_size = function () {
      if ( !size_callbacks.length )
         return;
      var div = document.createElement("div");
      div.className = "blind";
      wrapper.appendChild(div);
      for ( var i = 0; i < size_callbacks.length; i++ )
         size_callbacks[i](div.offsetTop + 1)
      wrapper.removeChild(div);
   };
   parent.set_size_callback = function (f) {
      size_callbacks.push(f);
   };

   /**
    * Constructor
    */
   window.onresize = parent.get_size;
}
