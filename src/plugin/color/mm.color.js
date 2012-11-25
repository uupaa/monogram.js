//{@color
(function(global, // @param GlobalObject:
          mm) {   // @param LibraryRootObject:

// --- export ---
mm.Class.Color = Color;
mm.color = Object.mixin(mm_color, {
    addIf   : mm_color_addIf,
    random  : mm_color_random,
    cache   : Object.mixin(mm_color_cache, {
        clear: mm_color_cache_clear
    })
});
/*
mm.color = mm_color;
mm.color.addIf = mm_color_addIf;
mm.color.random = mm_color_random;
mm.color.cache = mm_color_cache;
mm.color.cache.clear = mm_color_cache_clear;
 */

// Color#hsla():HSLAHash - { h, s, l, a }
// Color#hsva():HSVAHash - { h, s, v, a }
// Color#gray():Color
// Color#sepia():Color
// Color#comple():Color
// Color#arrange(h:Number = 0, s:Number = 0, l:Number = 0):Color
// Color#floatArray(withoutAlpha:Boolean = false):FloatColorArray - [ 0~1, 0~1, 0~1 ] or [ 0~1, 0~1, 0~1, 0~1 ]

// --- local vars ---
var _parseColor = /^(rgb|hsl|hsv)a?\(([\d\.]+)(%)?,([\d\.]+)(%)?,([\d\.]+)(%)?(?:,([\d\.]+))?\)$/,
    _namedColorDB = { // WebNamedColor and UserNamedColor db
        transparent: [0, 0, 0, 0]
    },
    _cache = {
        db: {},         // cache db { "#123": [r,g,b,a], ... }
        size: 0,        // current cache size
        autogc: true,   // auto gc
        maxsize: 4096,  // cache max size
        useCache: true  // use cache
    };


// mm.color - Color Factory
function mm_color(color) { // @param NamedColorString/RGBAHash/HSLAHash/HSVAHash/ColorArray/Color/Number(= 0):
                           // @return Color:
    if (!color) {
        color = 0;
    }
    if (typeof color === "number") { // mm.color(0xffffff) -> rgba(255,255,255,1)
        return new Color([(color >> 16) & 255,
                          (color >>  8) & 255,
                           color        & 255, 1]);
    }

    var cached;

    if (typeof color === "string") { // mm.color("transparent") -> rgba(0,0,0,0)
        color = color.toLowerCase().replace(/\s+/g, ""); // normalize

        if (_cache.useCache) {
            cached = _cache.db[color] || _namedColorDB[color];
            if (cached) { // found cache
                return new Color(cached);
            }
            if (_cache.autogc) {
                if (++_cache.size > _cache.maxsize) {
                    mm_color_cache_clear();
                }
            }
            return new Color(_cache.db[color] = _parseColorString(color));
        }
        return new Color(_namedColorDB[color] || _parseColorString(color));
    }
    if ("r" in color) { // mm.color({ r: 0, g: 0, b: 0, a: 0 }) -> rgba(0,0,0,0)
        return new Color([color.r, color.g, color.b,
                          "a" in color ? color.a : 1]);
    }
    if ("l" in color) { // mm.color({ h,s,l,a }) -> rgba()
        return new Color(_hslaToColorArray(color.h, color.s, color.l,
                                           "a" in color ? color.a : 1));
    }
    if ("v" in color) { // mm.color({ h,s,v,a }) -> rgba()
        return new Color(_hsvaToColorArray(color.h, color.s, color.v,
                                           "a" in color ? color.a : 1));
    }
    if (color instanceof Color) {
        return new Color(color.array);
    }
    return new Color(color); // mm.color(mm.color().array) -> rgba(0,0,0,0)
}


// Color - constructor (mm.Class.Color)
function Color(color) { // @param ColorArray: [red, green, blue, alpha]
                        //     red:   from 0 to 255
                        //     green: from 0 to 255
                        //     blue:  from 0 to 255
                        //     alpha: from 0.0 to 1.0
    var r = color[0],
        g = color[1],
        b = color[2],
        a = color[3] !== void 0 ? color[3] : 1,
        num, hex, rgba;

    r    = (r < 0 ? 0 : r > 255 ? 255 : r) | 0;
    g    = (g < 0 ? 0 : g > 255 ? 255 : g) | 0;
    b    = (b < 0 ? 0 : b > 255 ? 255 : b) | 0;
    a    =  a < 0 ? 0 : a >   1 ?   1 : a;
    num  = (r << 16) + (g << 8) + b;
    hex  = "#" + (num + 0x1000000).toString(16).slice(1);
    rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";

    if (Object.defineProperties) {
        Object.defineProperties(this, {
            r:    { value: r },
            g:    { value: g },
            b:    { value: b },
            a:    { value: a },
            hex:  { value: hex  },
            num:  { value: num  },
            rgba: { value: rgba },
            array:{ value: [r, g, b, a] }
        });
    } else {
        this.r    = r;
        this.g    = g;
        this.b    = b;
        this.a    = a;
        this.hex  = hex;
        this.num  = num;
        this.rgba = rgba;
        this.array= [r, g, b, a];
    }
}

Color.prototype = {
    toString:   Color_toString,
    hsla:       Color_hsla,
//[TODO][IMPL]
//  hsva:       Color_hsva,
    gray:       Color_gray,
    sepia:      Color_sepia,
    comple:     Color_comple,
    arrange:    Color_arrange,
    floatArray: Color_floatArray
};

// Color#toString
function Color_toString(type) { // @param String(= "auto"): "#", "hex", "ahex", "rgb", "rgba"
                                // @return String:
                                //      type = "auto" is return "rgba(r,g,b,a)" (in Modan Browser)
                                //      type = "auto" is return "#rrggbb" (in IE6, IE7, IE8)
                                //      type = "#"    is return "#rrggbb"
                                //      type = "hex"  is return "#rrggbb"
                                //      type = "ahex" is return "#aarrggbb"
                                //      type = "rgb"  is return "rgb(r,g,b)"
                                //      type = "rgba" is return "rgba(0,0,0,0)"
    var num;

    switch (type || "auto") {
    case "#":
    case "hex":  return this.hex;
    case "ahex": num = ((this.a * 255) << 24) + this.num + 0x100000000;
                 return "#" + num.toString(16).slice(-8);
    case "rgb":  return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    case "rgba": return this.rgba;
    }
    // "auto"

    if (mm.env && mm.env.ie678) {
        return this.hex; // -> "#ffffff" in IE 6, IE 7, IE 8
    }
    return this.rgba; // -> "rgba(0,0,0,0)"
}

// Color#hsla
function Color_hsla() { // @return HSLAHash: { h, s, l, a }
    return _rgbaToHsla(this.r, this.g, this.b, this.a);
}

/*
// Color#hsva
function Color_hsva() { // @return HSVAHash: { h, s, v, a }
//[TODO][IMPL]
//  return _rgba2hsva(this.r, this.g, this.b, this.a);
}
 */

// Color#gray
function Color_gray() { // @return Color:
    return new Color([this.g, this.g, this.g, this.a]);
}

// Color#sepia
function Color_sepia() { // @return Color:
    // Convert YUV
    var y =  0.2990 * this.r + 0.5870 * this.g + 0.1140 * this.b,
        u = -0.091,
        v =  0.056;

    return new Color([(y + 1.4026 * v) * 1.2,
                       y - 0.3444 * u - 0.7114 * v,
                      (y + 1.7330 * u) * 0.8, this.a]);
}

// Color#comple
function Color_comple() { // @return Color:
    return new Color([this.r ^ 255, this.g ^ 255,
                      this.b ^ 255, this.a]);
}

// Color#arrange - arrangemented color(Hue, Saturation and Lightness)
function Color_arrange(h,   // @param Number(= 0): Hue        (-360 ~ 360), absolure value.
                       s,   // @param Number(= 0): Saturation (-100 ~ 100), relative value.
                       l) { // @param Number(= 0): Lightness  (-100 ~ 100), relative value.
                            // @return Color:
    var rv = _rgbaToHsla(this.r, this.g, this.b, this.a);

    rv.h += h;
    rv.h = (rv.h > 360) ? rv.h - 360
                        : (rv.h < 0) ? rv.h + 360
                                     : rv.h;
    rv.s += s;
    rv.s = (rv.s > 100) ? 100
                        : (rv.s < 0) ? 0
                                     : rv.s;
    rv.l += l;
    rv.l = (rv.l > 100) ? 100
                        : (rv.l < 0) ? 0
                                     : rv.l;
    return mm.color(rv);
}

// Color#floatArray - get 0.0 ~ 1.0 color values `` 0.0 ～ 1.0 までの値に変換して R,G,B,A の配列を返します
function Color_floatArray(withoutAlpha) { // @param Boolean(= false): true without alpha
                                          // @return FloatColorArray: [R,G,B,A] or [R,G,B]
    var rv = [
            ((this.r / 2.55 + 0.5) | 0) / 100, // 0 ~ 1
            ((this.g / 2.55 + 0.5) | 0) / 100, // 0 ~ 1
            ((this.b / 2.55 + 0.5) | 0) / 100, // 0 ~ 1
            this.a
        ];

    withoutAlpha && rv.pop();
    return rv;
}

// inner -
function _parseColorString(str) { // @param String: normalized colorName
                                  // @return ColorArray: [r, g, b, a]
    var match, num, r = 0, g = 0, b = 0, a = 0, ary;

    if (str.charAt(0) === "#") {
        switch (str.length) {
        case 4: // #RGB
            ary = str.split("");
            num = parseInt(ary[1] + ary[1] +
                           ary[2] + ary[2] +
                           ary[3] + ary[3], 16) || 0; // NaN -> 0
            return [num >> 16, (num >> 8) & 255, num & 255, 1];
        case 7: // #RRGGBB
            num = parseInt(str.slice(1), 16) || 0;
            return [num >> 16, (num >> 8) & 255, num & 255, 1];
        case 9: // #AARRGGBB
            num = parseInt(str.slice(1), 16) || 0;
            return [ (num >> 16) & 255,
                     (num >> 8)  & 255,
                      num        & 255,
                    ((num >> 24) & 255) / 255];
        }
        return [0, 0, 0, 0];
    }
    match = _parseColor.exec(str);
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

// mm.color.cache - config cache and get current state
function mm_color_cache(useCache,  // @param Boolean(= undefined): use cache
                        autogc,    // @param Boolean(= undefined): use auto gc
                        maxsize) { // @param Number(= undefined): set max size
                                   // @return Hash: current state. { use, size, autogc, maxsize }
    autogc   == null || (_cache.autogc = autogc);
    maxsize  == null || (_cache.maxsize = maxsize);
    useCache == null || (_cache.useCache = useCache);

    // return current state
    return { useCache: _cache.useCache, size: _cache.size,
             autogc: _cache.autogc, maxsize: _cache.maxsize };
}

// mm.color.cache.cache - clear cache
function mm_color_cache_clear() {
    _cache.db = {};
    _cache.size = 0;
}

// mm.color.random - create random color
function mm_color_random(alpha) { // @param Number(= 1): alpha ratio
                                  // @return Color:

    var n = (Math.random() * 0xffffff) | 0;

    return new Color([n >> 16, (n >> 8) & 255, n & 255,
                      alpha === 0 ? 0 : (alpha || 1)]);
}

// mm.color.addIf - add user color (not override)
function mm_color_addIf(userColor) { // @param Hash: { name: value, ... }
    var name, value, _db = _namedColorDB;

    for (name in userColor) {
        value = userColor[name];
        name = name.toLowerCase().trim();
        name in _db || (_db[name] = mm.color(value).array); // not override
    }
}

// inner - HSLA to ColorArray - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
function _hslaToColorArray(h, s, l, a) { // @return ColorArray:

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

// inner - HSVA to ColorArray - ( h: 0-360, s: 0-100, v: 0-100, a: alpha )
function _hsvaToColorArray(h, s, v, a) { // @return ColorArray:

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

// inner - RGBA to HSLAHash
function _rgbaToHsla(r, g, b, a) { // @return HSLAHash: { h, s, l, a }

    r = r / 255;
    g = g / 255;
    b = b / 255;

    var max = (r > g && r > b) ? r : g > b ? g : b,
        min = (r < g && r < b) ? r : g < b ? g : b,
        diff = max - min,
        h = 0, s = 0, l = (min + max) * 0.5;

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
    return { h: h, s: (s * 100 + 0.5) | 0, l: (l * 100 + 0.5) | 0, a: a };
}

// --- initialize ---
// inner - init color db
function _initDB(src) { // @param String: "000000black,..."
    var ary = src.split(","), i = 0, iz = ary.length, v, n;

    for (; i < iz; ++i) {
        v = ary[i];
        n = parseInt(v.slice(0, 6), 16);
        _namedColorDB[v.slice(6)] = [n >> 16, (n >> 8) & 255, n & 255, 1];
    }
}

// add W3C Named Color
_initDB("000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00" +
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

})(this, this.mm || this);
//}@color
