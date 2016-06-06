(function () {
  'use strict';

  var
    canvas      = document.getElementById('background'),
    ctx         = canvas.getContext("2d"),
    trackColors = ['#333', '#444'],
    grassColors = ['#007100', '#005900'],
    track       = [],
    trackPieceL = 0.3,
    camera      = [0, 1, 0],
    i;

  function generateTrackPiece(even) {
    var z1, z2, y1, y2, colorIdx;

    if (even) {
      colorIdx = 0;
    } else {
      colorIdx = 1;
    }
    
    z1 = i * trackPieceL;
    z2 = (i + 1) * trackPieceL;
    y1 = Math.pow(1.1, i) - 2;
    y2 = Math.pow(1.1, i + 1) - 2;

    return {
      elevationDiff: 0,
      background: grassColors[colorIdx],
      features: [
        {
          width: 1,
          color: trackColors[colorIdx]
        }
      ]
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
  
  function advanceCamera(camera) {
    var
      newCamera = camera.slice(0),
      interpolationCoef, bottomPieceIdx, bottomPiece, bottomPieceY,
      i;
    
    newCamera[2] += 0.05;
    
    interpolationCoef = (newCamera[2] % trackPieceL) / trackPieceL;
    bottomPieceIdx = Math.floor(newCamera[2] / trackPieceL);
    bottomPiece = track[bottomPieceIdx];
    
    bottomPieceY = 0;
    for (i = 0; i < bottomPieceIdx; i += 1) {
      bottomPieceY += track[i].elevationDiff;
    }
    
    newCamera[1] = bottomPiece.elevationDiff * interpolationCoef + bottomPieceY + 1;
    
    return newCamera;
  }
  
  function build3DTrack(track) {
    var
      threeDTrack = [],
      combinedElevation = 0,
      piece, feature,
      featureYOffset,
      i, j, y1, y2, z1, z2;
    
    for (i = 0; i < track.length; i += 1) {
      combinedElevation += track[i].elevationDiff;
    }
    
    for (i = (track.length - 1); i >= 0; i -= 1) {
      piece = track[i];
      
      y1 = combinedElevation - piece.elevationDiff;
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
        
        featureYOffset += feature.width * 2;
      }
      
      combinedElevation -= piece.elevationDiff;
    }
    
    return threeDTrack;
  }

  for (i = 0; i < 10; i += 1) {
    track.push(generateTrackPiece(i % 2));
  }

  function render() {
    var
      polygon, point, threeDTrack,
      i, j;
    
    // camera = advanceCamera(camera);
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

  render();
}());
