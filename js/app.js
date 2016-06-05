(function () {
  'use strict';

  var
    canvas      = document.getElementById('background'),
    ctx         = canvas.getContext("2d"),
    trackColors = ['#333', '#444'],
    grassColors = ['#007100', '#005900'],
    trackPieces = [],
    trackPieceL = 0.3,
    i, j, k;

  function generateTrackPiece(i) {
    return [
      {
        points: [
          ['-w', -1 + Math.pow((i + 1), -0.25) - 1, 1 + (i * trackPieceL)],
          ['+w', -1 + Math.pow((i + 1), -0.25) - 1, 1 + (i * trackPieceL)],
          ['+w', -1 + Math.pow((i + 2), -0.25) - 1, 1 + ((i + 1) * trackPieceL)],
          ['-w', -1 + Math.pow((i + 2), -0.25) - 1, 1 + ((i + 1) * trackPieceL)]
        ],
        color: grassColors[i % 2]
      },
      {
        points: [
          [-1, -1 + Math.pow((i + 1), -0.25) - 1, 1 + (i * trackPieceL)],
          [ 1, -1 + Math.pow((i + 1), -0.25) - 1, 1 + (i * trackPieceL)],
          [ 1, -1 + Math.pow((i + 2), -0.25) - 1, 1 + ((i + 1) * trackPieceL)],
          [-1, -1 + Math.pow((i + 2), -0.25) - 1, 1 + ((i + 1) * trackPieceL)]
        ],
        color: trackColors[i % 2]
      }
    ];
  }

  function projectVec3(vec3) {
    var
      halfH = canvas.height / 2,
      halfW = canvas.width  / 2,
      x;

    if(vec3[0] === '-w') {
      x = 0;
    } else if (vec3[0] === '+w') {
      x = canvas.width;
    } else {
      x = ((vec3[0] / vec3[2]) + 1) * halfW;
    }

    return [
      x, canvas.height - (((vec3[1] / vec3[2]) + 1) * halfH)
    ];
  }

  for (i = 0; i < 10; i += 1) {
    trackPieces.push(generateTrackPiece(i));
  }

  function render() {
    for (i = 0; i < trackPieces.length; i += 1) {
      var
        piece = trackPieces[i],
        component, point;

      for (j = 0; j < piece.length; j += 1) {
        component = piece[j];

        ctx.fillStyle = component.color;
        ctx.beginPath();

        for (k = 0; k < component.points.length; k += 1) {
          point = projectVec3(component.points[k]);
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
