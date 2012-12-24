// codec.base64.js: Base64

//{@base64
(function(global) {

// --- header ----------------------------------------------
function Base64(data,                 // @arg String/Array:
                decodeBase64String) { // @arg Boolean(= false):
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "Base64" });

    this._data = [];
    this._init(data, decodeBase64String);
}

Base64.prototype = {
    _init:          Base64_init,
    toArray:        Base64_toArray,         // Base64#toArray():Array/Base64Array
    toString:       Base64_toString,        // Base64#toString():String
    toBase64String: Base64_toBase64String   // Base64#toBase64String(safe:Boolean = false):Base64String
};

Base64.btoa = Base64_btoa;  // Base64#btoa(binary:String, fromXHR:Boolean = false):Base64String
Base64.atob = Base64_atob;  // Base64#atob(base64:String):BinaryString

// --- library scope vars ----------------------------------
var _DB = {
        chars: [],                          // ["A", "B", ... "/"]
        codes: { "=": 0, "-": 62, "_": 63 } // { 65: 0, 66: 1 }
                                            // charCode and URLSafe64 chars("-", "_")
    };

// --- implement -------------------------------------------
function Base64_init(data, decodeBase64String) {
    if (Array.isArray(data)) {
        this._data = data; // by ref (not copy)
    } else if (typeof data === "string") {
        this._data = decodeBase64String ? _decode(data)
                                        : _toByteArray(data);
    }
}

function Base64_toString() { // @ret String:
                             // @help: Base64#toString
                             // @desc: to
    return _toString(this._data);
}

function Base64_toArray() { // @ret Array/Base64Array:
                            // @help: Base64#toArray
                            // @desc: get raw data
    return this._data;
}

function Base64_toBase64String(safe) { // @arg Boolean(= false):
                                       // @ret Base64String:
                                       // @help: Base64#toBase64String
    return _encode(this._data, safe);
}

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
        return global.btoa( _toAsciiString(binary) );
    }
    return _encode( _toByteArray(binary) );
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
    return _toString( _decode(base64) );
}

function _toAsciiString(binary) { // @arg String: has non ascii value
                                  // @ret BinaryString:
                                  // @inner: filer
    var rv = Array(binary.length), i = 0, iz = binary.length;

    for (; i < iz; ++i) {
        rv[i] = String.fromCharCode( binary.charCodeAt(i) & 0xFF ); // 0xffff -> 0xff
    }
    return rv.join("");
}


function _toString(ary) { // @arg Array:
                          // @ret String:
                          // @inner: UTF16Array to String
    var rv = [], i = 0, iz = ary.length, bulkSize = 10240;

    // avoid String.fromCharCode.apply(null, BigArray) exception
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, ary.slice(i, i + bulkSize)) );
    }
    return rv.join("");
}

function _toByteArray(str) { // @arg String:
                             // @ret ByteArray:
                             // @inner: BinaryString to ByteArray
    var rv = Array(str.length), i = 0, iz = str.length;

    for (; i < iz; ++i) {
        rv[i] = str.charCodeAt(i) & 0xFF; // 0xffff -> 0xff
    }
    return rv;
}

function _encode(ary,    // @arg Array:
                 safe) { // @arg Boolean(= false): true is URLSafe64
                         // @ret Base64String:
                         // @inner: ByteArray to Base64String
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

function _decode(str) { // @arg Base64String:
                        // @ret Array:
                        // @inner: decode Base64String to array
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

// --- build and export API --------------------------------
(function() { // @inner: init base64
    var CODE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
               "abcdefghijklmnopqrstuvwxyz0123456789+/";

    _DB.chars = CODE.split("");

    for (var i = 0; i < 64; ++i) {
        _DB.codes[CODE.charAt(i)] = i;
    }
})();

if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { Base64: Base64 } };
} else {
    global.Monogram || (global.Monogram = {});
    global.Monogram.Base64 = Base64;
}

})(this.self || global);
//}@base64

/*
    var Base64 = require("./codec.base64").Monogram.Base64;

    function test1() { // encode/decode String <-> Base64String
        var base64String = new Base64("abc").toBase64String(); // -> "YWJj"
        var decode = new Base64(base64String, true).toString(); // -> "abc"

        console.log( base64String === "YWJj" );
        console.log( decode === "abc" );
    }

    function test2() { // some case
        console.log(new Base64("abc").toBase64String() === "YWJj" );
        console.log(new Base64("abcd").toBase64String() === "YWJjZA==" );
        console.log(new Base64("abcde").toBase64String() === "YWJjZGU=" );
        console.log(new Base64("abcdef").toBase64String() === "YWJjZGVm" );
    }

    function test3() { // BinaryData to Base64String
        function xhr(url) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false); // false is sync
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
            xhr.send(null);
            return xhr.responseText + "";
        }
        var binary = xhr("uupaa.jpg"), point1 = Date.now(), rv1;
        for (var i = 0; i < 100; ++i) { rv1 = Base64.btoa(binary, true); }
        console.log(Date.now() - point1); // 27ms (quick)

        var binary = xhr("uupaa.jpg"), point2 = Date.now(), rv2;
        for (var i = 0; i < 100; ++i) { rv2 = new Base64(binary).toBase64String(); }
        console.log(Date.now() - point2); // 44ms (slow)

        if (rv1 === rv2) {
            console.log("ok");
        } else {
            console.log("ng");
        }
    }
 */

