/// <reference path="gl.ts"/>
var App;
(function (App) {
    var TRACK_PIECE_LENGTH = 0.3;
    var SPEED = 0.1;
    var MAX_PIECES_VISIBLE = 50;
    var STEPS_PER_PIECE = TRACK_PIECE_LENGTH / SPEED;
    var GRASS_COLORS = [
        [0, 0.443, 0],
        [0, 0.349, 0]
    ];
    var TRACK_COLORS = [
        [0.2, 0.2, 0.2],
        [0.267, 0.267, 0.267]
    ];
    var SIDE_COLORS = [
        [0.8, 0, 0],
        [0.867, 0.867, 0.867]
    ];
    var TRACK_PIECE_ODD_FEATURES = [
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
    var TRACK_PIECE_EVEN_FEATURES = [
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
    var TrackGenerationFeature = (function () {
        function TrackGenerationFeature() {
        }
        return TrackGenerationFeature;
    }());
    var TrackGenerationFeatures = (function () {
        function TrackGenerationFeatures() {
        }
        return TrackGenerationFeatures;
    }());
    var TrackFeature = (function () {
        function TrackFeature() {
        }
        return TrackFeature;
    }());
    var TrackPiece = (function () {
        function TrackPiece() {
        }
        return TrackPiece;
    }());
    var Polygon = (function () {
        function Polygon() {
        }
        return Polygon;
    }());
    var TrackOffsets = (function () {
        function TrackOffsets() {
        }
        return TrackOffsets;
    }());
    var canvas, trackFeatures, gl, shaderProgram, positionLocation, colorLocation, buffer, track = [], camera = [0, 0, 0], stepsMoved = 0, pointsArray = new Float32Array(8), i;
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function generateTrackFeature(current, max, min) {
        var sign;
        if (current.steps > current.stepsDone) {
            return current;
        }
        if (Math.random() < 0.5) {
            sign = 1;
        }
        else {
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
    function generateTrackPiece(even, trackFeatures) {
        var elevation, features;
        trackFeatures.hill = generateTrackFeature(trackFeatures.hill, 1.5, 2.5);
        trackFeatures.turn = generateTrackFeature(trackFeatures.turn, 0.01, 0.03);
        elevation = interpolateTrackElevation(trackFeatures.hill);
        if (even) {
            features = TRACK_PIECE_EVEN_FEATURES;
        }
        else {
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
    function projectVec3(vec3) {
        var hCoef = (canvas.width / 3) / canvas.height, wCoef = 1.5, zCoef;
        if (vec3[2] > 0) {
            zCoef = vec3[2] + 1;
        }
        else {
            zCoef = -1 / (vec3[2] - 1);
        }
        return [
            (vec3[0] * wCoef) / zCoef,
            (((vec3[1] / zCoef) + 1) * hCoef) - 1
        ];
    }
    function transformToCamera(point) {
        var newPoint = point.slice(0);
        if (typeof point[0] == 'number') {
            newPoint[0] -= camera[0];
        }
        newPoint[1] -= camera[1];
        newPoint[2] -= camera[2];
        return newPoint;
    }
    function interpolateCameraY(cameraZ, offsets) {
        var interpolationCoef, bottomPieceIdx, bottomPiece, bottomPieceY, i, cameraY;
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
    function interpolateTrackElevation(hillFeature) {
        return (Math.sin((Math.PI *
            ((hillFeature.stepsDone + 1) / hillFeature.steps)) - (Math.PI / 2)) * hillFeature.change) - (Math.sin((Math.PI *
            (hillFeature.stepsDone / hillFeature.steps)) - (Math.PI / 2)) * hillFeature.change);
    }
    function interpolateElevationOffset(last, now, cameraZ) {
        var interpolationCoef = (cameraZ % TRACK_PIECE_LENGTH) / TRACK_PIECE_LENGTH;
        return ((now - last) * interpolationCoef + last);
    }
    function build3DTrack(track, offsets) {
        var threeDTrack = [], combinedElevation = 0, combinedTurn = 0, combinedXOffset = 0, piece, feature, featureXOffset, i, j, y1, y2, z1, z2, x1Offset, x2Offset;
        combinedTurn += offsets.turn;
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
                    [1000, y1, z1],
                    [1000, y2, z2],
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
            combinedXOffset -= combinedTurn;
            combinedTurn -= piece.turn;
        }
        return threeDTrack;
    }
    function update() {
        var invisiblePieces, piecesToRemove, i, lastPieceEven, offsets;
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
        offsets.elevation = interpolateElevationOffset((track[0].elevation + track[1].elevation + track[2].elevation + track[3].elevation + track[4].elevation) / 5, (track[1].elevation + track[2].elevation + track[3].elevation + track[4].elevation + track[5].elevation) / 5, camera[2]);
        // Update turn offset
        invisiblePieces = Math.floor(stepsMoved / STEPS_PER_PIECE);
        offsets.turn = (1 - ((stepsMoved % STEPS_PER_PIECE) / STEPS_PER_PIECE)) * track[invisiblePieces].turn;
        // Interpolate camera Y
        camera[1] = interpolateCameraY(camera[2], offsets);
        // Build 3D track
        return build3DTrack(track, offsets);
    }
    function render(polygons) {
        var polygon, point, i, j;
        for (i = 0; i < polygons.length; i += 1) {
            polygon = polygons[i];
            for (j = 0; j < polygon.points.length; j += 1) {
                point = transformToCamera(polygon.points[j].slice(0));
                point = projectVec3(point);
                pointsArray[j * 2] = point[0];
                pointsArray[j * 2 + 1] = point[1];
            }
            gl.uniform4f(colorLocation, polygon.color[0], polygon.color[1], polygon.color[2], 1);
            gl.bufferData(gl.ARRAY_BUFFER, pointsArray, gl.STATIC_DRAW);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
    }
    function nextFrame() {
        var threeDTrack;
        threeDTrack = update();
        render(threeDTrack);
        window.requestAnimationFrame(nextFrame);
    }
    // Initialize stuff
    canvas = document.getElementById('game');
    gl = GL.initWebGL(canvas);
    shaderProgram = GL.initShaders(gl);
    positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    colorLocation = gl.getUniformLocation(shaderProgram, 'u_color');
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
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
})(App || (App = {}));
