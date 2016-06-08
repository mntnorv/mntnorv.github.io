(function () {
  'use strict';

  var
    canvas           = document.getElementById('background'),
    ctx              = canvas.getContext("2d"),
    trackColors      = ['#333', '#444'],
    grassColors      = ['#007100', '#005900'],
    sideColors       = ['#c00', '#ddd'],
    track            = [],
    trackPieceL      = 0.3,
    maxPiecesVisible = 45,
    camera           = [0, 0, 0],
    stepsMoved       = 0,
    speed            = 0.06,
    elevationOffset  = 0,
    trackFeature     = { steps: 0, stepsDone: 0 },
    i;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function generateTrackFeature() {
    var sign;

    if (Math.random() < 0.5) {
      sign = 1;
    } else {
      sign = -1;
    }

    switch (Math.floor(Math.random() * 2)) {
    case 0:
      return {
        type: 'straight',
        steps: Math.floor(Math.random() * 30) + 10,
        stepsDone: 0
      };
    case 1:
      return {
        type: 'hill',
        steps: Math.floor(Math.random() * 15) + 15,
        stepsDone: 0,
        elevation: (Math.random() + 1.5) * sign
      };
    }
  }

  function generateTrackPiece(even) {
    var colorIdx, elevation, features;

    if (trackFeature.steps === trackFeature.stepsDone) {
      trackFeature = generateTrackFeature();
    }

    if (even) {
      colorIdx = 0;
    } else {
      colorIdx = 1;
    }

    switch (trackFeature.type) {
    case 'straight':
      elevation = 0;
      break;
    case 'hill':
      elevation = (Math.sin((Math.PI * ((trackFeature.stepsDone + 1) / trackFeature.steps)) - (Math.PI / 2)) * trackFeature.elevation) - (Math.sin((Math.PI * (trackFeature.stepsDone / trackFeature.steps)) - (Math.PI / 2)) * trackFeature.elevation);
      break;
    }

    trackFeature.stepsDone += 1;

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
          color: '#ddd'
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
      elevationDiff: elevation,
      background: grassColors[colorIdx],
      features: features,
      even: even
    };
  }

  function projectVec3(vec3) {
    var
      halfH = canvas.height / 2,
      halfW = canvas.width  / 2,
      x, zCoef;

    if (vec3[2] > 0) {
      zCoef = vec3[2] + 1;
    } else {
      zCoef = -1 / (vec3[2] - 1);
    }

    if (vec3[0] === '-w') {
      x = 0;
    } else if (vec3[0] === '+w') {
      x = canvas.width;
    } else {
      x = ((vec3[0] / zCoef) + 1) * halfW;
    }

    return [
      Math.round(x),
      Math.round(canvas.height - (((vec3[1] / zCoef) + 1) * halfH))
    ];
  }

  function transformToCamera(point) {
    var newPoint = point.slice(0);

    if (!isNaN(point[0])) {
      newPoint[0] -= camera[0];
    }

    newPoint[1] -= camera[1];
    newPoint[2] -= camera[2];

    return newPoint;
  }

  function interpolateCameraY(cameraZ) {
    var
      interpolationCoef, bottomPieceIdx, bottomPiece, bottomPieceY,
      i, cameraY;

    interpolationCoef = (cameraZ % trackPieceL) / trackPieceL;
    bottomPieceIdx = Math.floor(cameraZ / trackPieceL);
    bottomPiece = track[bottomPieceIdx];

    bottomPieceY = 0;
    for (i = 0; i < bottomPieceIdx; i += 1) {
      bottomPieceY += track[i].elevationDiff - elevationOffset;
    }

    cameraY = (bottomPiece.elevationDiff - elevationOffset) * interpolationCoef + bottomPieceY + 1;

    return cameraY;
  }

  function interpolateElevationOffset(last, now, cameraZ) {
    var interpolationCoef = (cameraZ % trackPieceL) / trackPieceL;
    return ((now - last) * interpolationCoef + last);
  }

  function build3DTrack(track) {
    var
      threeDTrack = [],
      combinedElevation = 0,
      piece, feature,
      featureYOffset,
      i, j, y1, y2, z1, z2;

    for (i = 0; i < track.length; i += 1) {
      combinedElevation += (track[i].elevationDiff - elevationOffset);
    }

    for (i = (track.length - 1); i >= 0; i -= 1) {
      piece = track[i];

      y1 = combinedElevation - (piece.elevationDiff - elevationOffset);
      y2 = combinedElevation;
      z1 = i * trackPieceL;
      z2 = (i + 1) * trackPieceL;

      // Background
      threeDTrack.push({
        points: [
          ['-w', y1, z1],
          ['+w', y1, z1],
          ['+w', y2, z2],
          ['-w', y2, z2]
        ],
        color: piece.background
      });

      // Features
      featureYOffset = 0;

      for (j = 0; j < piece.features.length; j += 1) {
        feature = piece.features[j];

        threeDTrack.push({
          points: [
            [-1 + (featureYOffset * 2), y1, z1],
            [-1 + ((featureYOffset + feature.width) * 2), y1, z1],
            [-1 + ((featureYOffset + feature.width) * 2), y2, z2],
            [-1 + (featureYOffset * 2), y2, z2]
          ],
          color: feature.color
        });

        featureYOffset += feature.width;
      }

      combinedElevation -= (piece.elevationDiff - elevationOffset);
    }

    return threeDTrack;
  }

  function update() {
    var invisiblePieces, i, lastPieceEven;

    // Advance position
    stepsMoved += 1;
    camera[2] = stepsMoved * speed;

    // Remove old track pieces, add new ones
    invisiblePieces = Math.floor(stepsMoved / 5) - 2;
    lastPieceEven = track[track.length - 1].even;

    if (invisiblePieces > 0) {
      track.splice(0, invisiblePieces);

      for (i = 0; i < invisiblePieces; i += 1) {
        lastPieceEven = !lastPieceEven;
        track.push(generateTrackPiece(lastPieceEven));
      }

      stepsMoved -= invisiblePieces * 5;
      camera[2] = stepsMoved * speed;
    }

    // Update elevation offset
    elevationOffset = interpolateElevationOffset(
      (track[0].elevationDiff + track[1].elevationDiff + track[2].elevationDiff + track[3].elevationDiff + track[4].elevationDiff) / 5,
      (track[1].elevationDiff + track[2].elevationDiff + track[3].elevationDiff + track[4].elevationDiff + track[5].elevationDiff) / 5,
      camera[2]
    );

    // Interpolate camera Y
    camera[1] = interpolateCameraY(camera[2]);
  }

  function render() {
    var
      polygon, point, threeDTrack,
      i, j;

    update();
    threeDTrack = build3DTrack(track);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < threeDTrack.length; i += 1) {
      polygon = threeDTrack[i];

      ctx.fillStyle = polygon.color;
      ctx.beginPath();

      for (j = 0; j < polygon.points.length; j += 1) {
        point = transformToCamera(polygon.points[j].slice(0));
        point = projectVec3(point);

        if (j === 0) {
          ctx.moveTo(point[0], point[1]);
        } else {
          ctx.lineTo(point[0], point[1]);
        }
      }

      ctx.closePath();
      ctx.fill();
    }

    window.requestAnimationFrame(render);
  }

  // Initial track
  for (i = 0; i < maxPiecesVisible; i += 1) {
    track.push(generateTrackPiece(i % 2 === 0));
  }

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  // Start
  resizeCanvas();
  render();
}());
