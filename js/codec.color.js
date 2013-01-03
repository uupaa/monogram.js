// codec.color.js: color and dict

//{@color
(function(global) {

// --- header ---------------------------------------------
function Color(color) { // @arg ColorString/RGBAColorArray/HSLAObject/HSVAObject:
    this.parse(color);
}
Color.Name = "Color";
Color.random = Color_random;            // Color.random(alpha:Number = 1):Color
Color.prototype = {
    constructor:Color,
    parse:      Color_parse,            // Color#parse(color:ColorString/RGBAColorArray/HSLAObject/HSVAObject):this
    gray:       Color_gray,             // Color#gray():this
    hsla:       Color_hsla,             // Color#hsla():HSLAObject - { h, s, l, a }
    hsva:       Color_hsva,             // Color#hsva():HSVAObject - { h, s, v, a }
    sepia:      Color_sepia,            // Color#sepia():this
    comple:     Color_comple,           // Color#comple():this
    arrange:    Color_arrange,          // Color#arrange(h:Number = 0, s:Number = 0, l:Number = 0):this
    toString:   Color_toString,         // Color#toString(type:String = "#rgb"):ColorString
    toFloatArray:Color_toFloatArray,    // Color#toFloatArray():NumberArray - [r, g, b, a]
};

// --- library scope vars ----------------------------------
var _namedColorDB = { transparent: [0, 0, 0, 0] },
    _PARSE_COLOR =
        /^(rgb|hsl|hsv)a?\(([\d\.]+)(%)?,([\d\.]+)(%)?,([\d\.]+)(%)?(?:,([\d\.]+))?\)$/;
        //[1]              [2]      [3]  [4]      [5]  [6]      [7]     [8]

// --- implement -------------------------------------------
function Color_parse(color) { // @arg ColorString/RGBAColorArray/HSLAObject/HSVAObject:
                              //    red   - Integer: 0 ~ 255
                              //    green - Integer: 0 ~ 255
                              //    blue  - Integer: 0 ~ 255
                              //    alpha - Number: 0.0 ~ 1.0
                              // @help: Color#parse
                              // @desc: parse Color
    if (typeof color === "string") {
        color = _parseColorString(color);
    } else if (Array.isArray(color)) {
        ;
    } else if (color.l) {
        color = _HSLA2RGBA(color.h, color.s, color.l, color.a);
    } else if (color.v) {
        color = _HSVA2RGBA(color.h, color.s, color.v, color.a);
    } else {
        throw new TypeError("BAD_ARG");
    }

    var r = color[0] || 0,
        g = color[1] || 0,
        b = color[2] || 0,
        a = color[3] || 0;

    this.r = r = (r < 0 ? 0 : r > 255 ? 255 : r) | 0;
    this.g = g = (g < 0 ? 0 : g > 255 ? 255 : g) | 0;
    this.b = b = (b < 0 ? 0 : b > 255 ? 255 : b) | 0;
    this.a = a =  a < 0 ? 0 : a > 1 ? 1 : a;
//  this.num = r << 16 | g << 8 | b;
}

function Color_toString(type) { // @arg String(= "#rgb"): result type.
                                //      type = "#rgb"  is return "#rrggbb"
                                //      type = "#argb" is return "#aarrggbb"
                                //      type = "rgb"   is return "rgb(r,g,b)"
                                //      type = "rgba"  is return "rgba(0,0,0,0)"
                                // @ret ColorString:
    var r = this.r, g = this.g, b = this.b, a = this.a,
        num = r << 16 | g << 8 | b;

    switch (type || "#rgb") {
    case "#rgb":    return "#" + (0x001000000 + num).toString(16).slice(1);
    case "#argb":   return "#" + (0x100000000 + num + ((a * 255) << 24)).
                                                      toString(16).slice(-8);
    case "rgb":     return "rgb(" + r + "," + g + "," + b + ")";
    }
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function Color_gray() { // @ret this:
    return new Color([this.g, this.g, this.g, this.a]);
}

function Color_hsla() { // @ret Object: { h, s, l, a }
    return _RGBA2HSLA(this.r, this.g, this.b, this.a);
}

function Color_hsva() { // @ret Object: { h, s, v, a }
    return _RGBA2HSVA(this.r, this.g, this.b, this.a);
}

function Color_sepia() { // @ret this:
    var y = 0.2990 * this.r + 0.5870 * this.g + 0.1140 * this.b,
        u = -0.091, v = 0.056;

    return new Color([(y + 1.4026 * v) * 1.2,
                       y - 0.3444 * u - 0.7114 * v,
                      (y + 1.7330 * u) * 0.8, this.a]);
}

function Color_comple() { // @ret this:
    return new Color([this.r ^ 255, this.g ^ 255, this.b ^ 255, this.a]);
}

function Color_arrange(h,   // @arg Number(= 0): Hue        (-360 ~ 360). absolure value
                       s,   // @arg Number(= 0): Saturation (-100 ~ 100). relative value
                       l) { // @arg Number(= 0): Lightness  (-100 ~ 100). relative value
                            // @ret this:
                            // @desc: arrangemented color(Hue, Saturation and Lightness)
    var rv = _RGBA2HSLA(this.r, this.g, this.b, this.a);

    rv.h += h;
    rv.h = (rv.h > 360) ? rv.h - 360 : (rv.h < 0) ? rv.h + 360 : rv.h;
    rv.s += s;
    rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
    rv.l += l;
    rv.l = (rv.l > 100) ? 100 : (rv.l < 0) ? 0 : rv.l;
    return _HSLA2RGBA(rv.h, rv.s, rv.l, rv.a);
}

function Color_toFloatArray() { // @ret FloatColorArray: [r, g, b, a]
                                //   r, g, b, a - Number: 0.0 - 1.0
    return [
        ((this.r / 2.555 + 0.5) | 0) / 100, // 0 ~ 1
        ((this.g / 2.555 + 0.5) | 0) / 100, // 0 ~ 1
        ((this.b / 2.555 + 0.5) | 0) / 100, // 0 ~ 1
        this.a
    ];
}

function Color_random(alpha) { // @arg Number(= 1): alpha ratio
                               // @ret this:
                               // @desc: create random color

    var n = (Math.random() * 0xffffff) | 0;

    return new Color([n >> 16, (n >> 8) & 255, n & 255,
                      alpha === 0 ? 0 : (alpha || 1)]);
}
function _parseColorString(str) { // @arg ColorString:
                                  // @ret RGBAColorArray: [r, g, b, a]
                                  // @inner: ColorString to ColorArray
    var str = str.toLowerCase();

    if (str === "transparent") {
        return [0, 0, 0, 0];
    }
    if (str in _namedColorDB) {
        return _namedColorDB[str];
    }
    if (this.charAt(0) === "#") {
        return _parseHexColorCode(str);
    }
    return _parseColorFunction(str);
}

function _parseHexColorCode(str) { // @arg String: "#rgb", "#rrggbb", "#aarrggbb"
                                   // @ret RGBAColorArray: [r, g, b, a]
    var ary, num;

    switch (str.length) {
    case 4: // #rgb
        ary = str.split("");
        num = parseInt(ary[1] + ary[1] +
                       ary[2] + ary[2] +
                       ary[3] + ary[3], 16) || 0; // NaN -> 0
        return [num >> 16, (num >> 8) & 255, num & 255, 1];
    case 7: // #rrggbb
        num = parseInt(str.slice(1), 16) || 0;
        return [num >> 16, (num >> 8) & 255, num & 255, 1];
    case 9: // #aarrggbb
        num = parseInt(str.slice(1), 16) || 0;
        return [ (num >> 16) & 255,
                 (num >> 8)  & 255,
                  num        & 255,
                ((num >> 24) & 255) / 255];
    }
    return [0, 0, 0, 0];
}

function _parseColorFunction(str) { // @arg String: "rgba(r,g,b,a)", "hsla(,,,)", "hsva(,,,)"
                                    // @ret RGBAColorArray: [r, g, b, a]
    var match, num = 0, r = 0, g = 0, b = 0, a = 0;

    match = _PARSE_COLOR.exec(str);
    if (match) {
        num = match[1] === "rgb" ? 2.555 : 1;
        r = match[3] ? match[2] * num : +match[2];
        g = match[5] ? match[4] * num : +match[4];
        b = match[7] ? match[6] * num : +match[6];
        a = match[8] ? parseFloat(match[8]) : 1;

        if (num === 1) { // HSLA or HSVA
            return match[1] === "hsl" ? _hslaToColorArray(r, g, b, a)
                                      : _hsvaToColorArray(r, g, b, a);
        }
    }
    return [r, g, b, a];
}

function _hslaToColorArray(h, s, l, a) { // @ret RGBAColorArray:
                                         // @inner: HSLA to RGBAColorArray
                                         // ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
    h = (h === 360) ? 0 : h;
    s = s / 100;
    l = l / 100;

    var r = 0, g = 0, b = 0, s1, s2, l1, l2;

    if (h < 120) {
        r = (120 - h) / 60, g = h / 60;
    } else if (h < 240) {
        g = (240 - h) / 60, b = (h - 120) / 60;
    } else {
        r = (h - 240) / 60, b = (360 - h) / 60;
    }
    s1 = 1 - s;
    s2 = s * 2;

    r = s2 * (r > 1 ? 1 : r) + s1;
    g = s2 * (g > 1 ? 1 : g) + s1;
    b = s2 * (b > 1 ? 1 : b) + s1;

    if (l < 0.5) {
        r *= l, g *= l, b *= l;
    } else {
        l1 = 1 - l;
        l2 = l * 2 - 1;
        r = l1 * r + l2;
        g = l1 * g + l2;
        b = l1 * b + l2;
    }
    return [r * 255 + 0.5, g * 255 + 0.5, b * 255 + 0.5, a];
}

function _hsvaToColorArray(h, s, v, a) { // @ret RGBAColorArray:
                                         // @inner: HSVA to RGBAColorArray
                                         // ( h: 0-360, s: 0-100, v: 0-100, a: alpha )
    h = (h >= 360) ? 0 : h;
    s = s * 0.01;
    v = v * 2.55;

    var r = 0, g = 0, b = 0, f, p, q, t, w;

    h = h / 60;
    f = h - (h | 0);

    if (s) {
        p = (((1 - s)             * v) + 0.5) | 0;
        q = (((1 - (s * f))       * v) + 0.5) | 0;
        t = (((1 - (s * (1 - f))) * v) + 0.5) | 0;
        w = (                       v  + 0.5) | 0;

        switch (h | 0) {
        case 0: r = w; g = t; b = p; break;
        case 1: r = q; g = w; b = p; break;
        case 2: r = p; g = w; b = t; break;
        case 3: r = p; g = q; b = w; break;
        case 4: r = t; g = p; b = w; break;
        case 5: r = w; g = p; b = q;
        }
    } else {
        r = g = b = (v + 0.5) | 0;
    }
    return [r * 255 + 0.5, g * 255 + 0.5, b * 255 + 0.5, a];
}

function _RGBA2HSVA(r, g, b, a) { // @ret Object: { h, s, v, a }
    r = r / 255;
    g = g / 255;
    b = b / 255;

    var max = Math.max(r, g, b),
        diff = max - Math.min(r, g, b),
        h = 0,
        s = max ? Math.round(diff / max * 100) : 0,
        v = Math.round(max * 100);

    if (!s) {
        return { h: 0, s: 0, v: v, a: a };
    }
    h = (r === max) ? ((g - b) * 60 / diff) :
        (g === max) ? ((b - r) * 60 / diff + 120)
                    : ((r - g) * 60 / diff + 240);
    // HSVAObject( { h:360, s:100, v:100, a:1.0 } )
    return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: a };
}

function _HSVA2RGBA(h, s, v, a) { // @ret RGBAColorArray: [r, g, b, a]
    h = (h === 360) ? 0 : h;
    s = s / 100;
    v = v / 100;

    var h60 = h / 60,
        matrix = h60 | 0,
        f = h60 - matrix;

    if (!s) {
        h = Math.round(v * 255);
        return [h, h, h, a];
    }

    var p = Math.round((1 - s) * v * 255),
        q = Math.round((1 - (s * f)) * v * 255),
        t = Math.round((1 - (s * (1 - f))) * v * 255),
        w = Math.round(v * 255);

    switch (matrix) {
    case 0: return [w, t, p, a];
    case 1: return [q, w, p, a];
    case 2: return [p, w, t, a];
    case 3: return [p, q, w, a];
    case 4: return [t, p, w, a];
    case 5: return [w, p, q, a];
    }
    return [0, 0, 0, a];
}

function _RGBA2HSLA(r, g, b, a) { // @ret Object: { h, s, l, a }
    r = r / 255;
    g = g / 255;
    b = b / 255;

    var max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        diff = max - min,
        h = 0, s = 0, l = (min + max) / 2;

    if (l > 0 && l < 1) {
        s = diff / (l < 0.5 ? l * 2 : 2 - (l * 2));
    }
    if (diff > 0) {
        if (max === r && max !== g) {
            h += (g - b) / diff;
        } else if (max === g && max !== b) {
            h += (b - r) / diff + 2;
        } else if (max === b && max !== r) {
            h += (r - g) / diff + 4;
        }
        h *= 60;
    }
    return { h: h, s: Math.round(s * 100), l: Math.round(l * 100), a: a };
}

function _HSLA2RGBA(h, s, l, a) { // h: 0-360, s: 0-100, l: 0-100
    h = (h === 360) ? 0 : h;
    s = s / 100;
    l = l / 100;

    var r, g, b, s1, s2, l1, l2;

    if (h < 120) {
        r = (120 - h) / 60;
        g = h / 60;
        b = 0;
    } else if (h < 240) {
        r = 0;
        g = (240 - h) / 60;
        b = (h - 120) / 60;
    } else {
        r = (h - 240) / 60;
        g = 0;
        b = (360 - h) / 60;
    }
    s1 = 1 - s;
    s2 = s * 2;

    r = s2 * (r > 1 ? 1 : r) + s1;
    g = s2 * (g > 1 ? 1 : g) + s1;
    b = s2 * (b > 1 ? 1 : b) + s1;

    if (l < 0.5) {
        r *= l, g *= l, b *= l;
    } else {
        l1 = 1 - l;
        l2 = l * 2 - 1;
        r = l1 * r + l2;
        g = l1 * g + l2;
        b = l1 * b + l2;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
}

// --- build -----------------------------------------------
function _initColor(src) { // @arg String: "000000black,..."
    var ary = src.split(","), i = 0, iz = ary.length, v, n;

    for (; i < iz; ++i) {
        v = ary[i];
        n = parseInt(v.slice(0, 6), 16);
        _namedColorDB[v.slice(6)] = [n >> 16, (n >> 8) & 255, n & 255, 1];
    }
}

// preset W3C Named Color
_initColor("000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00" +
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

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Color: Color };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Color = Color;

})(this.self || global);
//}@color

