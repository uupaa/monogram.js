// codec.hmac.js
// @need: codec.utf.js, codec.md5.js, codec.sha1.js

//{@hmac
(function() {

// --- header --------------------------------
function _extendNativeObjects() {
    wiz(Array.prototype, {
        toHMACArray:    Array_toHMACArray   // [].toHMACArray(data:Array, method:String):Array
    });
    wiz(String.prototype, {
        toHMACArray:    String_toHMACArray  // "".toHMACArray(data:Array, method:String):Array
    });
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Array_toHMACArray(data,     // @arg ByteArray:
                           method) { // @arg String:
                                     // @ret Array: [...]
                                     // @desc: encode HMAC
    return _calc_hmac(this.valueOf(), data, method);
}

function String_toHMACArray(data,     // @arg ByteArray:
                            method) { // @arg String:
                                      // @ret Array: [...]
                                      // @desc: encode HMAC
    return _calc_hmac(this.toUTF8Array(), data, method);
}

function _calc_hmac(key,      // @arg ByteArray:
                    data,     // @arg ByteArray:
                    method) { // @arg String: hash method
                              // @ret MD5Array/SHA1Array: [...]
                              // @desc: encode HMAC-MD5, HMAC-SHA1
    method = { "md5":  toMD5Array,
               "sha1": toSHA1Array }[method.toLowerCase()];

    // http://en.wikipedia.org/wiki/HMAC
    var blocksize = 64, // magic word(MD5.blocksize = 64, SHA1.blocksize = 64)
        i = 0, opad, ipad;

    if (key.length > blocksize) {
        key = key[method]();
    }
    opad = key.concat(); // clone
    ipad = key.concat(); // clone

    for (; i < blocksize; ++i) {
        opad[i] ^= 0x5C; // xor
        ipad[i] ^= 0x36; // xor
    }
    return opad.concat( ipad.concat(data)[method]() )[method]();
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
//}@hmac

