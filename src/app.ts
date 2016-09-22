/// <reference path="gl.ts"/>

namespace App {
  // const POINTS_X = 20;
  // const POINTS_Y = 20;

  // class Point {
  //   x: number;
  //   y: number;
  //   z: number;
  // }

  // class Polygon {
  //   color: number[];
  //   points: Point[];
  // }

  // let
  //   canvas: HTMLCanvasElement,
  //   gl: WebGLRenderingContext,
  //   shaderProgram: WebGLProgram,
  //   positionLocation: number,
  //   colorLocation: WebGLUniformLocation,
  //   projectionLocation: WebGLUniformLocation,
  //   buffer: WebGLBuffer,
  //   heights: number[],
  //   pointsArray = new Float32Array(12),
  //   i: number, j: number;

  // function resizeCanvas() {
  //   canvas.width  = window.innerWidth;
  //   canvas.height = window.innerHeight;
  //   gl.viewport(0, 0, canvas.width, canvas.height);
  // }
  let
    lastMouseX = 0,
    lastMouseY = 0;

  function nextFrame() {
    window.requestAnimationFrame(nextFrame);
  }

  function mouseMove(e) {
    let
      dx = e.screenX - lastMouseX,
      dy = e.screenY - lastMouseY,
      dl: number, rdx: number, rdy: number;

    dl = Math.sqrt((dx * dx) + (dy * dy));
    rdx = dx / dl;
    rdy = dy / dl;

    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
  }

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('mousemove', mouseMove, false);

  // Start
  nextFrame();
}
