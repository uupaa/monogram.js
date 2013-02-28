// codec.utf.js: UTF16 <-> UTF8 convert methods
// @see: https://gist.github.com/4185267

/*
    Usage:

        var UTF8  = require("codec.utf").Monogram.UTF8;
        var UTF16 = require("codec.utf").Monogram.UTF16;

        // --- UTF8Array/String -> UTF16Array/String ---
        new UTF8([]).toUTF16Array();    // UTF8Array        -> UTF16Array
        new UTF8("").toUTF16Array();    // UTF8BinaryString -> UTF16Array

        new UTF8([]).toUTF16String();   // UTF8Array        -> UTF16String
        new UTF8("").toUTF16String();   // UTF8BinaryString -> UTF16String

        // --- UTF16Array/String -> UTF8Array ---
        new UTF16([]).toUTF8Array();    // UTF16Array       -> UTF8Array
        new UTF16("").toUTF8Array();    // UTF16String      -> UTF8Array

        // --- UTF16Array/String -> UTF16Array ---
        new UTF16([]).toUTF16Array();   // UTF16Array       -> UTF16Array
        new UTF16("").toUTF16Array();   // UTF16String      -> UTF16Array
            UTF16.stoa(str);            // UTF16String      -> UTF16Array
            UTF16.atos(ary);            // UTF16Array       -> UTF16String
            UTF16.toArray(str);         // UTF16String      -> UTF16Array
            UTF16.fromArray(ary);       // UTF16Array       -> UTF16String

 */
(function(global) {

// --- header ---------------------------------------------
function UTF8(source) { this._source = source; }
UTF8.name = "UTF8";
UTF8.prototype.toUTF16Array  = UTF8_toUTF16Array;   // #toUTF16Array():UTF16Array
UTF8.prototype.toUTF16String = UTF8_toUTF16String;  // #toUTF16String():UTF16String

function UTF16(source) { this._source = source; }
UTF16.name = "UTF16";
UTF16.stoa      = stoa;                             // stoa(str:String, filter:Integer = 0xffff):UTF16Array
UTF16.atos      = atos;                             // atos(ary:UTF16Array):UTF16String
UTF16.toArray   = stoa;                             // toArray(str:String, filter:Integer = 0xffff):UTF16Array
UTF16.fromArray = atos;                             // fromArray(ary:UTF16Array):UTF16String
UTF16.prototype.toUTF8Array  = UTF16_toUTF8Array;   // #toUTF8Array():UTF8Array
UTF16.prototype.toUTF16Array = UTF16_toUTF16Array;  // #toUTF16Array():UTF16Array

// --- library scope vars ----------------------------------
//var _bin2num = {}; // BinaryStringToNumber hash table. { "\00": 0, ... "\ff": 255 }

// --- implement -------------------------------------------
function UTF8_toUTF16Array(source) {
    source = source || this._source;
    return Array.isArray(source) ? _8to16(source)
                                 : _8to16(stoa(source, 0xff));
}

function UTF8_toUTF16String(source) {
    source = source || this._source;
    return Array.isArray(source) ? atos(_8to16(source))
                                 : atos(_8to16(stoa(source, 0xff)));
}

function UTF16_toUTF8Array(source) {
    source = source || this._source;
    return Array.isArray(source) ? _16to8(source)
                                 : _16to8(stoa(source));
}

function UTF16_toUTF16Array(source) {
    source = source || this._source;
    return Array.isArray(source) ? source
                                 : stoa(source);
}

function atos(ary) { // @arg UTF16Array:
                     // @ret UTF16String:
                     // @help: UTF16.atos
                     // @desc: UTF16Array to UTF16String
    var rv = [], i = 0, iz = ary.length, bulkSize = 32000;

    if (iz < bulkSize) {
        return String.fromCharCode.apply(null, ary);
    }

    // avoid String.fromCharCode.apply(null, BigArray) exception
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, ary.slice(i, i + bulkSize)) );
    }
    return rv.join("");
}

function stoa(str,      // @arg UTF16String:
              filter) { // @arg Integer(= 0xffff):
                        // @ret UTF16Array:
                        // @help: UTF16.stoa
                        // @desc: UTF16String to UTF16Array
    filter = filter || 0xffff;

    var i = 0, iz = str.length, rv = Array(iz);

    for (; i < iz; ++i) {
        rv[i] = str.charCodeAt(i) & filter;
    }
    return rv;
}

/*
// inner - BinaryString To BinaryArray
function toBinaryArray(data) { // @param BinaryString: "\00\01"
                               // @return BinaryArray: [0x00, 0x01]
    var rv = [], bin2num = _bin2num, remain,
        ary = data.split(""),
        i = -1, iz;

    iz = ary.length;
    remain = iz % 8;

    while (remain--) {
        ++i;
        rv[i] = bin2num[ary[i]];
    }
    remain = iz >> 3;
    while (remain--) {
        rv.push(bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]]);
    }
    return rv;
}
 */

function _16to8(ary) { // @arg UTF16Array:
                       // @ret UTF8Array:
                       // @inner: convert UTF16Array to UTF8Array
    var rv = [], i = 0, iz = ary.length, c = 0, d = 0, u = 0;

    while (i < iz) {
        c = ary[i++];
        if (c <= 0x7F) { // [1]
            // 00000000 0zzzzzzz
            rv.push(c);                                       // 0zzz zzzz (1st)
        } else if (c <= 0x07FF) { // [2]
            // 00000yyy yyzzzzzz
            rv.push(c >>>  6 & 0x1f | 0xc0,                   // 110y yyyy (1st)
                    c        & 0x3f | 0x80);                  // 10zz zzzz (2nd)
        } else if (c <= 0xFFFF) { // [3] or [5]
            if (c >= 0xD800 && c <= 0xDBFF) { // [5] Surrogate Pairs
                // 110110UU UUwwwwxx 110111yy yyzzzzzz
                d = ary[i++];
                u = (c >>> 6 & 0x0f) + 1; // 0xUUUU+1 -> 0xuuuuu
                rv.push(
                     u >>>  2 & 0x07 | 0xf0,                  // 1111 0uuu (1st)
                    (u <<   4 & 0x30 | 0x80) | c >>> 2 & 0xf, // 10uu wwww (2nd)
                    (c <<   4 & 0x30 | 0x80) | d >>> 6 & 0xf, // 10xx yyyy (3rd)
                     d        & 0x3f | 0x80);                 // 10zz zzzz (4th)
            } else {
                // xxxxyyyy yyzzzzzz
                rv.push(c >>> 12 & 0x0f | 0xe0,               // 1110 xxxx (1st)
                        c >>>  6 & 0x3f | 0x80,               // 10yy yyyy (2nd)
                        c        & 0x3f | 0x80);              // 10zz zzzz (3rd)
            }
        } else if (c <= 0x10FFFF) { // [4]
            // 000wwwxx xxxxyyyy yyzzzzzz
            rv.push(c >>> 18 & 0x07 | 0xf0,                   // 1111 0www (1st)
                    c >>> 12 & 0x3f | 0x80,                   // 10xx xxxx (2nd)
                    c >>>  6 & 0x3f | 0x80,                   // 10yy yyyy (3rd)
                    c        & 0x3f | 0x80);                  // 10zz zzzz (4th)
        }
    }
    return rv;
}

function _8to16(ary) { // @arg UTF8Array
                       // @ret UTF16Array:
                       // @inner: convert UTF8Array to UTF16Array
    var rv = [], i = 0, iz = ary.length,
        c = 0, d = 0, e = 0, f = 0,
        u = 0, w = 0, x = 0, y = 0, z = 0;

    while (i < iz) {
        c = ary[i++];
        if (c < 0x80) {         // [1] 0x00 - 0x7F (1 byte)
            rv.push(c);
        } else if (c < 0xE0) {  // [2] 0xC2 - 0xDF (2 byte)
            d = ary[i++];
            rv.push( (c & 0x1F) <<  6 | d & 0x3F );
        } else if (c < 0xF0) {  // [3] 0xE0 - 0xE1, 0xEE - 0xEF (3 bytes)
            d = ary[i++];
            e = ary[i++];
            rv.push( (c & 0x0F) << 12 | (d & 0x3F) <<  6 | e & 0x3F );
        } else if (c < 0xF5) {  // [4] 0xF0 - 0xF4 (4 bytes)
            d = ary[i++];
            e = ary[i++];
            f = ary[i++];
            u = (((c & 0x07) << 2) | ((d >> 4) & 0x03)) - 1;
            w = d & 0x0F;
            x = (e >> 4) & 0x03;
            z = f & 0x3F;
            rv.push( 0xD8 | (u << 6) | (w << 2) | x,
                     0xDC | (y << 4) | z );
        }
    }
    return rv;
}

// --- build -----------------------------------------------
/*
(function() {
    var i = 0, v;

    for (; i < 0x100; ++i) {
        v = String.fromCharCode(i);
        _bin2num[v] = i; // "\00" -> 0x00
    }
    // http://twitter.com/edvakf/statuses/15576483807
    for (i = 0x80; i < 0x100; ++i) { // [Webkit][Gecko]
        _bin2num[String.fromCharCode(0xf700 + i)] = i; // "\f780" -> 0x80
    }
})();
 */

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { UTF8: UTF8, UTF16: UTF16 };
}
global.Monogram || (global.Monogram = {});
global.Monogram.UTF8  = UTF8;
global.Monogram.UTF16 = UTF16;

})(this.self || global);

