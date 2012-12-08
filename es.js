// es.js: polyfill ECMAScript 262-3rd and 5th method and properties

//{@es
(function(global) { // @arg Global: window or global

function _polyfill() {
    if (!Object.keys) {
         Object.keys = Object_keys;     // Object.keys(obj:Mix):Array
    }

//{@ie8
    if (!Object.defineProperties) {
         Object.__defineProperty__ = Object.defineProperty; // keep original
         Object.defineProperty = Object_defineProperty; // Object.defineProperty
    }
    if (!Object.freeze) {
         Object.freeze = function(obj) {
         };
    }
//}@ie8

//{@ie8
    // --- force override Date#toJSON result ---
    // [IE8] (original) "2012-09-16T21:53:39Z"
    //       (fix to)   "2012-09-16T21:53:39.000Z" (supply Milliseconds)
    if (Date.prototype.toJSON && (new Date).toJSON().length < 24) {
        Date.prototype.toJSON = Date_toJSON;
    }
//}@ie8

    // --- ES5, ES6 Methods ---
    wiz(Date, {
        now:        Date_now            // Date.now():Integer
    });
    wiz(Date.prototype, {
        toJSON:     Date_toJSON         // Date#toJSON():JSONObject
    });
    wiz(Array, {
        of:         Array_of,           // Array.of(...:Mix):Array
        from:       Array_from,         // Array.from(list:FakeArray):Array
        isArray:    Array_isArray       // Array.isArray(mix:Mix):Boolean
    });
    wiz(Array.prototype, {
        map:        Array_map,          // [].map(fn:Function, that:this):Array
        forEach:    Array_forEach,      // [].forEach(fn:Function, that:this):void
        some:       Array_some,         // [].some(fn:Function, that:this):Boolean
        every:      Array_every,        // [].every(fn:Function, that:this):Boolean
        indexOf:    Array_indexOf,      // [].indexOf(mix:Mix, index:Integer = 0):Integer
        lastIndexOf:Array_lastIndexOf,  // [].lastIndexOf(mix:Mix, index:Integer = 0):Integer
        filter:     Array_filter,       // [].filter(fn:Function, that:this):Array
        reduce:     Array_reduce,       // [].reduce(fn:Function, init:Mix):Mix
        reduceRight:Array_reduceRight   // [].reduceRight(fn:Function, init:Mix):Mix
    });
    wiz(String.prototype, {
        trim:       String_trim,        // "".trim():String
        repeat:     String_repeat,      // "".repeat(count:Integer):String
        reverse:    String_reverse      // "".reverse():String
    });
    wiz(Number, {
        isNaN:      Number_isNaN,,      // Number.isNaN(mix:Mix):Boolean
        isFinite:   Number_isFinite,    // Number.isFinite(mix:Mix):Boolean
        isInteger:  Number_isInteger,   // Number.isInteger(mix:Mix):Boolean
        toInteger:  Number_toInteger    // Number.toInteger(mix:Mix):Integer
    });
    wiz(Function.prototype, {
        bind:       Function_bind       // Function#bind():Function
    });
}

// --- library scope vars ----------------------------------
// none

// --- implement -------------------------------------------
function Object_keys(obj) { // @arg Object/Function/Array:
                            // @ret KeyStringArray: [key, ... ]
                            // @help: Object.keys
    var rv = [], key, i = 0;

//{@ie
    if (!obj.hasOwnProperty) {
        // [IE6][IE7][IE8] host-objects has not hasOwnProperty
        for (key in obj) {
            rv[i++] = key;
        }
    } else
//}@ie
    {
        for (key in obj) {
            obj.hasOwnProperty(key) && (rv[i++] = key);
        }
    }
    return rv;
}

//{@ie8
function Object_defineProperty(obj,          // @arg Object:
                               prop,         // @arg String: property name
                               descriptor) { // @arg Hash: { writable, get, set,
                                             //              value, enumerable,
                                             //              configurable }
                                             // @help: Object.defineProperty
    if (obj.nodeType) {
        Object.__defineProperty__(obj, prop, descriptor);
        return;
    }

    var type = 0;

    "value" in descriptor && (type |= 0x1); // data descriptor
    "get"   in descriptor && (type |= 0x2); // accessor descriptor
    "set"   in descriptor && (type |= 0x4); // accessor descriptor

    if (type & 0x1 && type & 0x6) {
        throw new TypeError("BAD_ARG");
    }
    type & 0x1 && (obj[prop] = descriptor.value);
    type & 0x2 && obj.__defineGetter__(prop, descriptor.get);
    type & 0x4 && obj.__defineSetter__(prop, descriptor.set);
}
//}@ie8

// --- ES5, ES6 --------------------------------------------
function Date_now() { // @ret Integer: milli seconds
                      // @desc: get current time
                      // @help: Date.now
    return +new Date();
}

function Array_isArray(mix) { // @arg Mix:
                              // @ret Boolean:
                              // @help: Array.isArray
    return Object.prototype.toString.call(mix) === "[object Array]";
}

function Array_map(fn,     // @arg Function:
                   that) { // @arg this(= undefined): fn this
                           // @ret Array: [element, ... ]
                           // @help: Array#map
    var i = 0, iz = this.length, rv = Array(iz);

    for (; i < iz; ++i) {
        if (i in this) {
            rv[i] = fn.call(that, this[i], i, this);
        }
    }
    return rv;
}

function Array_forEach(fn,     // @arg Function:
                       that) { // @arg this(= undefined): fn this
                               // @help: Array#forEach
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
        i in this && fn.call(that, this[i], i, this);
    }
}

function Array_some(fn,     // @arg Function:
                    that) { // @arg this(= undefined): fn this
                            // @ret Boolean:
                            // @help: Array#some
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
        if (i in this && fn.call(that, this[i], i, this)) {
            return true;
        }
    }
    return false;
}

function Array_every(fn,     // @arg Function:
                     that) { // @arg this(= undefined): fn this
                             // @ret Boolean:
                             // @help: Array#every
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
        if (i in this && !fn.call(that, this[i], i, this)) {
            return false;
        }
    }
    return true;
}

function Array_filter(fn,     // @arg Function:
                      that) { // @arg this(= undefined): fn this
                              // @ret Array: [value, ... ]
                              // @help: Array#filter
    var rv = [], value, i = 0, iz = this.length;

    for (; i < iz; ++i) {
        if (i in this) {
            value = this[i];
            if (fn.call(that, value, i, this)) {
                rv.push(value);
            }
        }
    }
    return rv;
}

function Array_reduce(fn,     // @arg Function:
                      init) { // @arg Mix(= undefined): initial value
                              // @ret Mix:
                              // @throw: Error("BAD_ARG")
                              // @help: Array#reduce
    return _Array_reduce(this, fn, init, false);
}

function Array_reduceRight(fn,     // @arg Function:
                           init) { // @arg Mix(= undefined): initial value
                                   // @ret Mix:
                                   // @throw: Error("BAD_ARG")
                                   // @help: Array#reduceRight
    return _Array_reduce(this, fn, init, true);
}

function _Array_reduce(that,   // @arg Array:
                       fn,     // @arg Function:
                       init,   // @arg Mix(= undefined): initial value
                       back) { // @arg Boolean(= false): true is reduce right
                               // @ret Mix:
    var rv,
        ate = 0, // ate init
        iz  = that.length,
        i   = back ? --iz : 0;

    if (init !== void 0) {
        rv = init;
        ++ate;
    }

    for (; back ? i >= 0 : i < iz; back ? --i : ++i) {
        if (i in that) {
            if (ate) {
                rv = fn(rv, that[i], i, that);
            } else {
                rv = that[i];
                ++ate;
            }
        }
    }
    if (!ate) {
        throw new Error("BAD_ARG");
    }
    return rv;
}

function Array_indexOf(mix,     // @arg Mix: search element
                       index) { // @arg Integer(= 0): from index
                                // @ret Integer: found index or -1
                                // @help: Array#indexOf
    var i = index || 0, iz = this.length;

    i = (i < 0) ? i + iz : i;
    for (; i < iz; ++i) {
        if (i in this && this[i] === mix) {
            return i;
        }
    }
    return -1;
}

function Array_lastIndexOf(mix,     // @arg Mix: search element
                           index) { // @arg Integer(= this.length): from index
                                    // @ret Integer: found index or -1
                                    // @help: Array#lastIndexOf
    var i = index, iz = this.length;

    i = (i < 0) ? i + iz + 1 : iz;
    while (--i >= 0) {
        if (i in this && this[i] === mix) {
            return i;
        }
    }
    return -1;
}

function String_trim() { // @ret String:
                         // @desc: trim both spaces
                         // @help: String#trim
    return this.replace(/^\s+/, "").
                replace(/\s+$/, "");
}

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

function Date_toJSON() { // @ret String: "2000-01-01T00:00:00.000Z"
                         // @help: Date#toJSON
    var dates = { y:  this.getUTCFullYear(),         // 1970 -
                  m:  this.getUTCMonth() + 1,        //    1 - 12
                  d:  this.getUTCDate() },           //    1 - 31
        times = { h:  this.getUTCHours(),            //    0 - 23
                  m:  this.getUTCMinutes(),          //    0 - 59
                  s:  this.getUTCSeconds(),          //    0 - 59
                  ms: this.getUTCMilliseconds() };   //    0 - 999

    return dates.y + "-" + (dates.m < 10 ? "0" : "") + dates.m + "-" +
                           (dates.d < 10 ? "0" : "") + dates.d + "T" +
                           (times.h < 10 ? "0" : "") + times.h + ":" +
                           (times.m < 10 ? "0" : "") + times.m + ":" +
                           (times.s < 10 ? "0" : "") + times.s + "." +
                           ("00" + times.ms).slice(-3) + "Z";
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

function Function_bind(context, // @arg that: context
                       ooo) {   // @var_args Mix: arguments
                                // @ret Function:
                                // @help: Function#bind
    var rv, that = this,
        args = Array.prototype.slice.call(arguments, 1),
        fn = function() {};

    rv = function(ooo) { // @var_args Mix: bound arguments
        return that.apply(this instanceof fn ? this : context,
                    Array.prototype.concat.call(
                            args,
                            Array.prototype.slice.call(arguments)));
    };
    fn.prototype = that.prototype;
    rv.prototype = new fn();
    return rv;
}

function wiz(object, extend, override) {
    for (var key in extend) {
        (override || !(key in object)) && Object.defineProperty(object, key, {
            configurable: true, writable: true, value: extend[key]
        });
    }
}

// --- export ---
_polyfill();

})(this.self || global);
//}@es

