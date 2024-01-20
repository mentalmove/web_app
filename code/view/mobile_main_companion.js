function close_submenu () {
   iD("header").querySelector(".settings").classList.remove("active");
   iD("content").removeEventListener(POINTERDOWN, close_submenu, false);
}
iD("header").querySelector(".settings").addEventListener(POINTERDOWN, function () {
   if ( this.classList.contains("active") )
      close_submenu();
   else {
      this.classList.add("active");
      iD("content").addEventListener(POINTERDOWN, close_submenu, false);
   }
}, false);
