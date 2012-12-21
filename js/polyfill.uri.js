// uri.js: polyfill encodeURIComponent and decodeURIComponent functions

//{@uri
(function(global) { // @arg Global: window or global

if (!global.encodeURIComponent) {
     global.encodeURIComponent = global_encodeURIComponent;
}
if (!global.decodeURIComponent) {
     global.decodeURIComponent = global_decodeURIComponent;
}

function global_encodeURIComponent(str) { // @arg String:
                                          // @ret String: percent encoded string
                                          // @desc: encode symbol in string.
    function _hex(num) {
        return (num < 16) ? "0" + num.toString(16)  // 0x00 ~ 0x0f
                          :       num.toString(16); // 0x10 ~ 0xff
    }

    var rv = [], i = 0, iz = str.length, c = 0, safe;

    for (; i < iz; ++i) {
        c = str.charCodeAt(i);

        if (c < 0x80) { // encode ASCII(0x00 ~ 0x7f)
            safe = c === 95 ||              // _
                   (c >= 48 && c <=  57) || // 0~9
                   (c >= 65 && c <=  90) || // A~Z
                   (c >= 97 && c <= 122);   // a~z

            if (!safe) {
                safe = c === 33  || // !
                       c === 45  || // -
                       c === 46  || // .
                       c === 126 || // ~
                       (c >= 39 && c <= 42); // '()*
            }
            if (safe) {
                rv.push(str.charAt(i));
            } else {
                rv.push("%", _hex(c));
            }
        } else if (c < 0x0800) { // encode UTF-8
            rv.push("%", _hex(((c >>>  6) & 0x1f) | 0xc0),
                    "%", _hex( (c         & 0x3f) | 0x80));
        } else if (c < 0x10000) { // encode UTF-8
            rv.push("%", _hex(((c >>> 12) & 0x0f) | 0xe0),
                    "%", _hex(((c >>>  6) & 0x3f) | 0x80),
                    "%", _hex( (c         & 0x3f) | 0x80));
        }
    }
    return rv.join("");
}

function global_decodeURIComponent(str) { // @arg String: percent encoded string
                                          // @ret String:
                                          // @throws: Error("BAD_ARG")
                                          // @desc: decode %xx formated string.
                                          //        like decodeURIComponent
    return str.replace(/(%[\da-f][\da-f])+/g, function(match) {
        var rv = [],
            ary = match.split("%").slice(1), i = 0, iz = ary.length,
            a, b, c;

        for (; i < iz; ++i) {
            a = parseInt(ary[i], 16);

            if (a !== a) { // isNaN(a)
                throw new Error("BAD_ARG");
            }

            // decode UTF-8
            if (a < 0x80) { // ASCII(0x00 ~ 0x7f)
                rv.push(a);
            } else if (a < 0xE0) {
                b = parseInt(ary[++i], 16);
                rv.push((a & 0x1f) <<  6 | (b & 0x3f));
            } else if (a < 0xF0) {
                b = parseInt(ary[++i], 16);
                c = parseInt(ary[++i], 16);
                rv.push((a & 0x0f) << 12 | (b & 0x3f) << 6
                                         | (c & 0x3f));
            }
        }
        return String.fromCharCode.apply(null, rv);
    });
}

})(this.self || global);
//}@uri

