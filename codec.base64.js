// codec.base64.js: extend Base64 methods
// @need: codec.utf.js

//{@base64
(function() {

// --- header ----------------------------------------------
function _extendNativeObjects() {
    wiz(Array.prototype, {
        toBase64String:     Array_toBase64String    // [byte].toBase64String():Base64String
    });
    wiz(String.prototype, {
        toBase64String:     String_toBase64String,  // "".toBase64String(safe:Boolean = false):Base64String
        fromBase64String:   String_fromBase64String // "".fromBase64String():String
    });
}

// --- library scope vars ----------------------------------
var _base64_db = {
        chars: base.split(""),              // ["A", "B", ... "/"]
        codes: { "=": 0, "-": 62, "_": 63 } // { 65: 0, 66: 1 }
                                            // charCode and URLSafe64 chars("-", "_")
    };

// --- implement -------------------------------------------
function Array_toBase64String(safe) { // @arg Boolean(= false):
                                      // @ret Base64String:
                                      // @this ByteArray:
                                      // @help: Array#toBase64
                                      // @desc: ByteArray to Base64String
    var rv = [], ary = this, // this is IntegerArray
        c = 0, i = 0, iz = ary.length,
        pad = [0, 2, 1][iz % 3],
        chars = _base64_db.chars;

    --iz;
    while (i < iz) {
        c =  ((ary[i++] & 0xff) << 16) |
             ((ary[i++] & 0xff) <<  8) |
              (ary[i++] & 0xff); // 24bit
        rv.push(chars[(c >> 18) & 0x3f], chars[(c >> 12) & 0x3f],
                chars[(c >>  6) & 0x3f], chars[ c        & 0x3f]);
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    if (safe) {
        return rv.join("").replace(/\=+$/g, "").replace(/\+/g, "-").
                                                replace(/\//g, "_");
    }
    return rv.join("");
}

function String_toBase64String(safe) { // @arg Boolean(= false):
                                       // @ret Base64String:
                                       // @help: String#toBase64String
                                       // @desc: String to Base64String
    return this.toUTF16Array().toUTF8Array().toBase64String(safe);
}

function String_fromBase64String() { // @ret String:
                                     // @help: String#fromBase64String
                                     // @desc: decode Base64String to String
    var rv = [], c = 0, i = 0, ary = this.split(""),
        iz = this.length - 1,
        codes = _base64_db.codes;

    while (i < iz) {                // 00000000|00000000|00000000 (24bit)
        c = (codes[ary[i++]] << 18) // 111111  |        |
          | (codes[ary[i++]] << 12) //       11|1111    |
          | (codes[ary[i++]] <<  6) //         |    1111|11
          |  codes[ary[i++]];       //         |        |  111111
                                    //    v        v        v
        rv.push((c >> 16) & 0xff,   // --------
                (c >>  8) & 0xff,   //          --------
                 c        & 0xff);  //                   --------
    }
    rv.length -= [0, 0, 2, 1][this.replace(/\=+$/, "").length % 4]; // cut tail

    return rv.toUTF16Array().toUTF16String();
}

function _initBase64() { // @inner: init base64
    var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        i = 0;

    for (; i < 64; ++i) {
        _base64_db.codes[base.charAt(i)] = i;
    }
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

})();
//}@base64

