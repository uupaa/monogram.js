//{@crc32
(function() {

mm.crc32 = mm_crc32;    // mm.crc32(data:ByteCodedArray/Array, crc:Integer = 0):Integer

// --- library scope vars ----------------------------------
var _CRC32_TABLE;

// --- implement -------------------------------------------
function mm_crc32(data,  // @arg ByteCodedArray/Array: [...] + { code: byte }
                  crc) { // @arg Integer(= 0): previous computed CRC32
                         // @ret Integer:
                         // @see: via http://www.ietf.org/rfc/rfc1952.txt
                         // @help: mm.CRC32
                         // @desc: encode CRC32

//{@debug
    mm.allow("data", data, "CodedArray/Array");
    mm.allow("crc",  crc,  "Integer/undefined");
//}@debug

    var table = _CRC32_TABLE || (_CRC32_TABLE = _initCRC32()),
        c = (crc || 0).xor(0xffffffff),
        i = 0, iz = data.length;

    for (; i < iz; ++i) {
        c = (c >>> 8) ^ table[(c ^ data[i]) & 0xff];
    }
    return c.xor(0xffffffff);
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

})();
//}@crc32
