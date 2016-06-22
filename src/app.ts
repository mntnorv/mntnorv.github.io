/// <reference path="gl.ts"/>

namespace App {
  const POINTS_X = 20;
  const POINTS_Y = 20;

  class Point {
    x: number;
    y: number;
    z: number;
  }

  class Polygon {
    color: number[];
    points: Point[];
  }

  let
    canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
    shaderProgram: WebGLProgram,
    positionLocation: number,
    colorLocation: WebGLUniformLocation,
    projectionLocation: WebGLUniformLocation,
    buffer: WebGLBuffer,
    heights: number[],
    pointsArray = new Float32Array(12),
    i: number, j: number;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function update() {
    let
      scene: Polygon[],
      qPoints: Point[],
      i: number, j: number, i_offset: number, j_offset: number;

    scene = [];

    for (i = 0; i < (POINTS_Y - 1); i++) {
      for (j = 0; j < (POINTS_X - 1); j++) {
        // Generate points for one quadrangle
        qPoints = [];

        for (i_offset = 0; i_offset < 2; i_offset++) {
          for (j_offset = 0; j_offset < 2; j_offset++) {
            qPoints[i_offset * 2 + j_offset] = {
              x: ((j + j_offset) / (POINTS_X - 1)) * 4 - 2,
              y: ((i + i_offset) / (POINTS_Y - 1)) * 4 - 2,
              z: heights[(i + i_offset) * POINTS_X + (j + j_offset)]
            }
          }
        }

        scene.push({
          color: [0, 0, 0.75],
          points: [qPoints[0], qPoints[1], qPoints[2]]
        });

        scene.push({
          color: [0, 0, 1],
          points: [qPoints[1], qPoints[2], qPoints[3]]
        });
      }
    }

    return scene
  }

  function render(polygons: Polygon[]) {
    let
      polygon: Polygon,
      point: Point,
      i: number, j: number;

    for (i = 0; i < polygons.length; i += 1) {
      polygon = polygons[i];

      for (j = 0; j < polygon.points.length; j += 1) {
        point = polygon.points[j];

        pointsArray[j * 3]     = point.x;
        pointsArray[j * 3 + 1] = point.y;
        pointsArray[j * 3 + 2] = point.z;
      }

      gl.uniform4f(
        colorLocation,
        polygon.color[0], polygon.color[1], polygon.color[2], 1
      );

      gl.uniformMatrix4fv(
        projectionLocation, false,
        GL.perspectiveMatrix(canvas.width, canvas.height)
      );

      gl.bufferData(gl.ARRAY_BUFFER, pointsArray, gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }
  }

  function nextFrame() {
    let scene: Polygon[];

    scene = update();
    render(scene);

    window.requestAnimationFrame(nextFrame);
  }

  // Initialize stuff
  canvas             = document.getElementById('game') as HTMLCanvasElement;
  gl                 = GL.initWebGL(canvas);
  shaderProgram      = GL.initShaders(gl);
  positionLocation   = gl.getAttribLocation(shaderProgram, 'a_position');
  colorLocation      = gl.getUniformLocation(shaderProgram, 'u_color');
  projectionLocation = gl.getUniformLocation(shaderProgram, 'u_projection');

  buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  // Generate initial heights
  heights = []
  for (i = 0; i < POINTS_X * POINTS_Y; i++) {
    heights[i] = Math.random() * -0.2;
  }

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  // Start
  resizeCanvas();
  nextFrame();
}
