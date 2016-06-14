namespace App {
  const MIN_WIDTH  = 240;
  const MIN_HEIGHT = 135;

  class Polygon {
    points: [number, number][];
    color: string;
  }

  let
    realCanvas: HTMLCanvasElement,
    realCtx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    polygons: Polygon[],
    pixel: ImageData,
    paused = false;

  function resizeCanvas() {
    let pixelRatio: number;

    pixelRatio = Math.min(
      window.innerWidth  / MIN_WIDTH,
      window.innerHeight / MIN_HEIGHT
    );

    canvas.width  = Math.ceil(window.innerWidth  / pixelRatio);
    canvas.height = Math.ceil(window.innerHeight / pixelRatio);

    realCanvas.width  = window.innerWidth;
    realCanvas.height = window.innerHeight;

    (realCtx as any).mozImageSmoothingEnabled = false;
    (realCtx as any).webkitImageSmoothingEnabled = false;
    (realCtx as any).msImageSmoothingEnabled = false;
    (realCtx as any).imageSmoothingEnabled = false;

    ctx.translate(0.5, 0.5);
  }

  function drawLine(fromP: [number, number], toP: [number, number]) {
    let
      x1   = fromP[0], y1 = fromP[1],
      x2   = toP[0],   y2 = toP[1],
      xMin = Math.min(x1, x2),
      xMax = Math.max(x1, x2),
      x: number, y: number;

    for (x = xMin; x < xMax; x++) {
      y = (((y2 - y1) / (x2 - x1)) * (x - x1)) + y1;
      pixel.data[0] = 0;
      pixel.data[1] = 0;
      pixel.data[2] = 0;
      pixel.data[3] = 255;
      ctx.putImageData(pixel, x, y);
    }
  }

  function render() {
    let polygon: Polygon, i: number, j: number;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < polygons.length; i++) {
      polygon = polygons[i];

      for (j = 0; j < (polygon.points.length - 1); j++) {
        drawLine(
          polygon.points[j],
          polygon.points[j + 1]
        );
      }
    }

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

  pixel = ctx.createImageData(1, 1);

  // Add text
  polygons = [];

  polygons.push({
    points: [
      [10, 10],
      [10, 40],
      [20, 40],
      [20, 20],
      [25, 30],
      [30, 20],
      [30, 40],
      [40, 40],
      [40, 10],
      [30, 10],
      [25, 20],
      [20, 10]
    ],
    color: '#000'
  });

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  // Start
  resizeCanvas();
  nextFrame();
}
