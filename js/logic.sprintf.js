// logic.sprintf.js: sprintf function

//{@sprintf
(function(global, wiz) {

// --- header ----------------------------------------------
wiz(String.prototype, {
    format: String_sprintf // "%05s".sprintf(...:Mix):String
});

// --- library scope vars ----------------------------------
var _FORMAT = /%(?:(\d+)\$)?(#|0| )?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcs])/g,
              //   ~~~~~    ~~~~~~~ ~~~~~      ~~~~~      ~~~~~~~~~~~~~~
              //  argIndex   flag   width    precision        types
              //
    _BITS = {
        i: 0x0011, // "%i" padding + to int
        d: 0x0011, // "%d" padding + to int
        u: 0x0021, // "%u" padding + to unsinged
        o: 0x0161, // "%o" padding + to octet + to unsigned + add prefix("0")
        x: 0x0261, // "%x" padding + to hex   + to unsigned + add prefix("0")
        X: 0x1261, // "%X" padding + to upper case + to hex + to unsigned + add prefix("0")
        f: 0x0092, // "%f" precision + padding + to float
        c: 0x6800, // "%c" get first char + padding
        s: 0x0084  // "%s" precision + to string
    };

// 0x0001: parse int        (%i, %d, %u, %o, %x, %X)
// 0x0002: parse float      (%f)
// 0x0004: to string        (%s)
// 0x0010: negative padding control (%i, %d, %f)
// 0x0020: to unsinged      (%u, %o, %x, %X)
// 0x0040: add prefix       (%o -> "0", %x -> "0x", %X -> "0x")
// 0x0080: precision        (%f, %s)
// 0x0100: to octet         (%o)
// 0x0200: to hex           (%x, %X)
// 0x0800: padding          (%c)
// 0x1000: to upper case    (%X)
// 0x2000: get char         (%c)
// 0x4000: check overflow   (%c)

// --- implement -------------------------------------------
function String_sprintf(ooo) { // @var_args Mix: sprintf format
                               // @ret String:
                               // @help: String#sprintf
                               // @desc: format string
    var next = 0, index = 0, args = arguments;

    return this.replace(_FORMAT, _parse);

    function _parse(_,        // @arg String: dummy
                    argIndex, // @arg String: matched arg index
                    flag,     // @arg String: flag (#|0| )
                    width,    // @arg String: width
                    prec,     // @arg String: precision
                    size,     // @arg String: dummy
                    types) {  // @arg String: types (%|i|d|u|o|x|X|f|c|s)

        if (types === "%") { // escape "%%" -> "%"
            return types;
        }
        index = argIndex ? parseInt(argIndex) : next++;

        var bits = _BITS[types], overflow, pad,
            rv = (args[index] === void 0) ? "" : args[index];

        bits & 0x0001 && (rv = parseInt(rv));
        bits & 0x0002 && (rv = parseFloat(rv));
        bits & 0x0003 && (rv = rv === rv ? rv : ""); // isNaN
        bits & 0x0004 && (rv = ((types === "s" ? rv : types) || "").toString());
        bits & 0x0020 && (rv = rv >= 0 ? rv : rv % 0x100000000 + 0x100000000);
        bits & 0x0300 && (rv = rv.toString(bits & 0x100 ? 8 : 16));
        bits & 0x0040 && flag === "#" && (rv = (bits & 0x100 ? "0" : "0x") + rv);
        bits & 0x0080 && prec && (rv = bits & 2 ? rv.toFixed(prec)
                                                : rv.slice(0, prec));
        bits & 0x6000 && (overflow = (typeof rv !== "number" || rv < 0));
        bits & 0x2000 && (rv = overflow ? "" : String.fromCharCode(rv));

        rv = bits & 0x1000 ? rv.toString().toUpperCase()
                           : rv.toString();
        // padding
        if (!(bits & 0x0800 || width === void 0 || rv.length >= width)) {
            pad = ((!flag || flag === "#") ? " " : flag).repeat(width - rv.length);
            rv  = ((bits & 0x0010 && flag === "0") && !rv.indexOf("-")) ?
                        "-" + pad + rv.slice(1) :
                        pad + rv;
        }
        return rv;
    }
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------

})(this.self || global, Monogram.wiz);
//}@sprintf

// --- test ------------------------------------------------

