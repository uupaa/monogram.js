// logic.type.js: type detection

//{@type
(function(global) {

// --- header ----------------------------------------------
// Type(mix):String
Type.name = "Type";
Type.prototype.constructor = Type;
Type.add     = add;     // Type.add({ fullTypeName: shortTypeName, ... }):void
Type.complex = complex; // Type.complex(arg1:String/Object = undefined, arg2:String/Number = undefined):Integer

// --- library scope vars ----------------------------------
var _strict = (function() { return !this; })(),
    _alias = {
        "NodeList": "list",
        "Arguments": "list",
        "NamedNodeMap": "attr",
        "HTMLCollection": "list",
        "CSSStyleDeclaration": "style"
    };

// --- implement -------------------------------------------
function Type(mix) { // @arg Mix: search
                     // @ret TypeString:
                     // @help: Type
                     // @desc: get type_name and ClassName.
    var rv, type;

    rv = mix === null   ? "null"
       : mix === void 0 ? "undefined"
       : mix === global ? "global"
       : mix.nodeType   ? "node"
       : "";

    if (rv) {
        return rv;
    }
    if (mix.constructor && mix.constructor.name) {
        return mix.constructor.name; // "Await", "Type", ...
    }
    // typeof primitive -> "number", "string", "boolean"
    type = typeof mix;
    if (type !== "object") {
        return type;
    }

    // Object.prototype.toString.call(Hoge) -> "[object Hoge]"
    // (new Hoge).constructor.name -> "Hoge" (except IE)
    // (new Hoge).constructor + "" -> "[object Hoge]" or "function Hoge()..."
    type = Object.prototype.toString.call(mix);
    if (type === "[object Object]") {
        rv = mix.constructor.name;
        if (!rv) {
            type = mix.constructor + "";
        }
    }
    if (!rv) {
        rv = ( /^\[object (\w+)\]$/.exec(type)   ||
               /^\s*function\s+(\w+)/.exec(type) || ["", ""] )[1];
    }

    if (!rv || rv === "Object") {
        if (mix[_strict ? "" : "callee"] ||
            typeof mix.item === "function") {
            return "list"; // Arguments
        }
    }
    if (rv in _alias) {
        return _alias[rv];
    }
    return rv ? rv.toLowerCase() : "object";
}

function add(obj) { // @arg Object: { fullTypeName: shortTypeName, ... }
                    // @help: Type.add
    for (var key in obj) {
        _alias[ "[object " + key + "]" ] = obj[key];
    }
}

function complex(arg1,   // @arg String/Object(= undefined):
                 arg2) { // @arg String/Number(= undefined):
                         // @ret Integer: 1 ~ 4
                         // @help: Type.complex
                         // @desc: detect argument combinations
    //  [1][get all items]  Type.complex() -> 1
    //  [2][get one item]   Type.complex(key:String) -> 2
    //  [3][set one item]   Type.complex(key:String, value:Mix) -> 3
    //  [4][set all items]  Type.complex({ key: value:Mix, ... }) -> 4

    return arg1 === void 0 ? 1
         : arg2 !== void 0 ? 3
         : arg1 && typeof arg1 === "string" ? 2 : 4;
}

// --- build -----------------------------------------------
//{@ie
if (!Date.name) { // JavaScript Lv0
    Date.name = "Date";
    Array.name = "Array";
    Number.name = "Number";
    RegExp.name = "RegExp";
    String.name = "String";
    Boolean.name = "Boolean";
    Function.name = "Function";
    Error.name = "Error";
    TypeError.name = "TypeError";
    SyntaxError.name = "SyntaxError";
}
//}@ie

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Type: Type };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Type = Type;

})(this.self || global);
//}@type

