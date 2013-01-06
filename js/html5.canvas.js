this["CanvasRenderingContext2D"] && (function(global, document) {

function Canvas(width,         // @arg Integer(= 300):
                height,        // @arg Integer(= 150):
                placeHolder) { // @arg Node(= undefined): place holder node
                               // @help: global.Canvas
                               // @desc: create canvas node
    var canvas = document.createElement("canvas");

    canvas.width  = width  == null ? 300 : width;
    canvas.height = height == null ? 150 : height;
    if (!placeHolder || !placeHolder.parentNode) {
        placeHolder = document.body.appendChild(document.createElement("div"));
    }
    placeHolder.parentNode.replaceChild(canvas, placeHolder);
    return canvas;
}

wiz(global["CanvasRenderingContext2D"].prototype, {
    // --- Lock / Animation API ---
    lock:           lock,
    unlock:         unlock,
    animFillPath:   animFillPath,
    animStrokePath: animStrokePath,
    animFillRect:   animFillRect,
    animStrokeRect: animStrokeRect,
    // --- Clear API ---
    clear:          clear,
    // --- Convenient API ---
    drawCircle:     drawCircle,
    drawRoundRect:  drawRoundRect
});

function lock(clear) { // @arg Boolean(= false): lazy clear
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

function unlock() {
}

function clear() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

function animFillPath(id,      // @arg String: id
                      x,       // @arg Number: moveTo(x)
                      y,       // @arg Number: moveTo(y)
                      lines) { // @arg NumberArray: lineTo([<x0, y0>, <x1, y1>, ...])
    this.animStrokePath(id, x, y, lines, true);
}

function animStrokePath(id,     // @arg String: id
                        x,      // @arg Number: moveTo(x)
                        y,      // @arg Number: moveTo(y)
                        lines,  // @arg NumberArray: lineTo([<x0, y0>, <x1, y1>, ...])
                        fill) { // @arg Boolean(= false): true is fill
    this.beginPath();
    this.moveTo(x, y);

    var i = 0, iz = lines.length;

    for (; i < iz; i += 2) {
        this.lineTo(lines[i], lines[i + 1]);
    }

    this.closePath();

    fill ? this.fill()
         : this.stroke();
}

function animFillRect(id, x, y, w, h) {
    this.fillRect(x, y, w, h);
}

function animStrokeRect(id, x, y, w, h) {
    this.strokeRect(x, y, w, h);
}

function drawCircle(x, y, raduis, fillColor, strokeColor, lineWidth) {
    if (fillColor || strokeColor) {
        var lw = lineWidth === void 0 ? 1 : lineWidth;

        this.save();
        if (fillColor) {
            this.fillStyle = fillColor;
        }
        if (strokeColor && lw) {
            this.strokeStyle = strokeColor;
            this.lineWidth = lw;
        }
        this.beginPath();
        this.arc(x, y, raduis, 0, 2 * Math.PI, true);
        this.closePath();
        if (fillColor) {
            this.fill();
        }
        if (strokeColor && lw) {
            this.stroke();
        }
        this.restore();
    }
}

function drawRoundRect(x,
                       y,
                       width,
                       height,
                       radius,
                       fillColor,
                       strokeColor,
                       lineWidth) {
    if (fillColor || strokeColor) {

        if (typeof radius === "number") { // Number -> [r, r, r, r]
            radius = [radius, radius, radius, radius];
        }
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            w  = width,
            h  = height,
            r0 = radius[0],
            r1 = radius[1],
            r2 = radius[2],
            r3 = radius[3],
            w2 = (width  / 2) | 0,
            h2 = (height / 2) | 0;

        r0 < 0 && (r0 = 0);
        r1 < 0 && (r1 = 0);
        r2 < 0 && (r2 = 0);
        r3 < 0 && (r3 = 0);
        (r0 >= w2 || r0 >= h2) && (r0 = Math.min(w2, h2) - 2);
        (r1 >= w2 || r1 >= h2) && (r1 = Math.min(w2, h2) - 2);
        (r2 >= w2 || r2 >= h2) && (r2 = Math.min(w2, h2) - 2);
        (r3 >= w2 || r3 >= h2) && (r3 = Math.min(w2, h2) - 2);
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        if (fillColor) {
            this.fillStyle = fillColor;
        }
        if (strokeColor && lw) {
            this.strokeStyle = strokeColor;
            this.lineWidth = lw;
        }
        this.beginPath();
        this.moveTo(x, y + h2);
        this.lineTo(x, y + h - r3);
        this.quadraticCurveTo(x, y + h, x + r3, y + h);
        this.lineTo(x + w - r2, y + h);
        this.quadraticCurveTo(x + w, y + h, x + w, y + h - r2);
        this.lineTo(x + w, y + r1);
        this.quadraticCurveTo(x + w, y, x + w - r1, y);
        this.lineTo(x + r0, y);
        this.quadraticCurveTo(x, y, x, y + r0);
        this.closePath();
        if (fillColor) {
            this.fill();
        }
        if (strokeColor && lw) {
            this.stroke();
        }
        this.restore();
    }
}

function wiz(object, extend, override) {
    for (var key in extend) {
        (override || !(key in object)) && Object.defineProperty(object, key, {
            configurable: true, writable: true, value: extend[key]
        });
    }
}

// --- boot ------------------------------------------------
if (global.addEventListener) {
    global.addEventListener("load", function() {
        if (global.oncanvasready) {
            setTimeout(function() {
                global.oncanvasready(document.querySelectorAll("canvas"));
            }, 0);
        }
    }, false);
}

// --- export ----------------------------------------------
global["Canvas"] = Canvas;

Canvas.init = function() {};            // global.Canvas.init();

})(this.self || global, this.document);
