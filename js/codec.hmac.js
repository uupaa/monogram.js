// codec.hmac.js: calc HMAC hash
// @need: Monogram.UTF16.toUTF8Array in codec.utf16.js
//        Monogram.SHA1 in codec.sha1.js
//        Monogram.MD5 in codec.md5.js

//{@hmac
(function(global) {

// --- header --------------------------------
function HMAC(key,      // @arg ByteArray:
              data,     // @arg SHA1Array/MD5Array:
              method) { // @arg String: hash method. "MD5", "SHA1"
    this._key = key;
    this._data = [];
    this._method = method.toUpperCase();

    if (Array.isArray(data)) {
        this._data = data;
    } else {
        this._data = new global.Monogram.UTF16(data).toUTF8Array();
    }
}
HMAC.name = "HMAC";
HMAC.prototype = {
    constructor:HMAC,
    toArray:    toArray         // HMAC#toArray():HMACArray
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function toArray() { // @ret HMACArray: [...]
                     // @help: HMAC#toArray
                     // @desc: encode HMAC
    return _calc_hmac(this._key, this._data, method);
}

function _calc_hmac(key,      // @arg ByteArray:
                    data,     // @arg ByteArray:
                    method) { // @arg String: hash method
                              // @ret MD5Array/SHA1Array: [...]
                              // @desc: encode HMAC-MD5, HMAC-SHA1
    method = { "MD5": toMD5Array, "SHA1": toSHA1Array };

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

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { HMAC: HMAC };
}
global.Monogram || (global.Monogram = {});
global.Monogram.HMAC = HMAC;

})(this.self || global);
//}@hmac

