// codec.md5.js
// @need: codec.utf.js

//{@md5
(function() {

// --- header --------------------------------
function _extendNativeObjects() {
    wiz(Array.prototype, {
        toMD5Array:     Array_toMD5Array    // [].toMD5Array():MD5Array
    });
    wiz(String.prototype, {
        toMD5Array:     String_toMD5Array   // "".toMD5Array():MD5Array
    });
}

// --- library scope vars ----------------------------------
var _MD5_A = [  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf,
                0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af,
                0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e,
                0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
                0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6,
                0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
                0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
                0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
                0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039,
                0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97,
                0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d,
                0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
                0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391],
    _MD5_S = [  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
                5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
                4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
                6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21],
    _MD5_X = [  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
                1,  6, 11,  0,  5, 10, 15,  4,  9, 14,  3,  8, 13,  2,  7, 12,
                5,  8, 11, 14,  1,  4,  7, 10, 13,  0,  3,  6,  9, 12, 15,  2,
                0,  7, 14,  5, 12,  3, 10,  1,  8, 15,  6, 13,  4, 11,  2,  9];

// --- implement -------------------------------------------
function Array_toMD5Array() { // @ret MD5Array: [...]
                              // @help: Array#toMD5Array
                              // @desc: encode md5 hash
    return _crypto(this.valueOf());
}

function String_toMD5Array() { // @ret MD5Array: [...]
                               // @help: String#toMD5Array
                               // @desc: encode md5 hash
    return _crypto(this.toUTF8Array());
}

function _crypto(data) { // @arg ByteArray
                         // @ret MD5Array: [...]
                         // @inner:

    var rv = data, hash, i = rv.length, iz, e = i;

    // --- padding ---
    rv[i++] = 0x80;

    while (i % 64 !== 56) {
        rv[i++] = 0;
    }
    e *= 8;

    {
        rv.push(e & 0xff, e >> 8 & 0xff, e >> 16 & 0xff, e >> 24 & 0xff,
                0, 0, 0, 0);
        hash = _MD5(rv);
    }

    for (rv = [], i = 0, iz = hash.length; i < iz; ++i) {
        rv.push(hash[i]       & 0xff,
                hash[i] >>  8 & 0xff,
                hash[i] >> 16 & 0xff,
                hash[i] >> 24 & 0xff);
    }
    return rv;
}

function _MD5(data) { // @arg ByteArray:
                      // @ret ByteArray:
                      // @inner: calc MD5
    var a = 0x67452301, aa, ra,
        b = 0xefcdab89, bb, rb,
        c = 0x98badcfe, cc, rc,
        d = 0x10325476, dd,
        A = _MD5_A,
        S = _MD5_S,
        X = _MD5_X,
        i = 0, iz = data.length, j, k, n, word = [];

    for (; i < iz; i += 64) {
        for (j = 0; j < 16; ++j) {
            k = i + j * 4;
            word[j] = data[k] + (data[k + 1] <<  8) +
                                (data[k + 2] << 16) +
                                (data[k + 3] << 24);
        }
        aa = a;
        bb = b;
        cc = c;
        dd = d;

        for (j = 0; j < 64; ++j) {
            n = j < 16 ? (b & c) | (~b & d) // ff - Round 1
              : j < 32 ? (b & d) | (c & ~d) // gg - Round 2
              : j < 48 ?  b ^ c ^ d         // hh - Round 3
                       :  c ^ (b | ~d);     // ii - Round 4
            n += a + word[X[j]] + A[j];

            ra = b + ((n << S[j]) | (n >>> (32 - S[j])));
            rb = b;
            rc = c;
            // rotate
            a = d;
            b = ra;
            c = rb;
            d = rc;
        }
        a += aa;
        b += bb;
        c += cc;
        d += dd;
    }
    return [a, b, c, d];
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
//}@md5
