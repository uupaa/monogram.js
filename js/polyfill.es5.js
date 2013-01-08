// polyfill.es5.js: polyfill ECMAScript 262-3rd and 5th method and properties
// @need: Monogram.wiz (in mixin.js)

//{@es
(function(global) {

// --- header ----------------------------------------------
function _polyfill(wiz) {
//{@ie
    if (!Object.keys) {
         Object.keys = Object_keys; // Object.keys(obj:Mix):Array
    }
    if (Object.defineProperty && !Object.defineProperties) { // [IE8]
        Object.__defineProperty__ = Object.defineProperty; // keep native
    }
    if (!Object.defineProperty) { // for legacy browser
         Object.defineProperty = Object_defineProperty; // Object.defineProperty
    }
    if (!Object.freeze) {
         Object.freeze = function(obj) {};
    }
    // --- force override Date#toJSON result ---
    // [IE8] (original) "2012-09-16T21:53:39Z"
    //       (fix to)   "2012-09-16T21:53:39.000Z" (supply Milliseconds)
    if (Date.prototype.toJSON && (new Date).toJSON().length < 24) {
        Date.prototype.toJSON = Date_toJSON;
    }
//}@ie

    wiz(Date, {
        now:        Date_now            // Date.now():Integer
    });
    wiz(Date.prototype, {
        toJSON:     Date_toJSON         // Date#toJSON():JSONObject
    });
    wiz(Array, {
        isArray:    Array_isArray       // Array.isArray(mix:Mix):Boolean
    });
    wiz(Array.prototype, {
        forEach:    Array_forEach,      // [].forEach(fn:Function, that:this):void
        map:        Array_map,          // [].map(fn:Function, that:this):Array
        some:       Array_some,         // [].some(fn:Function, that:this):Boolean
        every:      Array_every,        // [].every(fn:Function, that:this):Boolean
        indexOf:    Array_indexOf,      // [].indexOf(mix:Mix, index:Integer = 0):Integer
        lastIndexOf:Array_lastIndexOf,  // [].lastIndexOf(mix:Mix, index:Integer = 0):Integer
        filter:     Array_filter,       // [].filter(fn:Function, that:this):Array
        reduce:     Array_reduce,       // [].reduce(fn:Function, init:Mix):Mix
        reduceRight:Array_reduceRight   // [].reduceRight(fn:Function, init:Mix):Mix
    });
    wiz(String.prototype, {
        trim:       String_trim         // "".trim():String
    });
    wiz(Function.prototype, {
        bind:       Function_bind,      // Function#bind():Function
        nickname:   Function_nickname   // Function#nickname(defaultName = ""):String
    });
    // alias
    Array.prototype.each = Array_forEach;
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
//{@ie
function Object_keys(obj) { // @arg Object/Function/Array:
                            // @ret KeyStringArray: [key, ... ]
                            // @help: Object.keys
    var rv = [], key, i = 0;

    // [IE6][IE7][IE8] host-objects has not hasOwnProperty
    if (!obj.hasOwnProperty) {
        for (key in obj) {
            rv[i++] = key;
        }
    } else {
        for (key in obj) {
            obj.hasOwnProperty(key) && (rv[i++] = key);
        }
    }
    return rv;
}
//}@ie

//{@ie
function Object_defineProperty(obj,          // @arg Object:
                               prop,         // @arg String: property name
                               descriptor) { // @arg Hash: { writable, get, set,
                                             //              value, enumerable,
                                             //              configurable }
                                             // @ret Object:
                                             // @help: Object.defineProperty
    if (obj.nodeType && Object.__defineProperty__) { // [IE8]
        return Object.__defineProperty__(obj, prop, descriptor); // call native
    }

    // data descriptor
    "value" in descriptor && (obj[prop] = descriptor.value);

    // accessor descriptor
    descriptor.get && obj.__defineGetter__(prop, descriptor.get);
    descriptor.set && obj.__defineSetter__(prop, descriptor.set);
    return obj;
}
//}@ie

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

function Function_nickname(defaultName) { // @arg String(= ""): default nickname
                                          // @ret String: function name
                                          // @help: Function#nickname
                                          // @desc: get function name
   var name = this.name || (this + "").split("\x28")[0].trim().slice(9);

    return name ? name.replace(/^mm_/, "mm.") // mm_like -> mm.like
                : defaultName; // [IE][Opera<11]
}

// --- build -----------------------------------------------
_polyfill(global.Monogram.wiz);

// --- export ----------------------------------------------

})(this.self || global);
//}@es

