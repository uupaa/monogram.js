// codec.crc32.js

//{@crc32
(function() {

// --- header ---------------------------------------------
function _extendNativeObjects() {
    wiz(Array.prototype, {
        calcCRC32:      Array_calcCRC32     // [].calcCRC32(crc:Integer = 0):Integer
    });
}

// --- library scope vars ----------------------------------
var _CRC32_TABLE;

// --- implement -------------------------------------------
function Array_calcCRC32(crc) { // @arg Integer(= 0): previous computed CRC32
                                // @ret Integer:
                                // @see: via http://www.ietf.org/rfc/rfc1952.txt
                                // @help: Array#calcCRC32
                                // @desc: encode CRC32
    var table = _CRC32_TABLE || (_CRC32_TABLE = _initCRC32()),
        c = ((crc || 0) ^ 0xffffffff) >>> 0, // xor
        i = 0, iz = this.length;

    for (; i < iz; ++i) {
        c = (c >>> 8) ^ table[(c ^ this[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0; // xor
}

function _initCRC32() { // @inner: create CRC32 table
    var rv = [], c = 0, i = 0, j = 0;

    for (; i < 256; ++i) {
        for (c = i, j = 0; j < 8; ++j) {
            c = c & 1 ? 0xedb88320.xor(c >>> 1)
                      : c >>> 1;
        }
        rv[i] = c;
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

})();
//}@crc32
