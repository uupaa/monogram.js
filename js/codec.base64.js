// codec.base64.js:

(function(global) {

// --- header ----------------------------------------------
function Base64() { }
Base64.name = "Base64";
Base64.btoa = Base64_btoa;  // btoa(binary:String, fromXHR:Boolean = false):Base64String
Base64.atob = Base64_atob;  // atob(base64:String):BinaryString
Base64.encode = encode;     // encode(ary:Array, safe:Boolean = false):Base64String
Base64.decode = decode;     // decode(str:Base64String):Array

// --- library scope vars ----------------------------------
var _DB = {
        chars: [],                          // ["A", "B", ... "/"]
        codes: { "=": 0, "-": 62, "_": 63 } // { 65: 0, 66: 1 }
                                            // charCode and URLSafe64 chars("-", "_")
    };

// --- implement -------------------------------------------
function Base64_btoa(binary,    // @arg String:
                     fromXHR) { // @arg Boolean(= false):
                                // @ret Base64String:
    if (global.btoa) {
        if (!fromXHR) {
            try {
                return global.btoa(binary); // BinaryString to Base64String
            } catch (o_o) {
                // maybe. xhr binary has non ascii value
            }
        }
        return global.btoa( _normalize(binary) );
    }
    return encode( _toArray(binary, 0xff) );
}

function Base64_atob(base64) { // @arg Base64String:
                               // @ret BinaryString:
    if (global.atob) {
        try {
            return global.atob(base64);
        } catch (o_o) {
            // maybe. broken base64 data
        }
    }
    return _fromArray( decode(base64) );
}

function encode(ary,    // @arg Array:
                safe) { // @arg Boolean(= false): true is URLSafe64
                        // @ret Base64String:
                        // @desc: ByteArray to Base64String
    var rv = [],
        c = 0, i = -1, iz = ary.length,
        pad = [0, 2, 1][iz % 3],
        chars = _DB.chars;

    --iz;
    while (i < iz) {
        c =  ((ary[++i] & 0xff) << 16) |
             ((ary[++i] & 0xff) <<  8) |
              (ary[++i] & 0xff); // 24bit

        rv.push(chars[(c >> 18) & 0x3f],
                chars[(c >> 12) & 0x3f],
                chars[(c >>  6) & 0x3f],
                chars[ c        & 0x3f]);
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    if (safe) {
        return rv.join("").replace(/\=+$/g, "").replace(/\+/g, "-").
                                                replace(/\//g, "_");
    }
    return rv.join("");
}

function decode(str) { // @arg Base64String:
                       // @ret Array:
                       // @desc: decode Base64String to array
    var rv = [], c = 0, i = 0, ary = str.split(""),
        iz = str.length - 1,
        codes = _DB.codes;

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
    rv.length -= [0, 0, 2, 1][str.replace(/\=+$/, "").length % 4]; // cut tail

    return rv;
}

function _normalize(binary) { // @arg String: has non ascii value
                              // @ret BinaryString:
                              // @inner: filer
    var i = 0, iz = binary.length, rv = Array(iz);

    for (; i < iz; ++i) {
        rv[i] = String.fromCharCode( binary.charCodeAt(i) & 0xFF ); // 0xffff -> 0xff
    }
    return rv.join("");
}

function _fromArray(ary) { // @arg Array:
                           // @ret String: binary string
                           // @inner: UTF16Array to String
    var rv = [], i = 0, iz = ary.length, bulkSize = 32000;

    // avoid String.fromCharCode.apply(null, BigArray) exception
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, ary.slice(i, i + bulkSize)) );
    }
    return rv.join("");
}

function _toArray(binary,   // @arg String:
                  filter) { // @arg Integer(= 0xffff):
                            // @ret ByteArray:
                            // @inner: BinaryString to ByteArray
    filter = filter || 0xffff;

    var i = 0, iz = binary.length, rv = Array(iz);

    for (; i < iz; ++i) {
        rv[i] = binary.charCodeAt(i) & filter; // 0xffff -> 0xff
    }
    return rv;
}


// --- build -----------------------------------------------
(function() { // @inner: init base64
    var CODE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
               "abcdefghijklmnopqrstuvwxyz0123456789+/";

    _DB.chars = CODE.split("");

    for (var i = 0; i < 64; ++i) {
        _DB.codes[CODE.charAt(i)] = i;
    }
})();

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Base64: Base64 };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Base64 = Base64;

})(this.self || global);


