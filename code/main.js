function init () {
   window.init = invalidated;
   new App();
   window.App = invalidated;
}
document.body.onload = init;
setTimeout(function () {
    init();
}, 1001);
