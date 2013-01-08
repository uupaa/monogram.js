// mixin.js: mixin and wiz function

//{@mixin
(function(global) {

// --- header ----------------------------------------------
// global.Mix(base:Object/Function, extend:Object, override:Boolean = false):Object/Function
// global.Wiz(base:Object/Function, extend:Object, override:Boolean = false):void

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Mix(base,       // @arg Object/Function: base object. { key: value, ... }
             extend,     // @arg Object: key/value object. { key: value, ... }
             override) { // @arg Boolean(= false): override
                         // @ret Object/Function: base
                         // @help: Mix
                         // @desc: mixin values. do not look prototype chain.
    override = override || false;

    var key, keys = Object.keys(extend), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if (override || !(key in base)) {
            base[key] = extend[key];
        }
    }
    return base;
}

function Wiz(base,       // @arg Object/Function:
             extend,     // @arg Object:
             override) { // @arg Boolean(= false): override
                         // @help: Wiz
                         // @desc: prototype extend without enumerability,
                         //        mixin with "invisible" magic.
                         //        do not look prototype chain.
    for (var key in extend) {
        if (override || !(key in base)) {
            Object.defineProperty(base, key, {
                configurable: true, // false is immutable
                enumerable: false,  // false is invisible
                writable: true,     // false is read-only
                value: extend[key]
            });
        }
    }
}

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
                                             // @help: Object.defineProperty
    if (obj.nodeType && Object.__defineProperty__) { // [IE8]
        Object.__defineProperty__(obj, prop, descriptor); // call native
        return;
    }

    // data descriptor
    "value" in descriptor && (obj[prop] = descriptor.value);

    // accessor descriptor
    descriptor.get && obj.__defineGetter__(prop, descriptor.get);
    descriptor.set && obj.__defineSetter__(prop, descriptor.set);
}
//}@ie

// --- polyfill ---
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
//}@ie

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Mix: Mix, Wiz: Wiz };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Mix = Mix;
global.Monogram.Wiz = Wiz;

})(this.self || global);
//}@mixin

