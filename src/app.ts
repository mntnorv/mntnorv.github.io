namespace App {
  const POINTS_X = 20;
  const POINTS_Y = 20;

  class Point3 {
    x: number;
    y: number;
    z: number;
  }

  class Point2 {
    x: number;
    y: number;
  }

  class Polygon {
    points: Point2[];
    color: string;
  }

  let
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    waterPoints: Point3[],
    paused = false,
    i: number, j: number;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function projectPoint3(point: Point3) {
    let point2: Point2;

    point2 = {
      x: point.x * canvas.width,
      y: point.y * canvas.height
    };

    point2.y -= (point.z * canvas.height) / POINTS_Y;

    return point2;
  }

  function render() {
    let
      points2D: Point2[],
      polygons: Polygon[],
      i: number, j: number, point: Point2, color: string;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points2D = [];
    for (i = 0; i < waterPoints.length; i++) {
      points2D.push(projectPoint3(waterPoints[i]));
    }

    polygons = [];
    for (i = 0; i < (POINTS_Y - 1); i++) {
      for (j = 0; j < (POINTS_X - 1); j++) {
        color = Math.round((((i * POINTS_Y) + j) / (POINTS_X * POINTS_Y)) * 255).toString(16);

        if (color.length < 2) {
          color = '0' + color;
        }

        polygons.push({
          points: [
            points2D[i * POINTS_X + j],
            points2D[i * POINTS_X + (j + 1)],
            points2D[(i + 1) * POINTS_X + j]
          ],
          color: '#0000' + color
        });

        polygons.push({
          points: [
            points2D[i * POINTS_X + (j + 1)],
            points2D[(i + 1) * POINTS_X + j],
            points2D[(i + 1) * POINTS_X + (j + 1)]
          ],
          color: '#0000' + color
        });
      }
    }

    for (i = 0; i < polygons.length; i++) {
      ctx.fillStyle = polygons[i].color;
      ctx.beginPath();

      for (j = 0; j < polygons[i].points.length; j++) {
        point = polygons[i].points[j];

        if (j === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.fill();
    }
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
  canvas = document.getElementById('game') as HTMLCanvasElement;
  ctx    = canvas.getContext('2d');

  // Initialize water
  waterPoints = [];

  for (i = 0; i < POINTS_Y; i++) {
    for (j = 0; j < POINTS_X; j++) {
      waterPoints.push({
        x: (j / (POINTS_X - 2) + ((i % 2) * (1 / POINTS_X))) - (1 / POINTS_X),
        y: i / (POINTS_Y - 2),
        z: Math.random()
      });
    }
  }

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  // Start
  resizeCanvas();
  nextFrame();
}
