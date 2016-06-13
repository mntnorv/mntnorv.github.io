/// <reference path="gl.ts"/>

namespace App {
  const TRACK_PIECE_LENGTH = 0.3;
  const SPEED = 0.1;
  const MAX_PIECES_VISIBLE = 50;
  const STEPS_PER_PIECE = TRACK_PIECE_LENGTH / SPEED;

  const GRASS_COLORS = [
    [0, 0.443, 0],
    [0, 0.349, 0]
  ];

  const TRACK_COLORS = [
    [0.2, 0.2, 0.2],
    [0.267, 0.267, 0.267]
  ];

  const SIDE_COLORS = [
    [0.8, 0, 0],
    [0.867, 0.867, 0.867]
  ];

  const TRACK_PIECE_ODD_FEATURES = [
    {
      width: 0.05,
      color: SIDE_COLORS[1]
    }, {
      width: 0.425,
      color: TRACK_COLORS[1]
    }, {
      width: 0.05,
      color: [0.867, 0.867, 0.867]
    }, {
      width: 0.425,
      color: TRACK_COLORS[1]
    }, {
      width: 0.05,
      color: SIDE_COLORS[1]
    }
  ];

  const TRACK_PIECE_EVEN_FEATURES = [
    {
      width: 0.05,
      color: SIDE_COLORS[0]
    }, {
      width: 0.9,
      color: TRACK_COLORS[0]
    }, {
      width: 0.05,
      color: SIDE_COLORS[0]
    }
  ];

  class TrackGenerationFeature {
    steps: number;
    stepsDone: number;
    change: number;
  }

  class TrackGenerationFeatures {
    hill: TrackGenerationFeature;
    turn: TrackGenerationFeature;
  }

  class TrackFeature {
    color: number[];
    width: number;
  }

  class TrackPiece {
    elevation: number;
    turn: number;
    background: number[];
    features: TrackFeature[];
    even: boolean;
  }

  class Polygon {
    color: number[];
    points: number[][];
  }

  class TrackOffsets {
    elevation: number;
    turn: number;
  }

  let
    canvas: HTMLCanvasElement,
    trackFeatures: TrackGenerationFeatures,
    gl: WebGLRenderingContext,
    shaderProgram: WebGLProgram,
    positionLocation: number,
    colorLocation: WebGLUniformLocation,
    projectionLocation: WebGLUniformLocation,
    buffer: WebGLBuffer,
    track           = [] as TrackPiece[],
    camera          = [0, 0, 0],
    stepsMoved      = 0,
    pointsArray     = new Float32Array(12),
    i: number;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.width / 4);
  }

  function generateTrackFeature(current: TrackGenerationFeature, max: number, min: number) {
    let sign: number;

    if (current.steps > current.stepsDone) {
      return current;
    }

    if (Math.random() < 0.5) {
      sign = 1;
    } else {
      sign = -1;
    }

    switch (Math.floor(Math.random() * 2)) {
      case 0:
        return {
          change: 0,
          steps: Math.floor(Math.random() * 10) + 10,
          stepsDone: 0
        };
      case 1:
        return {
          steps: Math.floor(Math.random() * 15) + 15,
          stepsDone: 0,
          change: ((Math.random() * (max - min)) + min) * sign
        };
    }
  }

  function generateTrackPiece(even: boolean, trackFeatures: TrackGenerationFeatures): TrackPiece {
    let elevation: number, features: TrackFeature[];

    trackFeatures.hill = generateTrackFeature(trackFeatures.hill, 1.5, 2.5);
    trackFeatures.turn = generateTrackFeature(trackFeatures.turn, 0.01, 0.03);

    elevation = interpolateTrackElevation(trackFeatures.hill);

    if (even) {
      features = TRACK_PIECE_EVEN_FEATURES;
    } else {
      features = TRACK_PIECE_ODD_FEATURES;
    }

    trackFeatures.hill.stepsDone += 1;
    trackFeatures.turn.stepsDone += 1;

    return {
      elevation: elevation,
      turn: trackFeatures.turn.change,
      background: GRASS_COLORS[even ? 0 : 1],
      features: features,
      even: even
    };
  }

  function transformToCamera(point: number[]) {
    let newPoint = point.slice(0) as number[];

    if (typeof point[0] == 'number') {
      newPoint[0] -= camera[0];
    }

    newPoint[1] -= camera[1];
    newPoint[2] -= camera[2];

    return newPoint;
  }

  function interpolateCameraY(cameraZ: number, offsets: TrackOffsets) {
    let
      interpolationCoef: number,
      bottomPieceIdx: number,
      bottomPiece: TrackPiece,
      bottomPieceY: number,
      i: number,
      cameraY: number;

    interpolationCoef = (cameraZ % TRACK_PIECE_LENGTH) / TRACK_PIECE_LENGTH;
    bottomPieceIdx = Math.floor(cameraZ / TRACK_PIECE_LENGTH);
    bottomPiece = track[bottomPieceIdx];

    bottomPieceY = 0;
    for (i = 0; i < bottomPieceIdx; i += 1) {
      bottomPieceY += track[i].elevation - offsets.elevation;
    }

    cameraY = (bottomPiece.elevation - offsets.elevation) * interpolationCoef + bottomPieceY + 1;

    return cameraY;
  }

  function interpolateTrackElevation(hillFeature: TrackGenerationFeature) {
    return (
      Math.sin(
        (
          Math.PI *
          ((hillFeature.stepsDone + 1) / hillFeature.steps)
        ) - (Math.PI / 2)
      ) * hillFeature.change
    ) - (
      Math.sin(
        (
          Math.PI *
          (hillFeature.stepsDone / hillFeature.steps)
        ) - (Math.PI / 2)
      ) * hillFeature.change
    );
  }

  function interpolateElevationOffset(last: number, now: number, cameraZ: number) {
    let interpolationCoef = (cameraZ % TRACK_PIECE_LENGTH) / TRACK_PIECE_LENGTH;
    return ((now - last) * interpolationCoef + last);
  }

  function build3DTrack(track: TrackPiece[], offsets: TrackOffsets) {
    let
      threeDTrack = [] as Polygon[],
      combinedElevation = 0,
      combinedTurn = 0,
      combinedXOffset = 0,
      piece: TrackPiece,
      feature: TrackFeature,
      featureXOffset: number,
      i: number, j: number, y1: number, y2: number, z1: number, z2: number,
      x1Offset: number, x2Offset: number;

    combinedTurn    += offsets.turn;
    combinedXOffset += offsets.turn;

    for (i = 0; i < track.length; i += 1) {
      combinedElevation += track[i].elevation - offsets.elevation;

      if (i > Math.floor(stepsMoved / STEPS_PER_PIECE)) {
        combinedTurn += track[i].turn;
        combinedXOffset += combinedTurn;
      }
    }

    for (i = (track.length - 1); i >= 0; i -= 1) {
      piece = track[i];

      x1Offset = combinedXOffset - combinedTurn;
      x2Offset = combinedXOffset;
      y1 = combinedElevation - (piece.elevation - offsets.elevation);
      y2 = combinedElevation;
      z1 = i * TRACK_PIECE_LENGTH;
      z2 = (i + 1) * TRACK_PIECE_LENGTH;

      // Background
      threeDTrack.push({
        points: [
          [-1000, y1, z1],
          [ 1000, y1, z1],
          [ 1000, y2, z2],
          [-1000, y2, z2]
        ],
        color: piece.background
      });

      // Features
      featureXOffset = 0;

      for (j = 0; j < piece.features.length; j += 1) {
        feature = piece.features[j];

        threeDTrack.push({
          points: [
            [
              -1 + (featureXOffset * 2) + x1Offset,
              y1, z1
            ], [
              -1 + ((featureXOffset + feature.width) * 2) + x1Offset,
              y1, z1
            ], [
              -1 + ((featureXOffset + feature.width) * 2) + x2Offset,
              y2, z2
            ], [
              -1 + (featureXOffset * 2) + x2Offset,
              y2, z2
            ]
          ],
          color: feature.color
        });

        featureXOffset += feature.width;
      }

      combinedElevation -= (piece.elevation - offsets.elevation);
      combinedXOffset   -= combinedTurn;
      combinedTurn      -= piece.turn;
    }

    return threeDTrack;
  }

  function update() {
    let
      invisiblePieces: number,
      piecesToRemove: number,
      i: number,
      lastPieceEven: boolean,
      offsets: TrackOffsets;

    // Advance position
    stepsMoved += 1;
    camera[2] = stepsMoved * SPEED;

    // Remove old track pieces, add new ones
    piecesToRemove = Math.floor(stepsMoved / STEPS_PER_PIECE) - 2;
    lastPieceEven = track[track.length - 1].even;

    if (piecesToRemove > 0) {
      track.splice(0, piecesToRemove);

      for (i = 0; i < piecesToRemove; i += 1) {
        lastPieceEven = !lastPieceEven;
        track.push(generateTrackPiece(lastPieceEven, trackFeatures));
      }

      stepsMoved -= piecesToRemove * STEPS_PER_PIECE;
      camera[2] = stepsMoved * SPEED;
    }

    offsets = {
      elevation: 0,
      turn: 0
    };

    // Update elevation offset
    offsets.elevation = interpolateElevationOffset(
      (track[0].elevation + track[1].elevation + track[2].elevation + track[3].elevation + track[4].elevation) / 5,
      (track[1].elevation + track[2].elevation + track[3].elevation + track[4].elevation + track[5].elevation) / 5,
      camera[2]
    );

    // Update turn offset
    invisiblePieces = Math.floor(stepsMoved / STEPS_PER_PIECE);
    offsets.turn = (1 - ((stepsMoved % STEPS_PER_PIECE) / STEPS_PER_PIECE)) * track[invisiblePieces].turn;

    // Interpolate camera Y
    camera[1] = interpolateCameraY(camera[2], offsets);

    // Build 3D track
    return build3DTrack(track, offsets);
  }

  function render(polygons: Polygon[]) {
    let
      polygon: Polygon,
      point: number[],
      i: number, j: number;

    for (i = 0; i < polygons.length; i += 1) {
      polygon = polygons[i];

      for (j = 0; j < polygon.points.length; j += 1) {
        point = transformToCamera(polygon.points[j].slice(0));

        pointsArray[j * 3]     = point[0];
        pointsArray[j * 3 + 1] = point[1];
        pointsArray[j * 3 + 2] = point[2];
      }

      gl.uniform4f(
        colorLocation,
        polygon.color[0], polygon.color[1], polygon.color[2], 1
      );

      gl.uniformMatrix4fv(
        projectionLocation, false,
        GL.perspectiveMatrix()
      );

      gl.bufferData(gl.ARRAY_BUFFER, pointsArray, gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
  }

  function nextFrame() {
    let threeDTrack: Polygon[];

    threeDTrack = update();
    render(threeDTrack);

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

  // Initial track features
  trackFeatures = {
    hill: { steps: 0, stepsDone: 0, change: 0 },
    turn: { steps: 0, stepsDone: 0, change: 0 }
  };

  // Initial track
  for (i = 0; i < MAX_PIECES_VISIBLE; i += 1) {
    track.push(generateTrackPiece(i % 2 === 0, trackFeatures));
  }

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  // Start
  resizeCanvas();
  nextFrame();
}
