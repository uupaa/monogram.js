// polyfill.json.js: polyfill JSON.parse and JSON.stringify

//{@json
(function(global) {

// --- header ----------------------------------------------
global.JSON || (global.JSON = {
    parse:          JSON_parse,         // JSON.parse(str:String):Mix
    stringify:      JSON_stringify      // JSON.stringify(obj:Mix):Object
});

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function JSON_parse(str) { // @arg String: JSON String
                           // @ret Mix:
                           // @throw: SyntaxError("Unexpected token: ...")
                           // @desc: decode from JSONString
                           // @help: JSON.parse
    var unescaped = str.trim().replace(/"(\\.|[^"\\])*"/g, "");

    if (/[^,:{}\[\]0-9\.\-+Eaeflnr-u \n\r\t]/.test(unescaped)) {
        throw new SyntaxError("Unexpected token:" + str);
    }
    return (new Function("return " + str))(); // raise error
}

function JSON_stringify(obj) { // @arg Mix:
                               // @ret JSONString:
                               // @see: http://developer.mozilla.org/En/Using_native_JSON
                               // @throw: TypeError("Converting circular structure to JSON")
                               // @help: JSON.stringify
                               // @desc: encode to JSONString
    return _recursiveJSONStringify(obj, 0);
}

function _recursiveJSONStringify(mix,    // @arg Mix: value
                                 nest) { // @arg Number: current nest level
                                         // @ret String:
                                         // @inner: json inspect
    var rv = [], ary, key, i, iz,
        type = typeof mix,
        brackets = ["{", "}"];

    if (nest >= 100) {
        throw new TypeError("Converting circular structure to JSON");
    }

    if (mix == null) {   //  null  or  undefined
        return mix + ""; // "null" or "undefined"
    }
    if (mix.toJSON) {    // Date#toJSON
        return mix.toJSON();
    }
    if (type === "boolean" || type === "number") {
        return "" + mix;
    }
    if (type === "string") {
        return '"' + _toJSONEscapedString(mix) + '"';
    }
    if (mix.nodeType || (mix.exec && mix.test)) { // Node or RegExp
        // http://twitter.com/uupaa/statuses/81336979580661760
        return "{}";
    }
    if (Array.isArray(mix)) {
        brackets = ["[", "]"];
        for (i = 0, iz = mix.length; i < iz; ++i) {
            rv.push(_recursiveJSONStringify(mix[i], nest + 1));
        }
    } else { // isHash or other type
        ary = Object.keys(mix);
        for (i = 0, iz = ary.length; i < iz; ++i) { // uupaa-looper
            key = ary[i];
            rv.push('"' + _toJSONEscapedString(key) + '":' +
                          _recursiveJSONStringify(mix[key], nest + 1));
        }
    }
    return brackets[0] + rv.join(",") + brackets[1]; // "{...}" or "[...]"
}

function _toJSONEscapedString(str) { // @arg String:
                                     // @ret String:
                                     // @inner: to JSON escaped string
    var JSON_ESCAPE = {
            '\b': '\\b',    // backspace       U+0008
            '\t': '\\t',    // tab             U+0009
            '\n': '\\n',    // line feed       U+000A
            '\f': '\\f',    // form feed       U+000C
            '\r': '\\r',    // carriage return U+000D
            '"':  '\\"',    // quotation mark  U+0022
            '\\': '\\\\'    // reverse solidus U+005C
        };

    return str.replace(/(?:[\b\t\n\f\r\"]|\\)/g, function(_) {
                return JSON_ESCAPE[_];
            }).replace(/(?:[\x00-\x1f])/g, function(_) {
                return "\\u00" + ("0" + _.charCodeAt(0).toString(16)).slice(-2);
            });
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------

})(this.self || global);
//}@json

