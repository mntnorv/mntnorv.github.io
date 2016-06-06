(function () {
  'use strict';

  var
    canvas      = document.getElementById('background'),
    ctx         = canvas.getContext("2d"),
    trackColors = ['#333', '#444'],
    grassColors = ['#007100', '#005900'],
    trackPieces = [],
    trackPieceL = 0.3,
    camera      = [0, 0, 0],
    i, j, k;

  function generateTrackPiece(i) {
    var z1, z2, y1, y2;

    z1 = i * trackPieceL;
    z2 = (i + 1) * trackPieceL;
    y1 = Math.pow(1.1, i) - 2;
    y2 = Math.pow(1.1, i + 1) - 2;

    return [
      {
        points: [
          ['-w', y1, z1],
          ['+w', y1, z1],
          ['+w', y2, z2],
          ['-w', y2, z2]
        ],
        color: grassColors[i % 2]
      },
      {
        points: [
          [-1, y1, z1],
          [ 1, y1, z1],
          [ 1, y2, z2],
          [-1, y2, z2]
        ],
        color: trackColors[i % 2]
      }
    ];
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
  
  function advanceCamera(camera) {
    var
      newCamera = camera.slice(0),
      interpolationCoef, bottomPieceIdx, bottomPiece;
    
    newCamera[2] += 0.05;
    
    interpolationCoef = (newCamera[2] % trackPieceL) / trackPieceL;
    bottomPieceIdx = Math.floor(newCamera[2] / trackPieceL);
    
    if (bottomPieceIdx < trackPieces.length) {
      bottomPiece = trackPieces[bottomPieceIdx];
    } else {
      bottomPiece = trackPieces[trackPieces.length - 1];
    }
    
    newCamera[1] =
      (bottomPiece[0].points[2][1] - bottomPiece[0].points[0][1]) *
      interpolationCoef +
      bottomPiece[0].points[0][1] + 1;
    
    return newCamera;
  }

  for (i = 0; i < 10; i += 1) {
    trackPieces.push(generateTrackPiece(i));
  }

  function render() {
    var piece, component, point;
    camera = advanceCamera(camera);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (i = 0; i < trackPieces.length; i += 1) {
      piece = trackPieces[i];

      for (j = 0; j < piece.length; j += 1) {
        component = piece[j];

        ctx.fillStyle = component.color;
        ctx.beginPath();

        for (k = 0; k < component.points.length; k += 1) {
          point = transformToCamera(component.points[k].slice(0));
          point = projectVec3(point);

          if (k === 0) {
            ctx.moveTo(point[0], point[1]);
          } else {
            ctx.lineTo(point[0], point[1]);
          }
        }

        ctx.closePath();
        ctx.fill();
      }
    }

    window.requestAnimationFrame(render);
  }

  render();
}());
