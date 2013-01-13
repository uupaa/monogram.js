// logic.clone.js: structured clone
// @need: Monogram.Cast (in logic.cast.js)

//{@clone
(function(global) {

// --- header ----------------------------------------------
function Clone(mix,    // @arg Mix: source object
               depth,  // @arg Integer(= 0): max depth, 0 is infinity
               hook) { // @arg Function(= null): handle the unknown object
                       // @ret Mix: copied object
                       // @throw: TypeError("DataCloneError: ...")
                       // @help: Clone
                       // @desc: Object with the reference -> deep copy
                       //        Object without the reference -> shallow copy
                       //        do not look prototype chain.
    return _recursiveClone(mix, depth || 0, hook || null, 0);
}

function CloneEx(mix,    // @arg Mix: source object
                 depth,  // @arg Integer(= 0): max depth, 0 is infinity
                 hook) { // @arg Function(= null): handle the unknown object
                         // @ret Mix: copied object
                         // @throw: TypeError("DataCloneError: ...")
                         // @help: CloneEx
                         // @desc: Object with the reference -> deep copy
                         //        Object without the reference -> shallow copy
                         //        do not look prototype chain.
    function extend(mix, depth, hook, nest) {
        var rv, key, keys, i = 0, iz;

        // Node, HTMLElement
        if (mix.nodeType) {
            return mix.cloneNode(true);
        }
        if (mix instanceof Error) {
            return new mix.constructor(mix.message);
        }
        if (mix instanceof NamedNodeMap) {
            return Monogram.Cast.attr(mix);
        }
        if (mix instanceof CSSStyleDeclaration) {
            return Monogram.Cast.style(mix);
        }
        // --- ArrayLike(Arguments, NodeList, HTMLCollection) Object ---
        if ("length" in mix && typeof mix.item === "function") {
            for (rv = [], iz = mix.length; i < iz; ++i) {
                rv[i] = _recursiveClone(mix[i], depth, hook, nest + 1);
            }
            return rv;
        }
    }

    return _recursiveClone(mix, depth || 0, extend, 0);
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function _recursiveClone(mix, depth, hook, nest) { // @inner:
    if (depth && nest > depth) {
        throw new TypeError("DataCloneError: " + mix);
    }
    if (mix == null) { // null or undefined
        return mix;
    }
    var rv, key, keys, i = 0, iz;

    switch (mix.constructor.name) {
    case "Function":
        return mix; // not clone
    case "String":
    case "Number":
    case "Boolean":
        return mix.valueOf(); // not String(value), not Number(value)
    case "RegExp":
        return RegExp(mix.source, (mix + "").slice(mix.source.length + 2));
    case "Date":
        return new Date(+mix);
    case "Array":
        for (rv = [], iz = mix.length; i < iz; ++i) {
            rv[i] = _recursiveClone(mix[i], depth, hook, nest + 1);
        }
        return rv;
    case "Object":
        keys = Object.keys(mix);
        for (rv = {}, iz = keys.length; i < iz; ++i) {
            key = keys[i];
            rv[key] = _recursiveClone(mix[key], depth, hook, nest + 1);
        }
        return rv;
    case "File":
    case "Blob":
    case "FileList":
    case "ImageData":
    case "ImageBitmap":
        // TODO: impl
        break;
    }
    if (hook) {
        return hook(mix, depth, hook, nest);
    }
    throw new TypeError("DataCloneError: " + mix);
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Clone: Clone, CloneEx: CloneEx };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Clone   = Clone;
global.Monogram.CloneEx = CloneEx;

})(this.self || global);
//}@clone

// --- text ------------------------------------------------
/*
<!DOCTYPE html><html><head><meta charset="utf-8">
<script src="../js/logic.type.js"></script>
<script src="../js/logic.cast.js"></script>
<script src="../js/logic.clone.js"></script>
<script>

if (global.require) {
    var Type    = require("../js/logic.type").Type;
    var Cast    = require("../js/logic.cast").Cast;
    var Clone   = require("../js/logic.clone").Clone;
    var CloneEx = require("../js/logic.clone").CloneEx;
} else {
    var Type    = Monogram.Type;
    var Cast    = Monogram.Cast;
    var Clone   = Monogram.Clone;
    var CloneEx = Monogram.CloneEx;
}

(function(global) {
    console.log( Clone(null)    === null );
    console.log( Clone(void 0)  === undefined );
    console.log( Clone(true)    === true );
    console.log( Clone(false)   === false );
    console.log( Clone(123)     === 123 );
    console.log( Clone(Infinity)=== Infinity );
    console.log( Clone(NaN)+""  === NaN+"");
    console.log( Clone("a")     === "a" );
    console.log((Clone(/a/)+"") ===(/a/+""));
    console.log((Clone([1])+"") ===([1]+""));
    console.log( Clone({}) );
    console.log( Clone({a:1,b:{c:{d:2}}}) );
    console.log( Clone(new Date()) );
    console.log( Clone(function a(){}) );

    // --- other and host objects ---
    console.log( CloneEx(new Error()) );
    console.log( CloneEx(new TypeError("!!"))+"" === new TypeError("!!")+"" );

    (function(a, b, c) {
        try {
            console.log( CloneEx(arguments) ); // ArrayLike
        } catch (err) {
            console.log("catch DataCloneError: " + err);
        }
    })(1, 2, 3);
    (function(a, b, c) {
        try {
            console.log( Clone(global) ); // global
        } catch (err) {
            console.log("catch DataCloneError: " + err);
        }
    })();
    if (global.document) {
        global.onload = function() {
            console.log( CloneEx(document.body) );

            if (document.querySelectorAll) {
                console.log( CloneEx(document.querySelector("*")) );
                console.log( CloneEx(document.querySelectorAll("*")) );
            }

            console.log( CloneEx(document.body.attributes) );
            console.log( CloneEx(document.getElementsByTagName("*")) );

            if (global.getComputedStyle) {
                console.log( CloneEx(getComputedStyle(document.body)) );
            }
        };
    }
})(this.self || global);

</script></head><body></body></html>

 */

