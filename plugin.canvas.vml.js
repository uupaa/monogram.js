//{@canvasvml

// --- Canvas VML ------------------------------------------
//
//  <canvas width="300" height="150">   <- canvas
//      <div>                           <- canvas._view
//          <v:shape style="...">       <- canvas contexts
//          </v:shape>
//      </div>
//  </canvas>
//

this.getComputedStyle || (function(global, document) { // IE6, IE7, IE8

// class CanvasVMLRenderingContext2D
function CanvasVMLRenderingContext2D(canvasNode) { // @arg Node: <canvas>
                                                   // @ret CanvasVMLRenderingContext2DObject:
                                                   // @desc: CanvasRenderingContext2D impl.
    this.canvas = canvasNode;
    this._view  = canvasNode.appendChild(document.createElement("div")); // <div>
    this._view.style.cssText = _at("overflow:hidden;position:absolute;" +
                                   "direction:ltr;width:@@px;height:@@px",
                                   canvasNode.width, canvasNode.height);
    this._lockState      = 0x0; // 0x0: unlocked, 0x1: locked, 0x2: lazy clear,
                                // 0x4: hidden
    this._textDirection  = canvasNode.currentStyle.direction;
    this._fontStyleCache = { font: {}, em: _detectEMPixelValue(canvasNode) };

    _initSurface(this);
}
CanvasVMLRenderingContext2D.prototype = {
    // --- Gradient, Pattern API ---
    createLinearGradient:   createLinearGradient,
    createRadialGradient:   createRadialGradient,
    createPattern:          createPattern,
    // --- State, Matrix API ---
    save:                   save,
    restore:                restore,
    scale:                  scale,
    rotate:                 rotate,
    translate:              translate,
    transform:              transform,
    setTransform:           setTransform,
    // --- Rect API ---
    clearRect:              clearRect,
    fillRect:               fillRect,
    strokeRect:             strokeRect,
    // --- Path API ---
    beginPath:              beginPath,
    closePath:              closePath,
    moveTo:                 moveTo,
    lineTo:                 lineTo,
    quadraticCurveTo:       quadraticCurveTo,
    bezierCurveTo:          bezierCurveTo,
    arcTo:                  _nop,
    rect:                   rect,
    arc:                    arc,
    fill:                   fill,
    stroke:                 stroke,
    clip:                   clip,
    isPointInPath:          _nop,
    // --- Text API ---
    fillText:               fillText,
    strokeText:             strokeText,
    measureText:            measureText,
    // --- Image API ---
    drawImage:              drawImage,
    // --- Pixel API ---
    createImageData:        _nop,
    getImageData:           _nop,
    putImageData:           _nop,
    // --- Lock / Animation API ---
    lock:                   lock,           // [EXTEND]
    unlock:                 unlock,         // [EXTEND]
    animFillPath:           animFillPath,   // [EXTEND]
    animStrokePath:         animStrokePath, // [EXTEND]
    animFillRect:           animFillRect,   // [EXTEND]
    animStrokeRect:         animStrokeRect, // [EXTEND]
    // --- Clear API ---
    clear:                  clear,          // [EXTEND]
    // --- Convenient API ---
    drawCircle:             drawCircle,     // [EXTEND]
    drawRoundRect:          drawRoundRect   // [EXTEND]
};

function _initSurface(that) { // @arg CanvasVMLRenderingContext2D:
                              // @inner:
    // [*] save and restore target properties
    // --- compositing ---
    that.globalAlpha     = 1;       // [*]
    that.globalCompositeOperation = "source-over"; // [*]
    // --- colors and styles ---
    that.strokeStyle     = "#000";  // [*] String or Object
    that.fillStyle       = "#000";  // [*] String or Object
    // --- line caps/joins ---
    that.lineWidth       = 1;       // [*]
    that.lineCap         = "butt";  // [*]
    that.lineJoin        = "miter"; // [*]
    that.miterLimit      = 10;      // [*]
    // --- shadows ---
    that.shadowBlur      = 0;       // [*]
    that.shadowColor     = "transparent"; // [*] transparent black
    that.shadowOffsetX   = 0;       // [*]
    that.shadowOffsetY   = 0;       // [*]
    // --- text ---
    that.font            = "10px sans-serif";   // [*]
    that.textAlign       = "start";             // [*]
    that.textBaseline    = "alphabetic";        // [*]
    // --- current position ---
    that.px              = 0;       // current position x
    that.py              = 0;       // current position y
    // --- hidden properties ---
    that._stateStack     = [];      // save / restore stack
    that._lockStack      = [];      // lock / unlock stack
    that._lineScale      = 1;       // [*]
    that._scaleX         = 1;       // [*]
    that._scaleY         = 1;       // [*]
    that._zindex         = -1;
    that._matrixEffected = 0;       // [*] 1 is effected
    that._matrix         = [1,0,0,
                            0,1,0,
                            0,0,1]; // [*] Matrix.identity
    that._path           = [];      // current path
    that._clipPath       = null;    // [*] clipping path
    // --- user confing ---
    that.xClipColor      = "#000";
}

function CanvasVML(width,         // @arg Integer(= 300):
                   height,        // @arg Integer(= 150):
                   placeHolder) { // @arg Node(= undefined): place holder node
                                  // @help: global.Canvas
                                  // @desc: create canvas node
    var canvas = document.createElement("CANVAS");

    if (!placeHolder || !placeHolder.parentNode) {
        placeHolder = document.body.appendChild(document.createElement("div"));
    }
    placeHolder.parentNode.replaceChild(canvas, placeHolder);

    return _buildCanvasVML(canvas, width  == null ? 300 : width,
                                   height == null ? 150 : height);
}

function _initCanvasVMLStyle() {
    var ns = document.namespaces, ss;

    if (!ns["v"]) {
        ns.add("v", "urn:schemas-microsoft-com:vml",           "#default#VML");
        ns.add("o", "urn:schemas-microsoft-com:office:office", "#default#VML");
        ss = document.createStyleSheet();
        ss.cssText =
            "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
            "v:oval,v:shape,v:stroke,v:fill,v:textpath," +
            "v:image,v:line,v:rect,v:skew,v:path,o:opacity2" +
            "{behavior:url(#default#VML);display:inline-block}"; // [!] inline-block
    }
}

function _initCanvasVML() { // @desc: find <canvas> elements
    var nodeList = document.getElementsByTagName("canvas"),
        node, i = 0, width, height;

    while (node = nodeList[i++]) {
        if (!node.getContext) { // already initialized
            width  = parseInt(node.width  || "300"); // 300px -> 300
            height = parseInt(node.height || "150");
            // remove fallback contents
            //      <canvas> fallback contents... </canvas> -> <canvas></canvas>
            _buildCanvasVML(_removeFallbackNode(node), width, height);
        }
    }
}

function _buildCanvasVML(canvas,   // @arg Node: <canvas>
                         width,    // @arg Integer:
                         height) { // @arg Integer:
                                   // @ret Node:
    canvas.width  = width;
    canvas.height = height;
    canvas.style.width  = width  + "px";
    canvas.style.height = height + "px";

    var ctx;

    // CanvasRenderingContext.getContext
    canvas.getContext = function() {
        return ctx;
    };

    // CanvasRenderingContext.toDataURL
    canvas.toDataURL = function() {
        return "data:,";
    };

    ctx = new CanvasVMLRenderingContext2D(canvas);

    // uncapture key events(release focus)
    function onFocus(ev) { // @arg EventObject:
                                          // <canvas><div>srcElement</div></canvas>
        ev.srcElement.blur();             // <div>.blur()
        ev.srcElement.parentNode.focus(); // <canvas>.focus();
    }

    // trap <canvas width>, <canvas height> change event
    function onPropertyChange(ev) {
        if (ev.propertyName === "width" || ev.propertyName === "height") {

            var width  = parseInt(canvas.width),
                height = parseInt(canvas.height);

            // resize <canvas> and view
            canvas.style.pixelWidth     = width  < 0 ? 0 : width;
            canvas.style.pixelHeight    = height < 0 ? 0 : height;
            ctx._view.style.pixelWidth  = width  < 0 ? 0 : width;
            ctx._view.style.pixelHeight = height < 0 ? 0 : height;

            _initSurface(ctx)
            ctx.clear();
        }
    }

    canvas.firstChild.attachEvent("onfocus", onFocus);
    canvas.attachEvent("onpropertychange", onPropertyChange);

    global.attachEvent("onunload", function() { // [FIX][MEM LEAK]
        canvas.getContext = null;
        canvas.toDataURL  = null;
        global.detachEvent("onunload", arguments.callee);
        canvas.firstChild.detachEvent("onfocus", onFocus);
        canvas.detachEvent("onpropertychange", onPropertyChange);
    });
    return canvas;
}

function _removeFallbackNode(node) { // @arg Node:
                                     // @ret Node: new <canvas>
                                     // @inner: remove fallback contents
    if (!node.parentNode) {
        return node;
    }
    var rv = document.createElement(node.outerHTML),
        ends = document.getElementsByTagName("/CANVAS"),
        parent = node.parentNode,
        idx = node.sourceIndex, x, v, w, i = -1;

    while ( (x = ends[++i]) ) {
        if (idx < x.sourceIndex && parent === x.parentNode) {
            v = document.all[x.sourceIndex];
            do {
                w = v.previousSibling; // keep previous
                v.parentNode.removeChild(v);
                v = w;
            } while (v !== node);
            break;
        }
    }
    parent.replaceChild(rv, node);
    return rv;
}

function _copyProperties(to, from) {
    to.globalAlpha      = from.globalAlpha;
    to.globalCompositeOperation = from.globalCompositeOperation;
    to.strokeStyle      = from.strokeStyle;
    to.fillStyle        = from.fillStyle;
    to.lineWidth        = from.lineWidth;
    to.lineCap          = from.lineCap;
    to.lineJoin         = from.lineJoin;
    to.miterLimit       = from.miterLimit;
    to.shadowBlur       = from.shadowBlur;
    to.shadowColor      = from.shadowColor;
    to.shadowOffsetX    = from.shadowOffsetX;
    to.shadowOffsetY    = from.shadowOffsetY;
    to.font             = from.font;
    to.textAlign        = from.textAlign;
    to.textBaseline     = from.textBaseline;
    to._lineScale       = from._lineScale;
    to._scaleX          = from._scaleX;
    to._scaleY          = from._scaleY;
    to._matrixEffected  = from._matrixEffected;
    to._matrix          = from._matrix.concat();
    to._clipPath        = from._clipPath;
    return to;
}

function _applyProperties(that, fill) {
    if (that._mix !== that.globalCompositeOperation) {
        that._mix  =  that.globalCompositeOperation;
        that.__mix = _COMPOSITES[that._mix];
    }
    if (that._shadowColor !== that.shadowColor) {
        that._shadowColor  =  that.shadowColor;
        that.__shadowColor = _color(that._shadowColor);
    }
    if (fill) {
        if (that._fillStyle !== that.fillStyle) {
            if (typeof that.fillStyle === "string") {
                that._fillStyle = that.fillStyle;
                that.__fillStyle = _color(that._fillStyle);
            }
        }
    } else {
        if (that._strokeStyle !== that.strokeStyle) {
            if (typeof that.strokeStyle === "string") {
                that._strokeStyle = that.strokeStyle;
                that.__strokeStyle = _color(that._strokeStyle);
            }
        }
    }
}

var _nodeCache      = {}, // { id: VMLNode, ... }
    _colorNameCache = { transparent: { hex: "#000000", a: 0 } },
    _COMPOSITES     = { "source-over": 0, "destination-over": 4, copy: 10 },
    _FILTER         = [(document.querySelector ? "-ms-" : "") +
                       "filter:'progid:DXImageTransform.Microsoft.", "'"],
    _CLIPPY         = '<v:shape style="position:absolute;width:10px;height:10px" filled="t" stroked="f" coordsize="100,100" path="@@"><v:fill type="solid" color="@@" /></v:shape>',

    // zindex(+shadowOffsetX +shadowOffsetY), path, color.hex, opacity(+strokeProps or +' type="solid"')
    _COLOR_FILL     = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@" filled="t" stroked="f" coordsize="100,100" path="@@"><v:fill color="@@" opacity="@@" /></v:shape>',
    _COLOR_STROKE   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@" filled="f" stroked="t" coordsize="100,100" path="@@"><v:stroke color="@@" opacity="@@" /></v:shape>',

    _IMAGE_FILL     = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@;left:@@px;top:@@px" filled="t" stroked="f" coordsize="100,100" path="@@"><v:fill type="tile" opacity="@@" src="@@" /></v:shape>',
    _IMAGE_SHADOW   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@;left:@@px;top:@@px" filled="t" stroked="f" coordsize="100,100" path="@@"><v:fill color="@@" opacity="@@" /></v:shape>',

    // zindex(+shadowOffsetX +shadowOffsetY), path, color.hex, opacity(+strokeProps), angle
    _LINER_FILL     = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@" coordsize="100,100" filled="t" stroked="f" path="@@"><v:fill type="gradient" method="sigma" focus="0%" opacity="@@" angle="@@" /></v:shape>',
    _LINER_STROKE   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@" coordsize="100,100" filled="f" stroked="t" path="@@"><v:stroke filltype="solid" opacity="@@" angle="@@" /></v:shape>',

    // zindex, left, top, width, height, opacity(+'" color="@@' +focussize1, +focussize2, +focusposition1, +focusposition2)
    _RADIAL_FILL    = '<v:oval style="position:absolute;z-index:@@;left:@@px;top:@@px;width:@@px;height:@@px" filled="t" stroked="f" coordsize="11000,11000"><v:fill type="gradientradial" method="sigma" opacity="@@" /></v:oval>',
    // zindex, left, top, width, height, opacity(+strokeProps, +color)
    _RADIAL_STROKE  = '<v:oval style="position:absolute;z-index:@@;left:@@px;top:@@px;width:@@px;height:@@px" filled="f" stroked="t" coordsize="11000,11000"><v:stroke filltype="tile" opacity="@@" /></v:oval>',

    // zindex, left, top, path, type["solid" or "tile"], opacity(+color, +src, +strokeProps)
    _PATTERN_FILL   = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@;left:@@px;top:@@px" coordsize="100,100" filled="t" stroked="f" path="@@"><v:fill type="@@" opacity="@@" /></v:shape>',
    _PATTERN_STROKE = '<v:shape style="position:absolute;width:10px;height:10px;z-index:@@;left:@@px;top:@@px" coordsize="100,100" filled="f" stroked="t" path="@@"><v:stroke filltype="@@" opacity="@@" /></v:shape>';

// CanvasRenderingContext2D.prototype.arc
function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    radius *= 10;

    var x1 = x + (Math.cos(startAngle) * radius) - 5,
        y1 = y + (Math.sin(startAngle) * radius) - 5,
        x2 = x + (Math.cos(endAngle)   * radius) - 5,
        y2 = y + (Math.sin(endAngle)   * radius) - 5,
        c0, c1, rx, ry;

    if (!anticlockwise) { // [FIX] "wa" bug
        if (x1.toExponential(5) === x2.toExponential(5)) {
            x1 += 0.125;
        }
        if (y1.toExponential(5) === y2.toExponential(5)) {
            y1 += 0.125;
        }
    }
    c0 = _map2(this._matrix, x1, y1, x2, y2);
    c1 = _map(this._matrix, x, y);
    rx = this._scaleX * radius;
    ry = this._scaleY * radius;

    // [FIX][at][wa] bug, (width | 0) and (height | 0)
    // http://twitter.com/uupaa/status/9833358743
    this._path.push(anticlockwise ? "at " : "wa ",
                    (c1.x - rx) | 0, " ", (c1.y - ry) | 0, " ",
                    (c1.x + rx) | 0, " ", (c1.y + ry) | 0, " ",
                    c0.x1, " ", c0.y1, " ",
                    c0.x2, " ", c0.y2);
}

// CanvasRenderingContext2D.prototype.beginPath
function beginPath() {
    this._path = [];
}

// CanvasRenderingContext2D.prototype.bezierCurveTo
function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    var c0 = _map2(this._matrix, cp1x, cp1y, cp2x, cp2y),
        c1 = _map(this._matrix, x, y);

    // add begin point
    this._path.length || this._path.push("m", c0.x1, " ", c0.y1);

    this._path.push("c ", c0.x1, " ", c0.y1, " ",
                          c0.x2, " ", c0.y2, " ", c1.x,  " ", c1.y);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.clearRect
function clearRect(x, y, w, h) {
    w = parseInt(w);
    h = parseInt(h);

    if ((!x && !y && w >= this.canvas.width && h >= this.canvas.height)) {
        this.clear(); // clear all rect
    } else {
        // clear small rect -> clipping rect
        _applyProperties(this);

        var color = _bgcolor(this.canvas),
            zindex = (this.__mix ===  4) ? --this._zindex
                   : (this.__mix === 10) ? (this.clear(), 0) : 0,
            fg = _at(_COLOR_FILL,
                         zindex, _rect(this, x, y, w, h), color.hex,
                         (this.globalAlpha * color.a) + ' type="solid"');

        if (this._clipPath) {
            fg = _clippy(this, fg);
        }
        this._view.insertAdjacentHTML("BeforeEnd", fg);
    }
}

// CanvasRenderingContext2D.prototype.clip
function clip() {
    var matrix = { _matrix: [1,0,0, 0,1,0, 0,0,1] };

    this._clipPath = _rect(matrix, 0, 0, this.canvas.width, this.canvas.height) +
                     " x " + this._path.join("");
}

// CanvasRenderingContext2D.prototype.closePath
function closePath() {
    this._path.push(" x");
}

// CanvasRenderingContext2D.prototype.createLinearGradient
function createLinearGradient(x0, y0, x1, y1) { // @ret Hash:
    function CanvasGradient(x0, y0, x1, y1) {
        this.fn = _linearGradientFill;
        this.param = { x0: x0, y0: y0, x1: x1, y1: y1 };
        this.color = [];
        this.colors = "";
        this.addColorStop = addColorStop;
    }
    return new CanvasGradient(x0, y0, x1, y1);
}

// CanvasGradient.prototype.addColorStop
function addColorStop(offset, color) {
    var i = 0, iz = this.color.length;

    // collision of the offset is evaded
    if (iz && offset > 0 && offset < 1) {
        for (; i < iz; ++i) {
            if (this.color[i].offset === offset) {
                offset += 0.001;
            }
        }
    }
    this.color.push({ offset: 1 - offset, color: _color(color) });
    this.color.sort(function(a, b) {
        return a.offset - b.offset;
    });
}

// CanvasRenderingContext2D.prototype.createPattern
function createPattern(image,    // @arg HTMLImageElement/HTMLCanvasElement:
                       repeat) { // @arg String(= "repeat"): repetition
                                 // @ret CanvasPatternObject:
    function CanvasPattern(image, repeat) {
        this.fn = _patternFill;
        this.src = image.src; // HTMLImageElement
        this.dim = _imageSize(image);
        this.type = 3; // 3:tile
        this.repeat = repeat;
    }
    repeat = repeat || "repeat";

    switch (repeat) {
    case "repeat": break;
    default: throw new TypeError("NOT_IMPL");
    }
    if (!("src" in image)) { // HTMLCanvasElement unsupported
        throw new TypeError("NOT_IMPL");
    }
    return new CanvasPattern(image, repeat);
}

// CanvasRenderingContext2D.prototype.createRadialGradient
function createRadialGradient(x0, y0, r0, x1, y1, r1) { // @ret CanvasGradient:
    function CanvasGradient(x0, y0, r0, x1, y1, r1) {
        this.fn = _radialGradientFill;
        this.param = { x0: x0, y0: y0, r0: r0,
                       x1: x1, y1: y1, r1: r1 };
        this.color = [];
        this.colors = "";
        this.addColorStop = addColorStop;
    }
    return new CanvasGradient(x0, y0, r0, x1, y1, r1);
}

// CanvasRenderingContext2D.prototype.drawImage
// drawImage(image, dx, dy)
// drawImage(image, dx, dy, dw, dh)
// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
function drawImage(image, a1, a2, a3, a4, a5, a6, a7, a8) {
    if (this.globalAlpha <= 0) {
        return;
    }
    _applyProperties(this);

    var dim = _imageSize(image), // img actual size
        args = arguments.length,
        fullparam = (args === 9),
        sx = fullparam ? a1 : 0,
        sy = fullparam ? a2 : 0,
        sw = fullparam ? a3 : dim.w,
        sh = fullparam ? a4 : dim.h,
        dx = fullparam ? a5 : a1,
        dy = fullparam ? a6 : a2,
        dw = fullparam ? a7 : a3 || dim.w,
        dh = fullparam ? a8 : a4 || dim.h,
        rv = [], fg,
        frag = [], tfrag, // code fragment
        c0,
        renderShadow = this.__shadowColor.a && this.shadowBlur,
        sizeTrans, // Number - 0: none size transform, 1: size transform
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0;

    if (image.src) { // HTMLImageElement

        if (!this._matrixEffected) {
            // without matrix effect

            if (this.__shadowColor.a && this.shadowBlur) {
                // with shadow
                rv.push(_at(_IMAGE_SHADOW,
                            zindex, dx + (this.shadowOffsetX + 1),
                                    dy + (this.shadowOffsetY + 1),
                             _rect(this, 0, 0, dw, dh),
                             this.__shadowColor.hex,
                             (this.globalAlpha / Math.sqrt(this.shadowBlur) * 0.5)));
            }

            if (args === 3 && this.globalAlpha !== 1) {
                // no resize + no opacity
                rv.push(_at(_IMAGE_FILL,
                               zindex, dx, dy, _rect(this, 0, 0, dw, dh),
                               this.globalAlpha, image.src));
            } else {
                // resize + opacity
                rv.push(
                    '<v:image style="position:absolute;z-index:', zindex,
                    ';width:',      dw,
                    'px;height:',   dh,
                    'px;left:',     dx,
                    'px;top:',      dy,
                    'px" coordsize="100,100" src="', image.src,
                    '" opacity="',  this.globalAlpha, // <vml:image opacity> doesn't work.
                    '" cropleft="', sx / dim.w,
                    '" croptop="',  sy / dim.h,
                    '" cropright="',    (dim.w - sx - sw) / dim.w,
                    '" cropbottom="',   (dim.h - sy - sh) / dim.h,
                    '" />');
            }
        } else {
            // with matrix effect
            c0 = _map(this._matrix, dx, dy);

            sizeTrans = (sx || sy); // 0: none size transform, 1: size transform
            tfrag = this._matrixEffected ? _imageTransform(this, this._matrix, dx, dy, dw, dh) : '';

            frag = [
                // [0] shadow only
                '<div style="position:absolute;z-index:' + (zindex - 10) +
                    ';left:$1px;top:$2px' + tfrag + '">',
                // [1]
                '<div style="position:relative;overflow:hidden;width:' +
                    ((dw+(dw<0?-0.49:0.5))|0) + 'px;height:' +
                    ((dh+(dh<0?-0.49:0.5))|0) + 'px">',
                    // optimize Math.round(dw) -> ((dw+(dw<0?-0.49:0.5))|0)
                    // optimize Math.round(dh) -> ((dh+(dh<0?-0.49:0.5))|0)
                // [2]
                !sizeTrans ? "" : [
                    '<div style="width:', Math.ceil(dw + sx * dw / sw),
                        'px;height:', Math.ceil(dh + sy * dh / sh),
                        'px;',
                        _FILTER[0],
                        'Matrix(Dx=', (-sx * dw / sw).toFixed(3),
                              ',Dy=', (-sy * dh / sh).toFixed(3), ')',
                        _FILTER[1], '">'].join(""),
                // [3]
                '<div style="width:' + Math.round(dim.w * dw / sw) +
                        'px;height:' + Math.round(dim.h * dh / sh) + 'px;',
                // [4] shadow only
                'background-color:' + this.__shadowColor.hex + ';' +
                    _FILTER[0] + 'Alpha(opacity=$3)' + _FILTER[1],
                // [5] alphaloader
                _FILTER[0] + 'AlphaImageLoader(src=' +
                    image.src + ',SizingMethod=' +
                    (args === 3 ? "image" : "scale") + ')' + _FILTER[1],
                // [6]
                '"></div>' +
                    (sizeTrans ? '</div>' : '') + '</div></div>'
            ];

            if (renderShadow) {
                fg = frag[0] + frag[1] + frag[2] + frag[3] + frag[4] + frag[6];
                rv.push(
                    fg.replace(/\$1/, this._matrixEffected ? this.shadowOffsetX
                                                           : Math.round(c0.x * 0.1) + this.shadowOffsetX)
                      .replace(/\$2/, this._matrixEffected ? this.shadowOffsetY
                                                           : Math.round(c0.y * 0.1) + this.shadowOffsetY)
                      .replace(/\$3/, this.globalAlpha / Math.sqrt(this.shadowBlur) * 50));

            }

            rv.push('<div style="position:absolute;z-index:', zindex);
            if (this._matrixEffected) {
                rv.push(tfrag, '">');
            } else { // 1:1 scale
                rv.push(';top:', Math.round(c0.y * 0.1), 'px;left:',
                                 Math.round(c0.x * 0.1), 'px">');
            }
            rv.push(frag[1], frag[2], frag[3], frag[5], frag[6]);
        }
        fg = rv.join("");
    } else { // HTMLCanvasElement
        throw new TypeError("NOT_IMPL");
    }
    if (this._clipPath) {
        fg = _clippy(this, fg);
    }
    this._lockState ? this._lockStack.push(fg)
                    : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// inner - image transform
function _imageTransform(ctx, m, x, y, w, h) {
    var c0 = _map2(ctx._matrix, x,     y,     x + w, y    ),
        c1 = _map2(ctx._matrix, x + w, y + h, x,     y + h);

    return [
        ";padding:0 ",
        Math.round(Math.max(c0.x1, c0.x2, c1.x1, c1.x2) / 10), "px ",
        Math.round(Math.max(c0.y1, c0.y2, c1.y1, c1.y2) / 10), "px 0;",
        _FILTER[0], "Matrix(M11=", m[0], ",M12=", m[3],
              ",M21=", m[1], ",M22=", m[4],
              ",Dx=", Math.round(c0.x1 / 10),
              ",Dy=", Math.round(c0.y1 / 10), ")", _FILTER[1]
    ].join("");
}

// CanvasRenderingContext2D.prototype.fill
function fill(path) {
    this.stroke(path, 1);
}

// CanvasRenderingContext2D.prototype.fillRect
function fillRect(x, y, w, h) {
    this.px = x;
    this.py = y;

    this.stroke(_rect(this, x, y, w, h), 1);
}

// CanvasRenderingContext2D.prototype.fillText
function fillText(text, x, y, maxWidth) {
    this.strokeText(text, x, y, maxWidth, 1);
}

// CanvasRenderingContext2D.prototype.lineTo
function lineTo(x, y) {
    var m = this._matrix,
        ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
        iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

    // [INLINING] Math.round()
    // http://d.hatena.ne.jp/uupaa/20090822
    ix = (ix+(ix<0?-0.49:0.5))|0;
    iy = (iy+(iy<0?-0.49:0.5))|0;

    this._path.length || this._path.push("m ", ix, " ", iy);
    this._path.push("l ", ix, " ", iy);

    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.measureText
function measureText(text) {
    return _fontMetric(this.font, text);
}

// CanvasRenderingContext2D.prototype.moveTo
function moveTo(x, y) {
    // [INLINING] _map(x, y)
    var m = this._matrix,
        ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
        iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

    // [INLINING] Math.round()
    // http://d.hatena.ne.jp/uupaa/20090822
    this._path.push("m ", (ix+(ix<0?-0.49:0.5))|0, " ",
                          (iy+(iy<0?-0.49:0.5))|0);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.quadraticCurveTo
function quadraticCurveTo(cpx, cpy, x, y) {
    var cp1x = this.px + 2 / 3 * (cpx - this.px),
        cp1y = this.py + 2 / 3 * (cpy - this.py),
        cp2x = cp1x + (x - this.px) / 3,
        cp2y = cp1y + (y - this.py) / 3,
        m = this._matrix,
        m0 = m[0], m1 = m[1],
        m3 = m[3], m4 = m[4],
        m6 = m[6], m7 = m[7],
        c0x = (x    * m0 + y    * m3 + m6) * 10 - 5,
        c0y = (x    * m1 + y    * m4 + m7) * 10 - 5,
        c1x = (cp1x * m0 + cp1y * m3 + m6) * 10 - 5,
        c1y = (cp1x * m1 + cp1y * m4 + m7) * 10 - 5,
        c2x = (cp2x * m0 + cp2y * m3 + m6) * 10 - 5,
        c2y = (cp2x * m1 + cp2y * m4 + m7) * 10 - 5;

    // [INLINING] Math.round()
    // http://d.hatena.ne.jp/uupaa/20090822
    cpx = (c1x+(c1x<0?-0.49:0.5))|0;
    cpy = (c1y+(c1y<0?-0.49:0.5))|0;

    this._path.length || this._path.push("m ", cpx, " ", cpy);

    // [INLINING] Math.round()
    this._path.push("c ", cpx, " ", cpy, " ",
        (c2x+(c2x<0?-0.49:0.5))|0, " ", (c2y+(c2y<0?-0.49:0.5))|0, " ",
        (c0x+(c0x<0?-0.49:0.5))|0, " ", (c0y+(c0y<0?-0.49:0.5))|0);
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.rect
function rect(x, y, w, h) {
    this._path.push(_rect(this, x, y, w, h));
    this.px = x;
    this.py = y;
}

// CanvasRenderingContext2D.prototype.restore
function restore() {
    this._stateStack.length && _copyProperties(this, this._stateStack.pop());
}

// CanvasRenderingContext2D.prototype.rotate
function rotate(angle) {
    this._matrixEffected = 1;
    this._matrix = Matrix2D_rotate(angle, this._matrix);
}

// CanvasRenderingContext2D.prototype.save
function save() {
    var prop = _copyProperties({}, this);

    prop._clipPath = this._clipPath || null;
    this._stateStack.push(prop);
}

// CanvasRenderingContext2D.prototype.scale
function scale(x, y) {
    this._matrixEffected = 1;
    this._matrix = Matrix2D_scale(x, y, this._matrix);
    this._scaleX *= x;
    this._scaleY *= y;
    this._lineScale = (this._matrix[0] + this._matrix[4]) / 2;
}

// CanvasRenderingContext2D.prototype.setTransform
function setTransform(m11, m12, m21, m22, dx, dy) {
    this._matrixEffected = 1;
    if (m11 === 1 && !m12 && m22 === 1 && !m21 && !dx && !dy) {
        this._matrixEffected = 0; // reset _matrixEffected flag
    }
    this._matrix = [m11, m12, 0,  m21, m22, 0,  dx, dy, 1];
}

// CanvasRenderingContext2D.prototype.stroke
function stroke(path, fill) {
    if (this.globalAlpha <= 0) {
        return;
    }
    _applyProperties(this, fill);

    path = path || this._path.join("");

    var fg = "",
        strokeProps,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0)
               : 0,
        color = fill ? this.fillStyle
                     : this.strokeStyle;

    if (typeof color !== "string") {
        // call _linearGradientFill()
        // call _radialGradientFill()
        // call _patternFill()
        fg = color.fn(this, color, path, fill, zindex);
    } else {
        strokeProps = fill ? ""
                           : _buildStrokeProps(this);

        color = fill ? this.__fillStyle
                     : this.__strokeStyle;

        if (this.__shadowColor.a && this.shadowBlur) {
            fg = _at(fill ? _COLOR_FILL : _COLOR_STROKE,
                         zindex + ";left:" + (this.shadowOffsetX + 1) + "px;top:" +
                                             (this.shadowOffsetY + 1) + "px",
                         path, this.__shadowColor.hex,
                         (this.globalAlpha / Math.sqrt(this.shadowBlur) * 0.5) + strokeProps);
        }
        // [SPEED][INLINING]
        if (fill) {
            fg += '<v:shape style="position:absolute;width:10px;height:10px;z-index:' + zindex +
                    '" filled="t" stroked="f" coordsize="100,100" path="' + path +
                    '"><v:fill color="' + color.hex +
                    '" opacity="' + (this.globalAlpha * color.a) + '" /></v:shape>';
        } else {
            fg += '<v:shape style="position:absolute;width:10px;height:10px;z-index:' + zindex +
                    '" filled="f" stroked="t" coordsize="100,100" path="' + path +
                    '"><v:stroke color="' + color.hex +
                    '" opacity="' + (this.globalAlpha * color.a) + strokeProps + '" /></v:shape>';
        }
    }
    if (this._clipPath) {
        fg = _clippy(this, fg);
    }
    this._lockState ? this._lockStack.push(fg)
                    : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// CanvasRenderingContext2D.prototype.strokeRect
function strokeRect(x, y, w, h) {
    this.stroke(_rect(this, x, y, w, h));
}

// CanvasRenderingContext2D.prototype.strokeText
function strokeText(text, x, y, maxWidth, fill) {
    if (this.globalAlpha <= 0) {
        return;
    }
    _applyProperties(this, fill);

    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

    var style = fill ? this.fillStyle : this.strokeStyle,
        zindex = (this.__mix ===  4) ? --this._zindex
               : (this.__mix === 10) ? (this.clear(), 0) : 0,
        rv = [], fg, color,
        align = this.textAlign, dir = "ltr",
        font = _parseFont(this.font, this._fontStyleCache),
        m = this._matrix,
        fp, c0, // for grad
        skew = m[0].toFixed(3) + ',' + m[3].toFixed(3) + ',' +
               m[1].toFixed(3) + ',' + m[4].toFixed(3) + ',0,0',
        skewOffset,
        delta = 1000, left = 0, right = delta,
        offset = { x: 0, y: 0 },
        blur;

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
        align = this._textDirection === dir ? "left" : "right"
    }
    switch (align) {
    case "center": left = right = delta / 2; break;
    case "right":  left = delta, right = 0.05;
    }

    if (this.textBaseline === "top") {
        // text margin-top fine tuning
        offset.y = font.size /
            (_parseFont.scale[font.rawfamily.split(",")[0].toUpperCase()] ||
             1.3); // TextMarginTop
    }
    skewOffset = _map(this._matrix, x + offset.x, y + offset.y);

    if (this.__shadowColor.a && this.shadowBlur) {
        blur = Math.sqrt(this.shadowBlur);

        rv.push('<v:line style="position:absolute;z-index:', zindex,
                ';width:1px;height:1px;left:', this.shadowOffsetX + 1,
                'px;top:', this.shadowOffsetY + 1, 'px',
                '" filled="t" stroked="f" from="', -left, ' 0" to="', right,
                ' 0.05" coordsize="100,100"><v:fill color="', this.__shadowColor.hex,
//              '" opacity="', (this.globalAlpha / blur * 0.5).toFixed(3),
                '" opacity="', (this.globalAlpha / blur).toFixed(3),
                '" /><v:skew on="t" matrix="', skew,
                '" offset="', Math.round(skewOffset.x / 10), ',',
                              Math.round(skewOffset.y / 10),
                '" origin="', left,
                ' 0" /><v:path textpathok="t" /><v:textpath on="t" string="',
                _toEntity(text),
                '" style="v-text-align:', align,
                ';font:', _toEntity(font.formal), '" /></v:line>');
    }

    rv.push('<v:line style="position:absolute;z-index:', zindex,
            ';width:1px;height:1px" filled="t" stroked="f" from="', -left,
            ' 0" to="', right, ' 0.05" coordsize="100,100">');

    if (typeof style === "string") {
        color = fill ? this.__fillStyle : this.__strokeStyle;
        rv.push('<v:fill color="', color.hex,
                '" opacity="', (color.a * this.globalAlpha).toFixed(2), '" />');
    } else if (style.fn === _patternFill) {
        rv.push('<v:fill position="0,0" type="tile" src="', style.src, '" />');
    } else { // liner, radial
        fp = style.param;
        c0 = _map2(this._matrix, fp.x0, fp.y0, fp.x1, fp.y1);
        rv.push('<v:fill type="gradient" method="sigma" focus="0%" colors="',
                style.colors || _gradationColor(style),
                '" opacity="', this.globalAlpha,
                '" o:opacity2="', this.globalAlpha,
                '" angle="',
                Math.atan2(c0.x2 - c0.x1, c0.y2 - c0.y1) * 180 / Math.PI,
                '" />');
    }
    rv.push('<v:skew on="t" matrix="', skew,
            '" offset="', Math.round(skewOffset.x / 10), ',',
                          Math.round(skewOffset.y / 10),
            '" origin="', left,
            ' 0" /><v:path textpathok="t" /><v:textpath on="t" string="',
            _toEntity(text),
            '" style="v-text-align:', align,
            ';font:', _toEntity(font.formal),
            '" /></v:line>');
    fg = rv.join("");
    if (this._clipPath) {
        fg = _clippy(this, fg);
    }
    this._lockState ? this._lockStack.push(fg)
                    : this._view.insertAdjacentHTML("BeforeEnd", fg);
}

// CanvasRenderingContext2D.prototype.transform
function transform(m11, m12, m21, m22, dx, dy) {
    this._matrixEffected = 1;
    this._matrix = Matrix2D_transform(m11, m12, m21, m22, dx, dy, this._matrix);
}

// CanvasRenderingContext2D.prototype.translate
function translate(x, y) {
    this._matrixEffected = 1;
    this._matrix = Matrix2D_translate(x, y, this._matrix);
}

function _rect(ctx, // @arg Object: CanvasRenderingContext2D
               x,   // @arg Number:
               y,   // @arg Number:
               w,   // @arg Number:
               h) { // @arg Number:
                    // @inner:
    var m = ctx._matrix,
        m0 = m[0], m1 = m[1],
        m3 = m[3], m4 = m[4],
        m6 = m[6], m7 = m[7],
        xw = x + w,
        yh = y + h,
        c0x = (x  * m0 + y  * m3 + m6) * 10 - 5,
        c0y = (x  * m1 + y  * m4 + m7) * 10 - 5,
        c1x = (xw * m0 + y  * m3 + m6) * 10 - 5,
        c1y = (xw * m1 + y  * m4 + m7) * 10 - 5,
        c2x = (xw * m0 + yh * m3 + m6) * 10 - 5,
        c2y = (xw * m1 + yh * m4 + m7) * 10 - 5,
        c3x = (x  * m0 + yh * m3 + m6) * 10 - 5,
        c3y = (x  * m1 + yh * m4 + m7) * 10 - 5;

    // http://d.hatena.ne.jp/uupaa/20090822
    return [" m", (c0x+(c0x<0?-0.49:0.5))|0, " ", (c0y+(c0y<0?-0.49:0.5))|0,
            " l", (c1x+(c1x<0?-0.49:0.5))|0, " ", (c1y+(c1y<0?-0.49:0.5))|0,
            " l", (c2x+(c2x<0?-0.49:0.5))|0, " ", (c2y+(c2y<0?-0.49:0.5))|0,
            " l", (c3x+(c3x<0?-0.49:0.5))|0, " ", (c3y+(c3y<0?-0.49:0.5))|0,
            " x"].join("");
}

function _map(m,   // @arg Array: matrix
              x,   // @arg Number: x
              y) { // @arg Number: y
                   // @ret Hash: { x, y }
                   // @inner:
    // [SPEED][INLINING]
    // x: Math.round((x * m[0] + y * m[3] + m[6]) * 10 - 5),
    // y: Math.round((x * m[1] + y * m[4] + m[7]) * 10 - 5)
    //
    var x1 = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
        y1 = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

    return {
        x: ((x1+(x1<0?-0.49:0.5))|0),
        y: ((y1+(y1<0?-0.49:0.5))|0)
    };
}

function _map2(m,    // @arg Array: matrix
               x1,   // @arg Number: x
               y1,   // @arg Number: y
               x2,   // @arg Number: x
               y2) { // @arg Number: y
                     // @ret Hash: { x1, y1, x2, y2 }
                     // @inner:
    // [SPEED][INLINING]
    //  x1: Math.round((x1 * m[0] + y1 * m[3] + m[6]) * 10 - 5),
    //  y1: Math.round((x1 * m[1] + y1 * m[4] + m[7]) * 10 - 5),
    //  x2: Math.round((x2 * m[0] + y2 * m[3] + m[6]) * 10 - 5),
    //  y2: Math.round((x2 * m[1] + y2 * m[4] + m[7]) * 10 - 5)
    //
    var _x1 = (x1 * m[0] + y1 * m[3] + m[6]) * 10 - 5,
        _y1 = (x1 * m[1] + y1 * m[4] + m[7]) * 10 - 5,
        _x2 = (x2 * m[0] + y2 * m[3] + m[6]) * 10 - 5,
        _y2 = (x2 * m[1] + y2 * m[4] + m[7]) * 10 - 5;

    return {
        x1: ((_x1+(_x1<0?-0.49:0.5))|0),
        y1: ((_y1+(_y1<0?-0.49:0.5))|0),
        x2: ((_x2+(_x2<0?-0.49:0.5))|0),
        y2: ((_y2+(_y2<0?-0.49:0.5))|0)
    };
}

// inner - Linear Gradient Fill
function _linearGradientFill(ctx, obj, path, fill, zindex) {
    var fg = "", fp = obj.param,
        c0 = _map2(ctx._matrix, fp.x0, fp.y0, fp.x1, fp.y1),
        angle = Math.atan2(c0.x2 - c0.x1, c0.y2 - c0.y1) * 180 / Math.PI,
        color, strokeProps = fill ? "" : _buildStrokeProps(ctx);

    angle < 0 && (angle += 360);

    if (ctx.__shadowColor.a && ctx.shadowBlur) {
        // --- fill ---
        //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //                                                                    ~~~~~~~~~~~~~~~~~
        //      coordsize="100,100" filled="t" stroked="f" path="?">
        //      <v:fill type="gradient" method="sigma" focus="0%" opacity="?" angle="?" color="?" />
        //                                                                            ~~~~~~~~~~
        //  </v:shape>
        //
        // --- stroke ---
        //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //                                                                    ~~~~~~~~~~~~~~~~~
        //      coordsize="100,100" filled="f" stroked="t" path="?">
        //      <v:stroke filltype="solid" opacity="?" angle="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
        //                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //  </v:shape>
        fg = _at(fill ? _LINER_FILL : _LINER_STROKE,
                     zindex + ";left:" + (ctx.shadowOffsetX + 1) + "px;top:" +
                                         (ctx.shadowOffsetY + 1) + "px",
                     path, (ctx.globalAlpha / Math.sqrt(ctx.shadowBlur) * 0.5),
                     angle + '" color="' + ctx.__shadowColor.hex + strokeProps);
    }
    // --- fill ---
    //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?"
    //      coordsize="100,100" filled="t" stroked="f" path="?">
    //      <v:fill type="gradient" method="sigma" focus="0%" opacity="?" angle="?" colors="?" o:opacity2="?" />
    //                                                                            ~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  </v:shape>
    //
    // --- stroke ---
    //  <v:shape style="position:absolute;width:10px;height:10px;z-index:?"
    //      coordsize="100,100" filled="f" stroked="t" path="?">
    //      <v:stroke filltype="solid" opacity="?" angle="?" color="?" o:opacity2="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
    //                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  </v:shape>
    color = fill ? ('" colors="' + (obj.colors || _gradationColor(obj)))
                 : ('" color="'  + obj.color[0].color.hex);
    return fg + _at(fill ? _LINER_FILL : _LINER_STROKE,
                        zindex, path, ctx.globalAlpha,
                        angle + strokeProps + color + '" o:opacity2="' + ctx.globalAlpha);
}

// inner - Radial Gradient Fill
function _radialGradientFill(ctx, obj, path, fill, zindex) {
    var rv = [], v, more,
        fp = obj.param, fsize, fposX, fposY,
        zindex2 = 0,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        r1x = fp.r1 * ctx._scaleX,
        r1y = fp.r1 * ctx._scaleY,
        c0 = _map(ctx._matrix, x, y),
        strokeProps = fill ? "" : _buildStrokeProps(ctx);

    // focus
    if (fill) {
        fsize = (fp.r0 / fp.r1);
        fposX = (1 - fsize + (fp.x0 - fp.x1) / fp.r1) / 2; // forcus position x
        fposY = (1 - fsize + (fp.y0 - fp.y1) / fp.r1) / 2; // forcus position y
    }

    if (ctx.__shadowColor.a && ctx.shadowBlur) {
        // --- fill shadow ---
        //      [[inside]]
        //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
        //          filled="t" stroked="f" coordsize="11000,11000">
        //          <v:fill type="gradientradial" method="sigma" opacity="?" color="?" focussize="?,?" focusposition="?,?" />
        //                                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //      </v:oval>
        //
        // --- stroke shadow ---
        //      [[inside]]
        //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
        //          filled="f" stroked="t" coordsize="11000,11000">
        //          <v:stroke filltype="tile" opacity="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
        //                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //      </v:oval>
        //
        more = fill ? _at('" color="@@" focussize="@@,@@" focusposition="@@,@@',
                             ctx.__shadowColor.hex, fsize, fsize, fposX, fposY)
                    : _at('" color="@@@@', ctx.__shadowColor.hex, strokeProps);
        rv.push(_at(fill ? _RADIAL_FILL : _RADIAL_STROKE,
                        zindex,
                        Math.round(c0.x / 10) + ctx.shadowOffsetX + 1,
                        Math.round(c0.y / 10) + ctx.shadowOffsetY + 1, r1x, r1y,
                        (ctx.globalAlpha / Math.sqrt(ctx.shadowBlur) * 0.5) + more));
    }

    if (fill) {
        // fill outside
        if (obj.color.length) {
            v = obj.color[0]; // 0 = outer color
            if (v.color.a > 0.001) {
                if (ctx.__mix === 4) { zindex2 = --ctx._zindex; }
                rv.push('<v:shape style="position:absolute;width:10px;height:10px;z-index:', zindex2,
                        '" filled="t" stroked="f" coordsize="100,100" path="', path,
                        '"><v:fill type="solid" color="', v.color.hex,
                        '" opacity="', (ctx.globalAlpha * v.color.a).toFixed(3),
                        '" /></v:shape>');
            }
        }
    }
    // --- fill ---
    //      [[outside]]
    //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?"
    //          filled="t" stroked="f" coordsize="100,100" path="?">
    //          <v:fill type="solid" color="?" opacity="?" />
    //      </v:shape>
    //
    //      [[inside]]
    //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
    //          filled="t" stroked="f" coordsize="11000,11000">
    //          <v:fill type="gradientradial" method="sigma" opacity="?" o:opacity2="?" colors="?" focussize="?,?" focusposition="?,?" />
    //                                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      </v:oval>
    //
    // --- stroke ---
    //      [[inside]]
    //      <v:oval style="position:absolute;z-index:?;left:?px;top:?px;width:?px;height:?px"
    //          filled="f" stroked="t" coordsize="11000,11000">
    //          <v:stroke filltype="tile" opacity="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
    //                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      </v:oval>
    more = fill ? _at('" o:opacity2="@@" colors="@@" focussize="@@,@@" focusposition="@@,@@',
                         ctx.globalAlpha, obj.colors || _gradationColor(obj),
                         fsize, fsize, fposX, fposY)
                : _at('" color="@@@@', obj.color[0].color.hex, strokeProps);

    rv.push(_at(fill ? _RADIAL_FILL : _RADIAL_STROKE,
                    zindex,
                    Math.round(c0.x / 10),
                    Math.round(c0.y / 10), r1x, r1y,
                    ctx.globalAlpha + more));
    return rv.join("");
}

// inner - Pattern Fill
function _patternFill(ctx, obj, path, fill, zindex) {
    var fg = "", strokeProps = fill ? "" : _buildStrokeProps(ctx);

    if (ctx.__shadowColor.a && ctx.shadowBlur) {
        // --- fill --
        //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //          coordsize="100,100" filled="t" stroked="f" path="?">
        //          <v:fill type="?" opacity="?" color="?" />
        //                                     ~~~~~~~~~~
        //      </v:shape>
        //
        // --- stroke ---
        //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
        //          coordsize="100,100" filled="f" stroked="t" path="?">
        //          <v:stroke filltype="?" opacity="?" color="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
        //                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //      </v:shape>
        fg = _at(fill ? _PATTERN_FILL : _PATTERN_STROKE,
                     zindex, ctx.shadowOffsetX + 1,
                             ctx.shadowOffsetY + 1,
                     path, "solid",
                     (ctx.globalAlpha / Math.sqrt(ctx.shadowBlur) * 0.5) +
                     '" color="' + ctx.__shadowColor.hex + strokeProps);
    }

    // --- fill --
    //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
    //          coordsize="100,100" filled="t" stroked="f" path="?">
    //          <v:fill type="?" opacity="?" src="?" />
    //                                     ~~~~~~~~
    //      </v:shape>
    //
    // --- stroke ---
    //      <v:shape style="position:absolute;width:10px;height:10px;z-index:?;left:?px;top:?px"
    //          coordsize="100,100" filled="f" stroked="t" path="?">
    //          <v:stroke filltype="?" opacity="?" src="?" joinstyle="?" miterlimit="?" weight="?px" endcap="?" />
    //                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      </v:shape>
    return fg + _at(fill ? _PATTERN_FILL : _PATTERN_STROKE,
                        zindex, 0, 0, path, "tile",
                        ctx.globalAlpha + '" src="' + obj.src + strokeProps);
}

// inner -
function _clippy(ctx, fg) {
    return fg + _at(_CLIPPY, ctx._clipPath, ctx.xClipColor);
}

// inner - build Gradation Color
function _gradationColor(obj) { // @arg CanvasGradient:
                                // @ret String:
    var rv = [], ary = obj.color, i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        rv.push(ary[i].offset + " " + ary[i].color.hex);
    }
    return obj.colors = rv.join(","); // bond
}

// inner - build stroke properties
function _buildStrokeProps(ctx) { // @arg CanvasRenderingContext2D:
                                  // @ret String: stroke style strings
    var modified = 0;

    if (ctx._lineJoin !== ctx.lineJoin) {
        ctx._lineJoin  =  ctx.lineJoin;
        ++modified;
    }
    if (ctx._lineWidth !== ctx.lineWidth) {
        ctx._lineWidth  =  ctx.lineWidth;
        ctx.__lineWidth = (ctx.lineWidth * ctx._lineScale).toFixed(2);
        ++modified;
    }
    if (ctx._miterLimit !== ctx.miterLimit) {
        ctx._miterLimit  =  ctx.miterLimit;
        ++modified;
    }
    if (ctx._lineCap !== ctx.lineCap) {
        ctx._lineCap  =  ctx.lineCap;
        ctx.__lineCap = (ctx.lineCap === "butt") ? "flat" : ctx.lineCap;
        ++modified;
    }

    if (modified) {
        ctx._strokeCache =
                '" joinstyle="'  + ctx._lineJoin +
                '" miterlimit="' + ctx._miterLimit +
                '" weight="'     + ctx.__lineWidth +
                'px" endcap="'   + ctx.__lineCap;
    }
    return ctx._strokeCache;
}

// --- Extends ---------------------------------------------
// CanvasRenderingContext2D.prototype.lock
function lock(clear) { // @arg Boolean(= false): lazy clear
    if (this._lockState & 0x1) {
        throw new TypeError("DUPLICATE_LOCK");
    }
    this._lockState = 0x1;
    if (clear) {
        this._lockState |= 0x2;
    } else {
        this._lockState |= 0x4;
        this._view.style.display = "none";
    }
}

// CanvasRenderingContext2D.prototype.unlock
function unlock() {
    if (this._lockState & 0x1) {
        if (this._lockState & 0x2) {
            this._nodeCache = {};
            this.clear();
        }
        if (this._lockStack.length) {
            this._view.insertAdjacentHTML("BeforeEnd", this._lockStack.join(""));
            this._lockStack = [];
        }
        if (this._lockState & 0x4) {
            this._view.style.display = "inline-block";
        }
        this._lockState = 0x0;
    }
}

// CanvasRenderingContext2D.prototype.clear
function clear() {
    // reset state
    this._zindex = 0;
    this._view.innerHTML = ""; // clear all
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
    var path = [];

    // --- create path ---
    {
        // moveTo(x, y)
        var m = this._matrix,
            ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5,
            iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;

        path.push("m ", Math.round(ix), " ", Math.round(iy));

        var i = 0, iz = lines.length;
        // lineTo(x, y)
        for (; i < iz; i += 2) {
            x  = lines[i];
            y  = lines[i + 1];
            ix = (x * m[0] + y * m[3] + m[6]) * 10 - 5;
            iy = (x * m[1] + y * m[4] + m[7]) * 10 - 5;
            path.push("l ", Math.round(ix), " ", Math.round(iy));
        }
        path.push(" x");
    }

    var node = _nodeCache[id];

    if (node) {
        node.path = path.join("");

        var color = _color(fill ? this.fillStyle : this.strokeStyle),
            child = node.firstChild;

        child.color = color.hex;
        child.opacity = this.globalAlpha * color.a;
    } else {
        _applyProperties(this, fill);
        var fg;

        if (fill) {
            fg = '<v:shape id="' + id + '" style="position:absolute;width:10px;height:10px;z-index:0' +
                    '" filled="t" stroked="f" coordsize="100,100" path="' + path.join("") +
                    '"><v:fill color="' + this.__fillStyle.hex +
                    '" opacity="' + (this.globalAlpha * this.__fillStyle.a) + '" /></v:shape>';
        } else {
            var props = _buildStrokeProps(this);

            fg = '<v:shape id="' + id + '" style="position:absolute;width:10px;height:10px;z-index:0' +
                    '" filled="f" stroked="t" coordsize="100,100" path="' + path.join("") +
                    '"><v:stroke color="' + this.__strokeStyle.hex +
                    '" opacity="' + (this.globalAlpha * this.__strokeStyle.a) + props + '" /></v:shape>';
        }

        this._view.insertAdjacentHTML("BeforeEnd", fg);
        _nodeCache[id] = document.getElementById(id); // { id: node }
    }
}

// CanvasRenderingContext2D.prototype.animFillRect
function animFillRect(id,  // @arg String: id
                      x,   // @arg Number:
                      y,   // @arg Number:
                      w,   // @arg Number:
                      h) { // @arg Number:
    this.animStrokeRect(id, x, y, w, h, true);
}

// CanvasRenderingContext2D.prototype.animStrokeRect
function animStrokeRect(id,     // @arg String: id
                        x,      // @arg Number:
                        y,      // @arg Number:
                        w,      // @arg Number:
                        h,      // @arg Number:
                        fill) { // @arg Boolean(= false): true is fill

    var node = _nodeCache[id];

    if (node) {
        node.path = _rect(this, x, y, w, h);

        var color = _color(fill ? this.fillStyle : this.strokeStyle),
            child = node.firstChild;

        child.color = color.hex;
        child.opacity = this.globalAlpha * color.a;
    } else {
        this.stroke(_rect(this, x, y, w, h), 1);
        _nodeCache[id] = document.getElementById(id); // { id: node }
    }
}

// CanvasRenderingContext2D.prototype.drawCircle
function drawCircle(x,           // @arg Number:
                    y,           // @arg Number:
                    radius,      // @arg Number: radius
                    fillColor,   // @arg ColorString(= ""):
                    strokeColor, // @arg ColorString(= ""):
                    lineWidth) { // @arg Number(= 1): stroke lineWidth

    if (this.globalAlpha && radius && (fillColor || strokeColor)) {

        var lw = lineWidth === void 0 ? 1 : lineWidth, color,
            fg = '<v:oval style="position:absolute;left:' + (x - radius) +
                    'px;top:'       + (y - radius) +
                    'px;width:'     + (radius * 2) +
                    'px;height:'    + (radius * 2) +
                    'px" filled="'  + (fillColor ? "t" : "f") +
                    '" stroked="'   + (strokeColor ? "t" : "f") + '">';

        if (fillColor) {
            color = _color(fillColor);
            fg +=   '<v:fill opacity="' + (this.globalAlpha * color.a) +
                            '" color="' + color.hex + '" />';
        }
        if (strokeColor && lw) {
            color = _color(strokeColor);
            fg +=   '<v:stroke opacity="' + (this.globalAlpha * color.a) +
                            '" color="' + color.hex +
                            '" weight="' + lw + 'px" />';
        }
        fg += '</v:oval>';

        this._lockState ? this._lockStack.push(fg)
                        : this._view.insertAdjacentHTML("BeforeEnd", fg);
    }
}

// CanvasRenderingContext2D.prototype.drawRoundRect - round rect
function drawRoundRect(x,           // @arg Number:
                       y,           // @arg Number:
                       width,       // @arg Number:
                       height,      // @arg Number:
                       radius,      // @arg Number/NumberArray: [top-left, top-right, bottom-right, bottom-left]
                       fillColor,   // @arg ColorString(= ""):
                       strokeColor, // @arg ColorString(= ""):
                       lineWidth) { // @arg Number(= 1): stroke lineWidth

    if (this.globalAlpha && width && height && (fillColor || strokeColor)) {
        var lw = lineWidth === void 0 ? 1 : lineWidth,
            path, fg, ix, iy, iw, ih, color;

        if (typeof radius === "number") { // Number -> [r, r, r, r]
            radius = [radius, radius, radius, radius];
        }
        if (!radius[0] &&
             radius[0] === radius[1] &&
             radius[0] === radius[2] &&
             radius[0] === radius[3]) {

            // radius = [0, 0, 0, 0]
            ix = x * 10 - 5;
            iy = y * 10 - 5;
            iw = (x + width)  * 10 - 5;
            ih = (y + height) * 10 - 5;

            path = ["m " + ix + " " + iy +
                    "l " + ix + " " + ih +
                    "l " + iw + " " + ih +
                    "l " + iw + " " + iy +
                    "l " + ix + " " + iy + "x"].join("");
        } else {
            path = _buildRoundRectPath(this, x, y, width, height,
                                       radius[0], radius[1], radius[2], radius[3]);
        }

        fg = '<v:shape style="position:absolute;width:10px;height:10px;z-index:0' +
                '" filled="'   + (fillColor         ? "t" : "f") +
                '" stroked="'  + (strokeColor && lw ? "t" : "f") +
                '" coordsize="100,100" path="' + path + '">';

        if (fillColor) {
            color = _color(fillColor);
            fg +=   '<v:fill opacity="' + (this.globalAlpha * color.a) +
                            '" color="' + color.hex + '" />';
        }
        if (strokeColor && lw) {
            color = _color(strokeColor);
            fg +=   '<v:stroke opacity="' + (this.globalAlpha * color.a) +
                            '" color="' + color.hex +
                            '" weight="' + lw + 'px" />';
        }
        fg += '</v:shape>';

        this._lockState ? this._lockStack.push(fg)
                        : this._view.insertAdjacentHTML("BeforeEnd", fg);
    }
}

// inner - build round rect paths
function _buildRoundRectPath(ctx, x, y, w, h, r0, r1, r2, r3) {
    var w2 = (w / 2) | 0,
        h2 = (h / 2) | 0,
        rmin = Math.min(w2, h2);

    r0 = r0 < 0 ? 0 : (r0 < w2 && r0 < h2) ? r0 : rmin;
    r1 = r1 < 0 ? 0 : (r1 < w2 && r1 < h2) ? r1 : rmin;
    r2 = r2 < 0 ? 0 : (r2 < w2 && r2 < h2) ? r2 : rmin;
    r3 = r3 < 0 ? 0 : (r3 < w2 && r3 < h2) ? r3 : rmin;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + h2);
    ctx.lineTo(x, y + h - r3);
    ctx.quadraticCurveTo(x, y + h, x + r3, y + h); // bottom-left
    ctx.lineTo(x + w - r2, y + h);
    ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r2); // bottom-right
    ctx.lineTo(x + w, y + r1);
    ctx.quadraticCurveTo(x + w, y, x + w - r1, y); // top-left
    ctx.lineTo(x + r0, y);
    ctx.quadraticCurveTo(x, y, x, y + r0); // top-right
    ctx.closePath();
    ctx.restore();
    return ctx._path.join("");
}

// --- Utility ---------------------------------------------
function _nop() {
}

// String#at
function _at(format) {
    var i = 1, args = arguments;

    return format.replace(/@@/g, function() {
        return args[i++];
    });
}

// --- Class Image subset ----------------------------------
function _imageSize(node) { // @arg HTMLImageElement
    var rs, rw, rh, w, h, hide;

    if (!node.src) {
        return { w: node.width, h: node.height };
    }
    if (node.currentStyle) {
        hide = node.currentStyle.display === "none";
        hide && (node.style.display = "block");
    }
    rs = node.runtimeStyle;
    // keep runtimeStyle
    w = rs.width;
    h = rs.height;
    // override
    rs.width = rs.height = "auto";
    rw = node.width;
    rh = node.height;
    // restore
    rs.width  = w;
    rs.height = h;

    hide && (node.style.display = "none");
    return { w: rw, h: rh };
}

// --- Class Font subset -----------------------------------
function _parseFont(fontStyle, // @arg String: fontStyle string, eg: "12pt Arial"
                    cache) {   // @arg Object: { font, em }
                               // @ret Object: { style, weight, variant, rawfamily,
                               //                 family, formal }
                               //    style     - String: "normal", "italic", "oblique"
                               //    weight    - String: "normal", "bold", "bolder",
                               //                        "lighter", "100" ~ "900"
                               //    variant   - String: "normal", "small-caps"
                               //    rawfamily - String: "Times New Roman,Arial"
                               //    family    - String: "'Times New Roman','Arial'"
                               //    formal    - String: "{style} {variant} {weight} {size}px {family}"
                               // @throw: TypeError("UNKNOWN_FONT_UNIT")
                               // @desc: parse CSS::font style
    var rv = {}, fontSize, style;

    if (!cache.font[fontStyle]) {
        // --- parse font string ---
        style = document.createElement("div").style; // dummy(div) node
        try {
            style.font = fontStyle; // parse
        } catch (err) {
            throw err;
        }

        fontSize = style.fontSize; // get font-size
        rv.size = _parseFont.size[fontSize];

        if (rv.size) { // "small", "large" ...
            rv.size *= 16;
        } else if (fontSize.lastIndexOf("px") > 0) { // "12px"
            rv.size = parseFloat(fontSize);
        } else if (fontSize.lastIndexOf("pt") > 0) { // "12.3pt"
            rv.size = parseFloat(fontSize) * 1.33;
        } else if (fontSize.lastIndexOf("em") > 0) { // "10.5em"
            rv.size = parseFloat(fontSize) * cache.em;
        } else {
            throw new TypeError("UNKNOWN_FONT_UNIT");
        }
        rv.style = style.fontStyle; // normal, italic, oblique
        rv.weight = style.fontWeight; // normal, bold, bolder, lighter, 100~900
        rv.variant = style.fontVariant; // normal, small-caps
        rv.rawfamily = style.fontFamily.replace(/[\"\']/g, "");
        rv.family = "'" + rv.rawfamily.replace(/\s*,\s*/g, "','") + "'";
        rv.formal = [rv.style,
                     rv.variant,
                     rv.weight,
                     rv.size.toFixed(2) + "px",
                     rv.family].join(" ");

        cache.font[fontStyle] = rv; // add cache
    }
    return cache.font[fontStyle];
}
_parseFont.size = {
    "xx-small": 0.512,
    "x-small":  0.64,
    smaller:    0.8,
    small:      0.8,
    medium:     1,
    large:      1.2,
    larger:     1.2,
    "x-large":  1.44,
    "xx-large": 1.728
};
_parseFont.scale = {
    ARIAL: 1.55, "ARIAL BLACK": 1.07, "COMIC SANS MS": 1.15,
    "COURIER NEW": 1.6, GEORGIA: 1.6, "LUCIDA GRANDE": 1,
    "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
    "TREBUCHET MS": 1.55, VERDANA: 1.4,
    "MS UI GOTHIC": 2, "MS PGOTHIC": 2, MEIRYO: 1,
    "SANS-SERIF": 1, SERIF: 1, MONOSPACE: 1, FANTASY: 1, CURSIVE: 1
};

function _detectEMPixelValue(canvasNode) { // @arg Node:
                                           // @ret Number: em size (unit: pixel)
    var rv, div = canvasNode.appendChild(document.createElement("div"));

    div.style.cssText =
                "position:absolute;border:0 none;margin:0;padding:0;width:12em";

    rv = div.clientWidth / 12;

    canvasNode.removeChild(div);
    return rv;
}

function _fontMetric(font,   // @arg CSSFronString: "12pt Arial"
                     text) { // @arg String(= "aABCDEFGHIJKLMm"):
                             // @ret Object: { width, height }
                             // @desc: measure text rect(width, height)
    var id = "CanvasVML_font",
        node = document.getElementById(id);

    if (!node) {
         node = document.createElement("div");
         node.id = id;
         node.style.cssText =
            "position:absolute;border:0 none;margin:0;padding:0;" +
            "top:-10000px;left:-10000px;text-align:left;visibility:hidden";
        document.body.appendChild(node);
    }
    node.style.font = font;
    node.innerText = text || "aABCDEFGHIJKLMm";
    return { width: node.offsetWidth, height: node.offsetHeight };
}

// --- Math.Matrix2D subset --------------------------------
//
// Type:
//  Matrix2DArray = [m11, m12, m13,     [1, 0, 0,     [m[0], m[1], m[2],
//                   m21, m22, m23,      0, 1, 0,      m[3], m[4], m[5],
//                   m31, m32, m33]      x, y, 1]      m[6], m[7], m[8]]
//

function Matrix2D_scale(x,   // @arg Number: scale x
                        y,   // @arg Number: scale y
                        m) { // @arg Matrix2DArray: matrix
                             // @ret Matrix2DArray:
                             // @help: Math.Matrix2D.scale
                             // @desc: 2D Matrix scaleing
    // [x, 0, 0,
    //  0, y, 0,
    //  0, 0, 1]
    return [x * m[0], x * m[1],    0,
            y * m[3], y * m[4],    0,
                m[6],     m[7], m[8]];
}

function Matrix2D_rotate(angle, // @arg Number: radian
                         m) {   // @arg Matrix2DArray: matrix
                                // @ret Matrix2DArray:
                                // @help: Math.Matrix2D.rotate
                                // @desc: 2D Matrix multiply x rotate
    var c = Math.cos(angle),
        s = Math.sin(angle);

    // [ c, s, 0,
    //  -s, c, 0,
    //   0, 0, 1]
    return [ c * m[0] + s * m[3],  c * m[1] + s * m[4], 0,
            -s * m[0] + c * m[3], -s * m[1] + c * m[4], 0,
                            m[6],                 m[7], m[8]];
}

function Matrix2D_transform(m11, // @arg Number:
                            m12, // @arg Number:
                            m21, // @arg Number:
                            m22, // @arg Number:
                            dx,  // @arg Number:
                            dy,  // @arg Number:
                            m) { // @arg Matrix2DArray: matrix
                                 // @ret Matrix2DArray:
                                 // @help: Math.Matrix2D.transform
                                 // @desc: 2D Matrix multiply x transform
    // [m11, m12, 0,
    //  m21, m22, 0,
    //   dx,  dy, 1]
    return [m11 * m[0] + m12 * m[3], m11 * m[1] + m12 * m[4], 0,
            m21 * m[0] + m22 * m[3], m21 * m[1] + m22 * m[4], 0,
             dx * m[0] +  dy * m[3] + m[6],
             dx * m[1] +  dy * m[4] + m[7],
             dx * m[2] +  dy * m[5] + m[8]];
}

function Matrix2D_translate(x,   // @arg Number:
                            y,   // @arg Number:
                            m) { // @arg Matrix2DArray: matrix
                                 // @ret Matrix2DArray:
                                 // @help: Math.Matrix2D.translate
                                 // @desc: 2D Matrix multiply x translate
    // [1, 0, 0,
    //  0, 1, 0,
    //  x, y, 1]
    return [m[0], m[1], 0,
            m[3], m[4], 0,
            x * m[0] + y * m[3] + m[6],
            x * m[1] + y * m[4] + m[7],
            x * m[2] + y * m[5] + m[8]];
}

// --- Class Color subset ----------------------------------
function _bgcolor(node) {
    var color;

    while (node && node.currentStyle) {
        color = node.currentStyle.backgroundColor;
        if (color !== "transparent") {
            return _color(color);
        }
        node = node.parentNode;
    }
    return { hex: "#ffffff", a: 1 };
}

function _color(color) { // @arg ColorString:
                         // @ret Object: { hex, a }
    if (color.charAt(0) === "#") {
        return { hex: color, a: 1 };
    }
    color = color.toLowerCase();
    if (color in _colorNameCache) {
        return _colorNameCache[color];
    }
    // "rgba(255, 2, 2, 0.1)".split(/[\(\),]/) -> ["rgba", "255", " 2", " 2", " 0.1", ""]
    var ary = color.split(/[\(\),]/), a = 1, num;

    switch (ary[0]) {
    case "rgba":
        a = +ary[4];
    case "rgb":
        num = (+ary[1]) << 16 | (+ary[2]) << 8 | (+ary[3]);
        return { hex: "#" + (0x1000000 + num).toString(16).slice(1), a: a };
    }
    throw new TypeError("UNSUPPORTED: " + color);
}

function _namedColor(src) { // @arg String: "000000black,..."
    var ary = src.split(","), i = 0, iz = ary.length, code, name;

    for (; i < iz; ++i) {
        code = ary[i].slice(0, 6)
        name = ary[i].slice(6);
        _colorNameCache[name] = { hex: "#" + code, a: 1 };
    }
}

_namedColor("000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00" +
"yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,ff00ffmage" +
"nta,880000maroon,888800olive,008800green,008888teal,000088navy,880088purple" +
",696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,d3d3d3lightgrey,dcdcd" +
"cgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,778899lightslategray" +
",b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,4b0082indigo,483d8bda" +
"rkslateblue,6a5acdslateblue,7b68eemediumslateblue,9370dbmediumpurple,f8f8ff" +
"ghostwhite,00008bdarkblue,0000cdmediumblue,4169e1royalblue,1e90ffdodgerblue" +
",6495edcornflowerblue,87cefalightskyblue,add8e6lightblue,f0f8ffaliceblue,19" +
"1970midnightblue,00bfffdeepskyblue,87ceebskyblue,b0e0e6powderblue,2f4f4fdar" +
"kslategray,00ced1darkturquoise,afeeeepaleturquoise,f0ffffazure,008b8bdarkcy" +
"an,20b2aalightseagreen,48d1ccmediumturquoise,40e0d0turquoise,7fffd4aquamari" +
"ne,e0fffflightcyan,00fa9amediumspringgreen,7cfc00lawngreen,00ff7fspringgree" +
"n,7fff00chartreuse,adff2fgreenyellow,2e8b57seagreen,3cb371mediumseagreen,66" +
"cdaamediumaquamarine,98fb98palegreen,f5fffamintcream,006400darkgreen,228b22" +
"forestgreen,32cd32limegreen,90ee90lightgreen,f0fff0honeydew,556b2fdarkolive" +
"green,6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet" +
",8a2be2blueviolet,dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorch" +
"id,ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,c71585medium" +
"violetred,bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,ffe4e1mistyrose,ff1493de" +
"eppink,db7093palevioletred,e9967adarksalmon,ffb6c1lightpink,fff0f5lavenderb" +
"lush,cd5c5cindianred,f08080lightcoral,f4a460sandybrown,fff5eeseashell,dc143" +
"ccrimson,ff6347tomato,ff7f50coral,fa8072salmon,ffa07alightsalmon,ffdab9peac" +
"hpuff,ffffe0lightyellow,b22222firebrick,ff4500orangered,ff8c00darkorange,ff" +
"a500orange,ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown," +
"a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,f0e68ckhak" +
"i,fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,e" +
"ee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,ffe4c4bisqu" +
"e,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,f5deb3wheat,faebd7an" +
"tiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,fffff0ivory,a9a9a9da" +
"rkgrey,2f4f4fdarkslategrey,696969dimgrey,808080grey,d3d3d3lightgrey,778899l" +
"ightslategrey,708090slategrey,8b4513saddlebrown");

// --- character entity reference --------------------------
function _toEntity(str) { // @arg String:
                          // @ret String:
                          // @desc: encode String to HTML Entity

    // '&<>"' -> "&amp;&lt;&gt;&quot;"
    var hash = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

    return str.replace(/[&<>"]/g, function(code) {
        return hash[code];
    });
}

// --- boot ------------------------------------------------
function _IE_DOMContentLoaded() {
    try {
        if (document.readyState === "complete") {
            ;
        } else {
            (new Image()).doScroll(); // [!] throws
        }
        // --- ready ---
        try {
            CanvasVML.init();
            if (global.oncanvasready) {
                setTimeout(function() {
                    global.oncanvasready(document.getElementsByTagName("canvas"));
                }, 0);
            }
        } catch (O_o) {
            global.console ? global.console.log("" + O_o)
                           : alert("" + O_o);
        }

    } catch (err) {
        setTimeout(_IE_DOMContentLoaded, 16); // delay after 16ms
    }
}
_IE_DOMContentLoaded();

// --- export ----------------------------------------------
global["CanvasVMLRenderingContext2D"] = CanvasVMLRenderingContext2D;
global["Canvas"] = CanvasVML;           // global.Canvas(width, height, placeHolder)

CanvasVML.init = function() {           // global.Canvas.init();
    document.createElement("canvas");
    _initCanvasVMLStyle();
    _initCanvasVML();
};

})(this.self || global, this.document);
//}@canvasvml
