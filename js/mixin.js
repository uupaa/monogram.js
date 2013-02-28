// mixin.js: mixin and wiz function

//{@mixin
(function(global) {

// --- header ----------------------------------------------
// Monogram.wiz(base:Object/Function, extend:Object, override:Boolean = false):Object/Function
// Monogram.mixin(base:Object/Function, extend:Object, override:Boolean = false):Object/Function
// Monogram.args(arg:Object/Function/undefined, defaults:Object):Object
// Monogram.require(src:String)

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function wiz(base,       // @arg Object/Function:
             extend,     // @arg Object:
             override) { // @arg Boolean(= false): override
                         // @ret Object/Function:
                         // @help: Monogram.wiz
                         // @desc: prototype extend without enumerability,
                         //        mixin with "invisible" magic.
                         //        do not look prototype chain.
    override = override || false;

//{@ie
    if (!Object.defineProperty) {
        return _mixin(base, extend, override);
    }
//}@ie
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
    return base;
}

function mixin(base,       // @arg Object/Function: base object. { key: value, ... }
               extend,     // @arg Object: key/value object. { key: value, ... }
               override) { // @arg Boolean(= false): override
                           // @ret Object/Function: base
                           // @help: Monogram.mixin
                           // @desc: mixin values. do not look prototype chain.
    override = override || false;

//{@ie
    if (!Object.keys) {
        return _mixin(base, extend, override);
    }
//}@ie
    var key, keys = Object.keys(extend), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if (override || !(key in base)) {
            base[key] = extend[key];
        }
    }
    return base;
}

//{@ie
function _mixin(base, extend, override) {
    for (key in extend) {
        if (override || !(key in base)) {
            base[key] = extend[key];
        }
    }
    return base;
}
//}@ie

function args(arg,        // @arg Object/Function/undefined: { argument-name: value, ... }
              defaults) { // @arg Object: default argument. { argument-name: value, ... }
                          // @ret Object: arg
                          // @help: Monogram.args
                          // @desc: supply default argument values
    return args ? mixin(args, defaults)
                : defaults;
}

function require(src) {
    var node = document.createElement("script");
    node.src = src;
    node.onload = function() {
        console.log(src + " loaded");
    };
    document.head.appendChild(node);
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
global.Monogram || (global.Monogram = {});
global.Monogram.wiz = wiz;
global.Monogram.mixin = mixin;
global.Monogram.args = args;
if (global.document) {
    global.Monogram.require = require;
} else if (typeof module !== "undefined") { // is modular
    global.Monogram.require = global.require;
}

})(this.self || global);
//}@mixin

