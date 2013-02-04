// codec.crc32.js
// @see: via http://www.ietf.org/rfc/rfc1952.txt

//{@crc32
(function(global) {

// --- header ---------------------------------------------
function CRC32(data,    // @arg IntegerArray:
               crc) {   // @arg Integer(= 0): previous computed CRC32
    this._data = data;
    this._crc = crc || 0;
}
CRC32.name = "CRC32";
CRC32.prototype = {
    constructor:CRC32,
    calc:       calc        // CRC32#calc():Integer
};

// --- library scope vars ----------------------------------
var _CRC32_TABLE;

// --- implement -------------------------------------------
function calc() { // @ret Integer:
                  // @help: CRC32#calc
                  // @desc: calc CRC32
    var table = _CRC32_TABLE || (_CRC32_TABLE = _initCRC32()),
        c = ((this._crc || 0) ^ 0xffffffff) >>> 0, // xor
        i = 0, iz = this._data.length;

    for (; i < iz; ++i) {
        c = (c >>> 8) ^ table[(c ^ this._data[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0; // xor
}

// --- build -----------------------------------------------
function _initCRC32() { // @inner: create CRC32 table
    var rv = [], c = 0, i = 0, j = 0;

    for (; i < 256; ++i) {
        for (c = i, j = 0; j < 8; ++j) {
//          c = c & 1 ? 0xedb88320.xor(c >>> 1)
            c = c & 1 ? ((0xedb88320 ^ (c >>> 1)) >>> 0) // xor
                      : c >>> 1;
        }
        rv[i] = c;
    }
    return rv;
}

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { CRC32: CRC32 };
}
global.Monogram || (global.Monogram = {});
global.Monogram.CRC32 = CRC32;

})(this.self || global);
//}@crc32
