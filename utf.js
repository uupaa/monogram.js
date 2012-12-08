// utf.js: extend UTF8 and UTF16 convert methods
// @see: https://gist.github.com/4185267

//{@utf
(function(global) { // @arg Global: window or global

// --- header function _extendNativeObjects() {
function _extendNativeObjects() {
    wiz(Array.prototype, {
        toUTF8Array:    Array_toUTF8Array,  // [utf16].toUTF8Array():UTF8Array
        toUTF16Array:   Array_toUTF16Array, // [utf8].toUTF16Array():UTF16Array
        toUTF16String:  Array_toUTF16String // [utf8].toUTF16String():String
    });
    wiz(String.prototype, {
        toUTF8Array:    String_toUTF8Array, // "".toUTF8Array():UTF8Array
        toUTF16Array:   String_toUTF16Array // "".toUTF16Array():UTF16Array
    });
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Array_toUTF8Array() { // @ret UTF8Array:
                               // @help: Array#toUTF8Array
                               // @desc: convert UTF16Array to UTF8Array
    var rv = [], i = 0, iz = this.length, c = 0, d = 0, u = 0;

    while (i < iz) {
        c = this[i++];
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
                d = this[i++];
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

function Array_toUTF16Array() { // @ret UTF16Array:
                                // @help: Array#toUTF16Array
                                // @desc: convert UTF8Array to UTF16Array
    var rv = [], i = 0, iz = this.length,
        c = 0, d = 0, e = 0, f = 0,
        u = 0, w = 0, x = 0, y = 0, z = 0;

    while (i < iz) {
        c = this[i++];
        if (c < 0x80) {         // [1] 0x00 - 0x7F (1 byte)
            rv.push(c);
        } else if (c < 0xE0) {  // [2] 0xC2 - 0xDF (2 byte)
            d = this[i++];
            rv.push( (c & 0x1F) <<  6 | d & 0x3F );
        } else if (c < 0xF0) {  // [3] 0xE0 - 0xE1, 0xEE - 0xEF (3 bytes)
            d = this[i++];
            e = this[i++];
            rv.push( (c & 0x0F) << 12 | (d & 0x3F) <<  6 | e & 0x3F );
        } else if (c < 0xF5) {  // [4] 0xF0 - 0xF4 (4 bytes)
            d = this[i++];
            e = this[i++];
            f = this[i++];
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

function Array_toUTF16String() { // @ret String:
                                 // @help: Array#toUTF16String
                                 // @desc: UTF16Array to String
    var rv = [], i = 0, iz = this.length, bulkSize = 10240;

    // avoid String.fromCharCode.apply(null, BigArray) exception
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, this.slice(i, i + bulkSize)) );
    }
    return rv.join("");
}

function String_toUTF8Array() { // @ret UTF8Array: [...]
                                // @help: String#toUTF8Array
                                // @desc: String to UTF8Array
    return this.toUTF16Array().toUTF8Array(); // String#toUTF16Array, Array#toUTF8Array
}

function String_toUTF16Array() { // @arg String:
                                 // @ret UTF16Array: [...]
                                 // @help String#toUTF16Array
                                 // @desc convert String to UTF16Array
    var rv = [], i = 0, iz = this.length;

    for (; i < iz; ++i) {
        rv[i] = this.charCodeAt(i);
    }
    return rv;
}

function wiz(object, extend, override) {
    for (var key in extend) {
        (override || !(key in object)) && Object.defineProperty(object, key, {
            configurable: true, writable: true, value: extend[key]
        });
    }
}

// --- export --------------------------------
_extendNativeObjects();

})(this.self || global);
//}@utf

