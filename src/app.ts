namespace App {
  const MIN_WIDTH  = 240;
  const MIN_HEIGHT = 135;

  let
    realCanvas: HTMLCanvasElement,
    realCtx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    paused = false;

  function resizeCanvas() {
    let pixelRatio: number;

    pixelRatio = Math.min(
      window.innerWidth  / MIN_WIDTH,
      window.innerHeight / MIN_HEIGHT
    );

    canvas.width  = Math.ceil(window.innerWidth  / pixelRatio);
    canvas.height = Math.ceil(window.innerHeight / pixelRatio);

    console.log(pixelRatio, canvas.width, canvas.height);

    realCanvas.width  = window.innerWidth;
    realCanvas.height = window.innerHeight;

    (realCtx as any).mozImageSmoothingEnabled = false;
    (realCtx as any).webkitImageSmoothingEnabled = false;
    (realCtx as any).msImageSmoothingEnabled = false;
    (realCtx as any).imageSmoothingEnabled = false;

    ctx.translate(0.5, 0.5);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000';
    ctx.moveTo(10, 10);
    ctx.lineTo(10, 20);
    ctx.stroke();

    realCtx.clearRect(0, 0, realCanvas.width, realCanvas.height);
    realCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height,
      0, 0, realCanvas.width, realCanvas.height);
  }

  export function playPause() {
    paused = !paused;

    if (!paused) {
      requestAnimationFrame(nextFrame);
    }
  }

  export function nextFrame() {
    render();

    if (!paused) {
      window.requestAnimationFrame(nextFrame);
    }
  }

  // Initialize stuff
  realCanvas = document.getElementById('game') as HTMLCanvasElement;
  realCtx    = realCanvas.getContext('2d');
  canvas     = document.createElement('canvas');
  ctx        = canvas.getContext('2d');

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  // Start
  resizeCanvas();
  nextFrame();
}
