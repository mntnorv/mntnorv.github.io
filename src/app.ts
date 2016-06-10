/// <reference path="gl.ts"/>

namespace App {
  interface TrackGenerationFeature {
    steps: number,
    stepsDone: number
  }

  class HillFeature {
    steps: number;
    stepsDone: number;
    elevation: number;
  }

  class TurnFeature {
    steps: number;
    stepsDone: number;
    turn: number;
  }

  class TrackGenerationFeatures {
    hill: HillFeature;
    turn: TurnFeature;
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

  let
    canvas: HTMLCanvasElement,
    trackFeatures: TrackGenerationFeatures,
    gl: WebGLRenderingContext,
    shaderProgram: WebGLProgram,
    positionLocation: number,
    colorLocation: WebGLUniformLocation,
    buffer: WebGLBuffer,
    trackColors      = [[0.2, 0.2, 0.2], [0.267, 0.267, 0.267]],
    grassColors      = [[0, 0.443, 0], [0, 0.349, 0]],
    sideColors       = [[0.8, 0, 0], [0.867, 0.867, 0.867]],
    track            = [] as TrackPiece[],
    trackPieceL      = 0.3,
    maxPiecesVisible = 50,
    camera           = [0, 0, 0],
    stepsMoved       = 0,
    speed            = 0.1,
    stepsPerPiece    = Math.round(trackPieceL / speed),
    elevationOffset  = 0,
    turnOffset       = 0,
    pointsArray      = new Float32Array(8),
    i: number;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function generateHillFeature(current: HillFeature) {
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
        elevation: 0,
        steps: Math.floor(Math.random() * 10) + 10,
        stepsDone: 0
      };
    case 1:
      return {
        steps: Math.floor(Math.random() * 15) + 15,
        stepsDone: 0,
        elevation: (Math.random() + 1.5) * sign
      };
    }
  }

  function generateTurnFeature(current: TurnFeature) {
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
        turn: 0,
        steps: Math.floor(Math.random() * 10) + 10,
        stepsDone: 0
      };
    case 1:
      return {
        steps: Math.floor(Math.random() * 15) + 15,
        stepsDone: 0,
        turn: ((Math.random() * 0.02) + 0.01) * sign
      };
    }
  }

  function generateTrackPiece(even: boolean): TrackPiece {
    let colorIdx: number, elevation: number, features: TrackFeature[];

    trackFeatures.hill = generateHillFeature(trackFeatures.hill);
    trackFeatures.turn = generateTurnFeature(trackFeatures.turn);

    if (even) {
      colorIdx = 0;
    } else {
      colorIdx = 1;
    }

    // Calculate elevation based on hill feature
    elevation = (
      Math.sin(
        (
          Math.PI *
          ((trackFeatures.hill.stepsDone + 1) / trackFeatures.hill.steps)
        ) - (Math.PI / 2)
      ) * trackFeatures.hill.elevation
    ) - (
      Math.sin(
        (
          Math.PI *
          (trackFeatures.hill.stepsDone / trackFeatures.hill.steps)
        ) - (Math.PI / 2)
      ) * trackFeatures.hill.elevation
    );

    trackFeatures.hill.stepsDone += 1;
    trackFeatures.turn.stepsDone += 1;

    if (even) {
      features = [
        {
          width: 0.05,
          color: sideColors[colorIdx]
        },
        {
          width: 0.9,
          color: trackColors[colorIdx]
        },
        {
          width: 0.05,
          color: sideColors[colorIdx]
        }
      ];
    } else {
      features = [
        {
          width: 0.05,
          color: sideColors[colorIdx]
        },
        {
          width: 0.425,
          color: trackColors[colorIdx]
        },
        {
          width: 0.05,
          color: [0.867, 0.867, 0.867]
        },
        {
          width: 0.425,
          color: trackColors[colorIdx]
        },
        {
          width: 0.05,
          color: sideColors[colorIdx]
        }
      ];
    }

    return {
      elevation: elevation,
      turn: trackFeatures.turn.turn,
      background: grassColors[colorIdx],
      features: features,
      even: even
    };
  }

  function projectVec3(vec3: number[]) {
    let
      hCoef = (canvas.width / 3) / canvas.height,
      wCoef = 1.5,
      x: number, zCoef;

    if (vec3[2] > 0) {
      zCoef = vec3[2] + 1;
    } else {
      zCoef = -1 / (vec3[2] - 1);
    }

    x = (vec3[0] as number * wCoef) / zCoef;

    return [
      x,
      (((vec3[1] / zCoef) + 1) * hCoef) - 1
    ];
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

  function interpolateCameraY(cameraZ: number) {
    let
      interpolationCoef: number,
      bottomPieceIdx: number,
      bottomPiece: TrackPiece,
      bottomPieceY: number,
      i: number,
      cameraY: number;

    interpolationCoef = (cameraZ % trackPieceL) / trackPieceL;
    bottomPieceIdx = Math.floor(cameraZ / trackPieceL);
    bottomPiece = track[bottomPieceIdx];

    bottomPieceY = 0;
    for (i = 0; i < bottomPieceIdx; i += 1) {
      bottomPieceY += track[i].elevation - elevationOffset;
    }

    cameraY = (bottomPiece.elevation - elevationOffset) * interpolationCoef + bottomPieceY + 1;

    return cameraY;
  }

  function interpolateElevationOffset(last: number, now: number, cameraZ: number) {
    let interpolationCoef = (cameraZ % trackPieceL) / trackPieceL;
    return ((now - last) * interpolationCoef + last);
  }

  function build3DTrack(track: TrackPiece[]) {
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

    combinedTurn    += turnOffset;
    combinedXOffset += turnOffset;

    for (i = 0; i < track.length; i += 1) {
      combinedElevation += track[i].elevation - elevationOffset;

      if (i > Math.floor(stepsMoved / stepsPerPiece)) {
        combinedTurn += track[i].turn;
        combinedXOffset += combinedTurn;
      }
    }

    for (i = (track.length - 1); i >= 0; i -= 1) {
      piece = track[i];

      x1Offset = combinedXOffset - combinedTurn;
      x2Offset = combinedXOffset;
      y1 = combinedElevation - (piece.elevation - elevationOffset);
      y2 = combinedElevation;
      z1 = i * trackPieceL;
      z2 = (i + 1) * trackPieceL;

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

      combinedElevation -= (piece.elevation - elevationOffset);
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
      lastPieceEven: boolean;

    // Advance position
    stepsMoved += 1;
    camera[2] = stepsMoved * speed;

    // Remove old track pieces, add new ones
    piecesToRemove = Math.floor(stepsMoved / stepsPerPiece) - 2;
    lastPieceEven = track[track.length - 1].even;

    if (piecesToRemove > 0) {
      track.splice(0, piecesToRemove);

      for (i = 0; i < piecesToRemove; i += 1) {
        lastPieceEven = !lastPieceEven;
        track.push(generateTrackPiece(lastPieceEven));
      }

      stepsMoved -= piecesToRemove * stepsPerPiece;
      camera[2] = stepsMoved * speed;
    }

    // Update elevation offset
    elevationOffset = interpolateElevationOffset(
      (track[0].elevation + track[1].elevation + track[2].elevation + track[3].elevation + track[4].elevation) / 5,
      (track[1].elevation + track[2].elevation + track[3].elevation + track[4].elevation + track[5].elevation) / 5,
      camera[2]
    );

    // Update turn offset
    invisiblePieces = Math.floor(stepsMoved / stepsPerPiece);
    turnOffset = (1 - ((stepsMoved % stepsPerPiece) / stepsPerPiece)) * track[invisiblePieces].turn;

    // Interpolate camera Y
    camera[1] = interpolateCameraY(camera[2]);
  }

  function render() {
    let
      polygon: Polygon,
      point: number[],
      threeDTrack: Polygon[],
      i: number, j: number;

    update();
    threeDTrack = build3DTrack(track);

    for (i = 0; i < threeDTrack.length; i += 1) {
      polygon = threeDTrack[i];

      for (j = 0; j < polygon.points.length; j += 1) {
        point = transformToCamera(polygon.points[j].slice(0));
        point = projectVec3(point);

        pointsArray[j * 2]     = point[0];
        pointsArray[j * 2 + 1] = point[1];
      }

      gl.uniform4f(
        colorLocation,
        polygon.color[0], polygon.color[1], polygon.color[2], 1
      );

      gl.bufferData(gl.ARRAY_BUFFER, pointsArray, gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    window.requestAnimationFrame(render);
  }

  // Initialize stuff
  canvas           = document.getElementById('game') as HTMLCanvasElement;
  gl               = GL.initWebGL(canvas);
  shaderProgram    = GL.initShaders(gl);
  positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
  colorLocation    = gl.getUniformLocation(shaderProgram, 'u_color');

  buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Initial track features
  trackFeatures = {
    hill: {
      steps: 0,
      stepsDone: 0,
      elevation: 0
    },
    turn: {
      steps: 0,
      stepsDone: 0,
      turn: 0
    }
  };

  // Initial track
  for (i = 0; i < maxPiecesVisible; i += 1) {
    track.push(generateTrackPiece(i % 2 === 0));
  }

  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  // Start
  resizeCanvas();
  render();
}
