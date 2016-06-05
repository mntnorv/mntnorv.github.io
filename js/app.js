(function () {
  'use strict';

  var
    canvas      = document.getElementById('background'),
    ctx         = canvas.getContext("2d"),
    trackColors = ['#333', '#444'],
    grassColors = ['#007100', '#005900'],
    trackPieces = [],
    trackPieceL = 0.3,
    zOffset     = 0,
    yOffset, i, j, k;

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

  for (i = 0; i < 10; i += 1) {
    trackPieces.push(generateTrackPiece(i));
  }

  function render() {
    var
      bottomPiece, bottomPieceIdx,
      piece, component, point;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bottomPieceIdx = Math.floor(-zOffset / trackPieceL);
    
    if (bottomPieceIdx < trackPieces.length) {
      bottomPiece = trackPieces[bottomPieceIdx];
    } else {
      bottomPiece = trackPieces[trackPieces.length - 1];
    }
    
    yOffset = (bottomPiece[0].points[2][1] - bottomPiece[0].points[0][1]) * ((-zOffset % trackPieceL) / trackPieceL) + bottomPiece[0].points[0][1] + 1;
    
    for (i = 0; i < trackPieces.length; i += 1) {
      piece = trackPieces[i];

      for (j = 0; j < piece.length; j += 1) {
        component = piece[j];

        ctx.fillStyle = component.color;
        ctx.beginPath();

        for (k = 0; k < component.points.length; k += 1) {
          point = component.points[k].slice(0);
          point[1] -= yOffset;
          point[2] += zOffset;
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

    zOffset -= 0.05;
    window.requestAnimationFrame(render);
  }

  render();
}());
