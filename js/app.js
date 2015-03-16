(function() {
  var textElem   = document.getElementById('text'),
      rotationX  = 0,
      rotationY  = 0,
      mouse      = { x: 0, y: 0 },
      halfWidth, halfHeight, distance;
  
  function onDocumentMouseMove (e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  };
  
  function onWindowResize () {
    halfWidth  = window.innerWidth / 2;
    halfHeight = window.innerHeight / 2;
    distance   = Math.max(window.innerWidth, window.innerHeight) * 2;
  };
  
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);

  onWindowResize();

  function update() {
    rotationX = Math.atan((halfHeight - mouse.y) / distance);
    rotationY = Math.atan((mouse.x - halfWidth)  / distance);
  };
  
  function render() {
    requestAnimationFrame(render);
    update();
    textElem.style.transform = 'translate(-50%, -50%) rotateX(' + rotationX + 'rad) rotateY(' + rotationY + 'rad)';
  }
  render();
})();
