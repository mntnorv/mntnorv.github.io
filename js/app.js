(function () {
  'use strict';
  
  var
    canvas = document.getElementById('background'),
    ctx    = canvas.getContext("2d");
  
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(0, 0, 150, 75);

  function render() {
    window.requestAnimationFrame(render);
  }
  
  render();
}());
