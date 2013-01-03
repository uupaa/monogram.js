// polyfill.es6.js: polyfill ECMAScript 262-6th method and properties

//{@es
(function(global) {

function _polyfill() {
    // --- ES6 Methods ---
    wiz(Array, {
        of:         Array_of,           // Array.of(...:Mix):Array
        from:       Array_from,         // Array.from(list:FakeArray):Array
    });
    wiz(String.prototype, {
        repeat:     String_repeat,      // "".repeat(count:Integer):String
        reverse:    String_reverse      // "".reverse():String
    });
    wiz(Number, {
        isNaN:      Number_isNaN,       // Number.isNaN(mix:Mix):Boolean
        isFinite:   Number_isFinite,    // Number.isFinite(mix:Mix):Boolean
        isInteger:  Number_isInteger,   // Number.isInteger(mix:Mix):Boolean
        toInteger:  Number_toInteger    // Number.toInteger(mix:Mix):Integer
    });
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Array_of(ooo) { // @var_args Mix: values
                         // @ret MixArray:
                         // @desc: Array.of(1, 2, 3) -> [1, 2, 3]
                         // @help: Array.of
    return Array.prototype.slice.call(arguments);
}

function Array_from(fakeArray) { // @arg FakeArray: Arguments or NodeList
                                 // @ret Array/NodeArray:
                                 // @help: Array.from
    var rv = [], i = 0, iz = fakeArray.length;

    for (; i < iz; ++i) {
        rv.push(fakeArray[i]);
    }
    return rv;
}

function Number_isNaN(mix) { // @arg Mix:
                             // @ret Boolean:
                             // @help: Number.isNaN
    return typeof mix === "number" && global.isNaN(mix);
}

function Number_isFinite(mix) { // @arg Mix:
                                // @ret Boolean:
                                // @help: Number.isFinite
    return typeof mix === "number" && global.isFinite(mix);
}

function Number_isInteger(mix) { // @arg Mix:
                                 // @ret Boolean:
                                 // @desc: is integer
                                 // @help: Number.isInteger
    return typeof mix === "number" && global.isFinite(mix) &&
                  mix > -0x20000000000000 &&
                  mix <  0x20000000000000 &&
                  Math.floor(mix) === mix;
}

function Number_toInteger(mix) { // @arg Mix:
                                 // @ret Integer:
                                 // @desc: to integer
                                 // @help: Number.toInteger
    var num = +mix;

    if (num !== num) { // isNaN(num)
        return +0;
    }
    if (num === 0 || !global.isFinite(num)) {
        return num;
    }
    return (num < 0 ? -1 : 1) * Math.floor(Math.abs(num));
}

function String_repeat(count) { // @arg Integer: repeat count. negative is 0
                                // @ret String: repeated string
                                // @desc: repeat strings
                                // @help: String#repeat
    return (this.length && count > 0) ? Array((count + 1) | 0).join(this) : "";
}

function String_reverse() { // @ret String:
                            // @desc: reverse characters
                            // @help: String#reverse
    return this.split("").reverse().join("");
}

// --- build -----------------------------------------------
function wiz(object, extend, override) {
    for (var key in extend) {
        (override || !(key in object)) && Object.defineProperty(object, key, {
            configurable: true, writable: true, value: extend[key]
        });
    }
}

// --- export ----------------------------------------------
_polyfill();

})(this.self || global);
//}@es

// --- test ------------------------------------------------
