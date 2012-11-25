//{@color
(function(lib) {

function Color(r,   // @arg Integer: red   (0 ~ 255)
               g,   // @arg Integer: green (0 ~ 255)
               b,   // @arg Integer: blue  (0 ~ 255)
               a) { // @arg Number(= 0): alpha (0.0 ~ 1.0)
                    // @ret this:
                    // @desc: Color constructor
    a = a || 0;

    this.r = r = (r < 0 ? 0 : r > 255 ? 255 : r) | 0;
    this.g = g = (g < 0 ? 0 : g > 255 ? 255 : g) | 0;
    this.b = b = (b < 0 ? 0 : b > 255 ? 255 : b) | 0;
    this.a = a = a < 0 ? 0 : a > 1 ? 1 : a;
    this.num = r << 16 | g << 8 | b;
    this.hex = "#" + (0x1000000 + this.num).toString(16).slice(1); // #ffffff
    this.rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
Color.prototype = {
    toString:   function() { // @ret String: "#000000"
                    return this.hex;
                },
    argb:       function() { // @ret String: "ffffffff"
                    return (((this.a * 255) & 0xff) + 0x100)
                           _num2hh[this.r] + _num2hh[this.g] + _num2hh[this.b];
                },
    hsla:       function() { // @ret Hash: { h, s, l, a }
                    return rgba2hsla(this.r, this.g, this.b, this.a);
                },
    hsva:       function() { // @ret Hash: { h, s, v, a }
                    return rgba2hsva(this.r, this.g, this.b, this.a);
                },
    gray:       function() { // @ret Color:
                    return new Color(this.g, this.g, this.g, this.a);
                },
    sepia:      function() { // @ret Color:
                    var y = 0.2990 * this.r + 0.5870 * this.g + 0.1140 * this.b,
                        u = -0.091, v = 0.056;

                    return new Color((y + 1.4026 * v) * 1.2,
                                      y - 0.3444 * u - 0.7114 * v,
                                     (y + 1.7330 * u) * 0.8, this.a);
                },
    comple:     function() { // @ret Color:
                    return new Color(this.r ^ 255, this.g ^ 255,
                                     this.b ^ 255, this.a);
                },
    arrange:    // Color.arrange - arrangemented color(Hue, Saturation and Lightness)
                //    Hue is absolure value,
                //    Saturation and Lightness is relative value.
                function(h,   // @arg Number(= 0): Hue        (-360 ~ 360)
                         s,   // @arg Number(= 0): Saturation (-100 ~ 100)
                         l) { // @arg Number(= 0): Lightness  (-100 ~ 100)
                              // @ret Color:
                    var rv = rgba2hsla(this.r, this.g, this.b, this.a);

                    rv.h += h;
                    rv.h = (rv.h > 360) ? rv.h - 360 : (rv.h < 0) ? rv.h + 360 : rv.h;
                    rv.s += s;
                    rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
                    rv.l += l;
                    rv.l = (rv.l > 100) ? 100 : (rv.l < 0) ? 0 : rv.l;
                    return hsla2color(rv.h, rv.s, rv.l, rv.a);
                }
};
uuClass.Color = Color; // uu.Class.Color

// uu.color - parse color
function uucolor(expr) { // @parem Color/RGBAHash/HSLAHash/HSVAHash/String: "black", "#fff", "rgba(0,0,0,0)"
                         // @ret Color:
    //  [1][Color]                               uu.color(Color)               -> Color
    //  [2][RGBAHash/HSLAHash/HSVAHash to Color] uu.color({ h:0,s:0,l:0,a:1 }) -> Color
    //  [3][W3CNamedColor to Color]              uu.color("black")             -> Color
    //  [4]["#000..." to Color]                  uu.color("#000")              -> Color
    //  [5]["rgba(,,,,)" to Color]               uu.color("rgba(0,0,0,1)")     -> Color
    //  [6]["hsla(,,,,)" to Color]               uu.color("hsla(360,1%,1%,1)") -> Color
    //  [7]["hsva(,,,,)" to Color]               uu.color("hsva(360,1%,1%,1)") -> Color

    var rv, m, n, r, g, b, a = 1;

    if (expr instanceof Color) { // [1] through
        return expr;
    }
    if (typeof expr !== _string) { // [2] convert HSLAHash / RGBAHash to Color
        return "l" in expr ? hsla2color(expr.h, expr.s, expr.l, expr.a) // HSLAHash
             : "v" in expr ? hsva2color(expr.h, expr.s, expr.v, expr.a) // HSVAHash
                           : new Color(expr.r, expr.g, expr.b, expr.a); // RGBAHash
    }
    // "Red" -> "red"
    expr = expr[_toLowerCase]();

    // [3] W3CNamedColor or cached Color?
    rv = uucolor.db[expr] || uucolor.cache[expr];
    if (rv) {
        return rv;
    }

    // parse
    if (expr.length < 8 && (m = uucolor.rex.hex.exec(expr)) ) { // [4] #fff or #ffffff
        n = expr.length > 4 ? parseInt(m[1], 16)
                            : (m = m[1].split(""),
                               parseInt(m[0]+m[0] + m[1]+m[1] + m[2]+m[2], 16));
        r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    } else {
        m = uucolor.rex.rgba.exec(uustringtrim(expr, "")); // [5][6][7]
        if (m) {
            n = m[1] === "rgb" ? 2.555 : 1;
            r = m[3] ? m[2] * n : m[2];
            g = m[5] ? m[4] * n : m[4];
            b = m[7] ? m[6] * n : m[6];
            a = m[8] ? parseFloat(m[8]) : 1;
            if (n === 1) {
                return m[1] === "hsl" ? hsla2color(r, g, b, a)
                                      : hsva2color(r, g, b, a);
            }
        }
    }
    // add cache
    return uucolor.cache[expr] = new Color(r, g, b, a);
}
uucolor.db = { transparent: new Color(0, 0, 0, 0) };
uucolor.cache = {}; // { "#123": Color, ... }
uucolor.rex = {
//  hex: /^#([\da-f]{3}(?:[\da-f]{3})?)$/, // #fff or #ffffff
    hex: /^#([\da-f]{3}([\da-f]{3})?)$/, // #fff or #ffffff [OPERA10+] bugfix
    rgba: /^(rgb|hsl|hsv)a?\(([\d\.]+)(%)?,([\d\.]+)(%)?,([\d\.]+)(%)?(?:,([\d\.]+))?\)$/,
    trim: /\s+/g
};

// uu.color.random - create random color
function uucolorrandom(a) { // @arg Number(= 1): alpha
                            // @ret Color:
    var n = (Math.random() * 0xffffff) | 0;

    return new Color(n >> 16, (n >> 8) & 255, n & 255, a === 0 ? 0 : (a || 1));
}

// uu.color.add
function uucoloradd(src) { // @arg String: "000000black,..."
    var ary = src.split(","), i = 0, iz = ary.length, v, n;

    for (; i < iz; ++i) {
        v = ary[i];
        n = parseInt(v.slice(0, 6), 16);
        uucolor.db[v.slice(6)] = new Color(n >> 16, (n >> 8) & 255, n & 255, 1);
    }
}

// inner - RGBA to HSLAHash
function rgba2hsla(r, g, b, a) { // @ret Hash: { h, s, l, a }
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

// inner - RGBA to HSVAHash
function rgba2hsva(r, g, b, a) { // @ret Hash: { h, s, v, a }
    r = r / 255;
    g = g / 255;
    b = b / 255;

    var max = (r > g && r > b) ? r : g > b ? g : b,
        min = (r < g && r < b) ? r : g < b ? g : b,
        diff = max - min,
        h = 0,
        s = max ? ((diff / max * 100) + 0.5) | 0 : 0,
        v = ((max * 100) + 0.5) | 0;

    if (s) {
        h = (r === max) ? ((g - b) * 60 / diff) :
            (g === max) ? ((b - r) * 60 / diff + 120)
                        : ((r - g) * 60 / diff + 240);
    }
    return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: a };
}

// inner - HSLA to Color - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
function hsla2color(h, s, l, a) { // @ret Color:
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
    return new Color(r * 255 + 0.5, g * 255 + 0.5, b * 255 + 0.5, a);
}

// inner - HSVA to Color - ( h: 0-360, s: 0-100, v: 0-100, a: alpha )
function hsva2color(h, s, v, a) { // @ret Color:
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
    return new Color(r * 255 + 0.5, g * 255 + 0.5, b * 255 + 0.5, a);
}

// --- initialize ---
//{@colordict
// add W3C Named Color
uucoloradd("000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00" +
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
//}@colordict
//}@color


})(this.mm ?  || this.self || global); // mm.Color
