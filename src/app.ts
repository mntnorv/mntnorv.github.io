namespace App {
  let
    lastMouseX = 0,
    lastMouseY = 0,
    links      = document.querySelectorAll('a.mn-link'),
    rdx: number, rdy: number;

  function nextFrame() {
    window.requestAnimationFrame(nextFrame);
  }

  function mouseMove(e) {
    let
      dx = e.screenX - lastMouseX,
      dy = e.screenY - lastMouseY,
      dl: number;

    dl = Math.sqrt((dx * dx) + (dy * dy));
    rdx = dx / dl;
    rdy = dy / dl;

    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
  }

  function onHover(e) {
    let background = e.target.querySelector('.mn-link-background');
    background.className = 'mn-link-background mn-no-transition';
    background.style.transform = 'translate(' + rdx + 'px,' + rdy + 'px)';
    background.className = 'mn-link-background';
    background.style.transform = 'translate(0px,0px)';

    e.target.className = 'mn-link mn-hover'
  }

  function onUnhover(e) {
    let background = e.target.querySelector('.mn-link-background');
    background.style.transform = 'translate(' + (rdx * 15) + 'px,' + (rdy * 15) + 'px)';
    e.target.className = 'mn-link'
  }

  for (var i = links.length - 1; i >= 0; i--) {
    links[i].addEventListener('mouseenter', onHover);
    links[i].addEventListener('mouseleave', onUnhover);
  }

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('mousemove', mouseMove, false);

  // Start
  nextFrame();
}
