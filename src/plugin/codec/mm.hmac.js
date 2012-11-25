//{@hmac
(function() {

mm.hmac = mm_hmac;          // mm.hmac(key:String/ByteCodedArray,
                            //         data:String/ByteCodedArray,
                            //         method:Function):CodedArray [...] + { code, toString }

mm.mix(mm.md5, {
    hmac:   mm_md5_hmac     // mm.md5.hmac(key:String/ByteCodedArray,
});                         //             data:String/ByteCodedArray):MD5CodedArray [...] + { code: "md5", toString }
mm.mix(mm.sha1, {
    hmac:   mm_sha1_hmac    // mm.sha1.hmac(key:String/ByteCodedArray,
});                         //              data:String/ByteCodedArray):SHA1CodedArray [...] + { code: "sha1", toString }

// --- implement -------------------------------------------
function mm_md5_hmac(key,    // @arg String/ByteCodedArray:
                     data) { // @arg String/ByteCodedArray:
                             // @ret MD5CodedArray: [...] + { code: "md5", toString }
                             // @desc: encode HMAC-MD5
    return _mm_hmac(key, data, mm.md5);
}

function mm_sha1_hmac(key,    // @arg String/ByteCodedArray:
                      data) { // @arg String/ByteCodedArray:
                              // @ret SHA1CodedArray: [...] + { code: "sha1", toString }
                              // @desc: encode HMAC-SHA1
    return _mm_hmac(key, data, mm.sha1);
}

function mm_hmac(key,      // @arg String/ByteCodedArray:
                 data,     // @arg String/ByteCodedArray:
                 method) { // @arg Function: hash method. e.g.: mm.md5, mm.sha1
                           // @ret MD5CodedArray/SHA1CodedArray: [...] + { code: "md5" or "sha1", toString }
                           // @desc: encode HMAC-MD5, HMAC-SHA1
//{@debug
    mm.allow("key",  key,  "String/ByteCodedArray");
    mm.allow("data", data, "String/ByteCodedArray");
//}@debug

    key  = Array.isArray(key)  ? key  : key.encode("utf8");
    data = Array.isArray(data) ? data : data.encode("utf8");

    // http://en.wikipedia.org/wiki/HMAC
    var blocksize = 64, // magic word(MD5.blocksize = 64, SHA1.blocksize = 64)
        i = 0, opad, ipad;

    if (key.length > blocksize) {
        key = method(key, true);
    }
    opad = key.concat(); // clone
    ipad = key.concat(); // clone

    for (; i < blocksize; ++i) {
        opad[i] ^= 0x5C; // xor
        ipad[i] ^= 0x36; // xor
    }
    return method(opad.concat(method(ipad.concat(data))));
}

})();
//}@hmac
