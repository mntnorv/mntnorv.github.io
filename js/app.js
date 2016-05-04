(function () {
  'use strict';
  
  var
    textElem  = document.getElementById('content'),
    rotationX = 0.0000001,
    rotationY = 0.0000001,
    halfWidth, halfHeight, distance;

  function toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  function onDocumentMouseMove(e) {
    rotationX = Math.atan((halfHeight - e.pageY) / distance);
    rotationY = Math.atan((e.pageX - halfWidth)  / distance);
  }

  function onOrientationChanged(e) {
    var
      x = event.beta,  // In degree in the range [-180,180]
      y = event.gamma; // In degree in the range [-90,90]

    // Because we don't want to have the device upside down
    // We constrain the x value to the range [-90,90]
    if (x >  90) { x =  90; }
    if (x < -90) { x = -90; }

    // Flip the y dimension
    y = y * -1;

    // 10 is half the size of the ball
    // It center the positioning point to the center of the ball
    rotationX = toRadians(x);
    rotationY = toRadians(y);
  }

  function onWindowResize() {
    halfWidth  = window.innerWidth / 2;
    halfHeight = window.innerHeight / 2;
    distance   = Math.max(window.innerWidth, window.innerHeight) * 2;
  }

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('deviceorientation', onOrientationChanged, false);

  onWindowResize();

  function render() {
    window.requestAnimationFrame(render);
    textElem.style.transform = 'perspective(900px) translate(-50%, -50%) rotateX(' + rotationX + 'rad) rotateY(' + rotationY + 'rad)';
  }
  render();
}());
