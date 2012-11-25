//{@sha1
(function() {

mm.sha1 = mm_sha1; // mm.sha1(data:String/ByteCodedArray/Array):SHA1CodedArray

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function mm_sha1(data) { // @arg String/ByteCodedArray/Array:
                         // @ret SHA1CodedArray: [...] + { code: "sha1", toString }
                         // @help: mm.sha1
                         // @desc: encode sha1 hash
//{@debug
    mm.allow("data", data, "String/CodedArray/Array");
//}@debug

    return Array.isCodedArray(data) ||
           Array.isArray(data) ? _crypto(data)
                               : _crypto(data.encode("utf8"));
}

function _crypto(data) { // @arg ByteCodedArray/Array:
                         // @ret SHA1CodedArray: [...] + { code: "sha1", toString }
                         // @inner:

    var rv = data, hash, i = rv.length, iz, e = i, a, b, c, d;

    // --- padding ---
    rv[i++] = 0x80;

    while (i % 64 !== 56) {
        rv[i++] = 0;
    }
    e *= 8;

    {
        rv.push(0, 0, 0, 0,
                e >> 24 & 0xff, e >> 16 & 0xff, e >> 8 & 0xff, e & 0xff);
        hash = _SHA1(rv);
    }

    for (rv = [], i = 0, iz = hash.length; i < iz; ++i) {
        rv.push(hash[i]       & 0xff,
                hash[i] >>  8 & 0xff,
                hash[i] >> 16 & 0xff,
                hash[i] >> 24 & 0xff);
    }
    for (i = 0, iz = rv.length; i < iz; i += 4) {
        a = rv[i    ];
        b = rv[i + 1];
        c = rv[i + 2];
        d = rv[i + 3];
        rv[i + 3] = a;
        rv[i + 2] = b;
        rv[i + 1] = c;
        rv[i    ] = d;
    }
    rv.code = "sha1";
    rv.toString = function() {
        var i = 0, iz = rv.length;

        for (; i < iz; ++i) {
            rv[i] = (rv[i] + 0x100).toString(16).slice(-2);
        }
        return rv.join("");
    };
    return rv;
}

function _SHA1(data) { // @arg ByteArray:
                       // @ret ByteArray:
                       // @inner: calc SHA-1
    var a = 0x67452301, aa,
        b = 0xefcdab89, bb,
        c = 0x98badcfe, cc,
        d = 0x10325476, dd,
        e = 0xc3d2e1f0, ee,
        i = 0, iz = data.length, j, jz, n, n16 = [];

    for (; i < iz; i += 64) {
        aa = a;
        bb = b;
        cc = c;
        dd = d;
        ee = e;

        for (j = i, jz = i + 64, n = 0; j < jz; j += 4, ++n) {
            n16[n] = (data[j]     << 24) | (data[j + 1] << 16) |
                     (data[j + 2] <<  8) |  data[j + 3];
        }
        for (j = 16; j < 80; ++j) {
            n = n16[j - 3] ^ n16[j - 8] ^ n16[j - 14] ^ n16[j - 16];
            n16[j] = (n << 1) | (n >>> 31);
        }
        for (j = 0; j < 80; ++j) {
            n = j < 20 ? ((b & c) ^ (~b & d))           + 0x5a827999
              : j < 40 ?  (b ^ c ^ d)                   + 0x6ed9eba1
              : j < 60 ? ((b & c) ^  (b & d) ^ (c & d)) + 0x8f1bbcdc
                       :  (b ^ c ^ d)                   + 0xca62c1d6;
            n += ((a << 5) | (a >>> 27)) + n16[j] + e;

            e = d;
            d = c;
            c = (b << 30) | (b >>> 2);
            b = a;
            a = n;
        }
        a += aa;
        b += bb;
        c += cc;
        d += dd;
        e += ee;
    }
    return [a, b, c, d, e];
}

})();
//}@sha1
