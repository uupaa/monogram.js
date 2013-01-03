// codec.utf16.js: UTF16 <-> UTF8 convert methods
// @see: https://gist.github.com/4185267

//{@utf16
(function(global) {

// --- header ---------------------------------------------
function UTF16(data) { // @arg UTF16Array/UTF16String(= ""):
    if (Array.isArray(data)) {
        this.fromArray(data);
    } else if (typeof data === "string") {
        this.fromString(data);
    } else {
        this._ary = []; // UTF16Array
    }
}

UTF16.name = "UTF16";
UTF16.prototype = {
    constructor:    UTF16,
    fromUTF8Array:  UTF16_fromUTF8Array,// UTF16#fromUTF8Array(ary:UTF8Array):this
    toUTF8Array:    UTF16_toUTF8Array,  // UTF16#toUTF8Array():UTF8Array
    fromString:     UTF16_fromString,   // UTF16#fromString(str:String):this
    fromArray:      UTF16_fromArray,    // UTF16#fromArray(ary:UTF16Array):this
    toString:       UTF16_toString,     // UTF16#toString():String
    toArray:        UTF16_toArray       // UTF16#toArray():UTF16Array
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function UTF16_toUTF8Array() { // @ret UTF8Array:
                               // @help: UTF16#toUTF8Array
                               // @desc: convert UTF16Array to UTF8Array
    return _16to8(this._ary);
}

function UTF16_fromUTF8Array(ary) { // @arg UTF8Array
                                    // @ret this:
                                    // @help: UTF16#fromUTF8Array
                                    // @desc: convert UTF16Array from UTF8Array
    this._ary = _8to16(ary);
    return this;
}

function UTF16_toString() { // @ret String:
                            // @help: UTF16#toString
                            // @desc: convert UTF16Array to String
    return _toString(this._ary);
}

function UTF16_fromString(str) { // @arg UTF16String:
                                 // @ret this:
                                 // @help UTF16#fromString
                                 // @desc: convert UTF16String to UTF16Array
    this._ary = _fromString(str);
    return this;
}

function UTF16_fromArray(ary) { // @arg UTF16Array:
                                // @ret this:
                                // @help UTF16#fromArray
                                // @desc: set UTF16Array (by ref)
    this._ary = ary;
    return this;
}

function UTF16_toArray() { // @ret UTF16Array:
                           // @help UTF16#toArray
                           // @desc: get UTF16Array (by ref)
    return this._ary;
}

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

function _toString(ary) { // @arg UTF16Array:
                          // @ret String:
    var rv = [], i = 0, iz = ary.length, bulkSize = 10240;

    if (iz < bulkSize) {
        return String.fromCharCode.apply(null, ary);
    }

    // avoid String.fromCharCode.apply(null, BigArray) exception
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, ary.slice(i, i + bulkSize)) );
    }
    return rv.join("");
}

function _fromString(str) { // @arg String:
                            // @ret UTF16Array:
    var rv = new Array(str.length), i = 0, iz = str.length;

    for (; i < iz; ++i) {
        rv[i] = str.charCodeAt(i);
    }
    return rv;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { UTF16: UTF16 };
}
global.Monogram || (global.Monogram = {});
global.Monogram.UTF16 = UTF16;

})(this.self || global);
//}@utf16

// --- test ------------------------------------------------
/*
    var UTF16 = require("./codec.utf16").UTF16;

    function test1() { // UTF16String to UTF16Array
        // A,I,U in Japanese
        var str = String.fromCharCode.apply(null, [12354, 12356, 12358]);

        var ary = new UTF16(str).toArray();

        console.log(ary.join() === "12354,12356,12358");
    }

    function test2() { // UTF16String to UTF8Array
        // A,I,U in Japanese
        var str = String.fromCharCode.apply(null, [12354, 12356, 12358]);

        var ary = new UTF16(str).toUTF8Array();

        console.log(ary.join() === "227,129,130,227,129,132,227,129,134");
    }

    function test3() { // UTF8Array to UTF16String
        // A,I,U in Japanese
        var utf8 = [227,129,130,227,129,132,227,129,134];

        var str = new UTF16().fromUTF8Array(utf8).toString();

        console.log(str === String.fromCharCode.apply(null, [12354, 12356, 12358]));
    }

 */

