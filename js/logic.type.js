// logic.type.js: type detection

//{@type
(function(global) {

// --- header ----------------------------------------------
// Type(mix):String
Type.name = "Type";
Type.alias = alias;     // Type.alias({ fullTypeName: shortTypeName, ... }):void
Type.complex = complex; // Type.complex(arg1:String/Object = undefined, arg2:String/Number = undefined):Integer

// --- library scope vars ----------------------------------
var _strict = (function() { return !this; })(), // true is strict mode
    _alias = {
        "NodeList": "List",
        "Arguments": "List",
        "NamedNodeMap": "Attr",
        "HTMLCollection": "List",
        "StaticNodeList": "List", // [IE8]
        "CSSStyleDeclaration": "Style",
    };

// --- implement -------------------------------------------
function Type(mix,   // @arg Mix: search
              raw) { // @arg Boolean(= false): true is raw type
                     // @ret TypeString:
                     //     "Null"      - is null
                     //     "Undefined" - is undefined
                     //     "Global"    - is window or global
                     //     "Node"      - is Node
                     //     "Number"    - is Number
                     //     "Boolean"   - is Boolean
                     //     "String"    - is String
                     //     "Array"     - is Array
                     //     "Object"    - is Object
                     //     "RegExp"    - is RegExp
                     //     "Date"      - is Date
                     //     "Error"     - is Error
                     //     "TypeError" - is TypeError
                     //     "Await"     - is Await (user define Class)
                     //     "Type"      - is Type  (user define Class)
                     //     "Attr"      - is NamedNodeMap
                     //     "Style"     - is CSSStyleDeclaration
                     //     "List"      - is Arguments, NodeList, HTMLCollection
                     //     ...
                     // @help: Type
                     // @desc: get TypeName or ClassName.
    var rv, type, Class;

    rv = mix === null   ? "Null"
       : mix === void 0 ? "Undefined"
       : mix === global ? "Global"
       : mix.nodeType   ? "Node"
       : "";

    if (rv) {
        return rv;
    }
    // detect [[Class]] from object.constructor.name
    if (mix.constructor) {
        Class = mix.constructor.name;
        if (Class && Class !== "Object") {
            return raw ? Class
                       : _alias[Class] || Class; // "Await", "Type", "List", ...
        }
    }
    // Object.prototype.toString.call(Hoge) -> "[object Hoge]"
    // new Hoge().constructor.name -> "Hoge" (except IE)(JavaScript Lv0)
    // new Hoge().constructor + "" -> "[object Hoge]" or "function Hoge()..."
    Class = Object.prototype.toString.call(mix);
    if (Class === "[object Object]") {
        rv = mix.constructor.name;
        if (!rv) {
            Class = mix.constructor + "";
        }
    }
    if (!rv) {
        rv = ( /^\[object (\w+)\]$/.exec(Class)   ||
               /^\s*function\s+(\w+)/.exec(Class) || ["", ""] )[1];
    }

    if (!rv || rv === "Object") {
        if (mix[_strict ? "" : "callee"] || typeof mix.item === "function") {
            return raw ? "Arguments" : "List";
        }
    }
    if (rv) {
        return raw ? rv
                   : _alias[rv] || rv;
    }
    return "Object";
}

function alias(obj) { // @arg Object: { RawTypeName: TypeName, ... }
                      // @help: Type.alias
                      // @desc: add type alias
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

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Type: Type };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Type = Type;

})(this.self || global);
//}@type

// --- test ------------------------------------------------
/*
    var Type = require("./logic.type").Type;

    console.log( Type(null)     === "Null" );
    console.log( Type(void 0)   === "Undefined" );
    console.log( Type(true)     === "Boolean" );
    console.log( Type(123)      === "Number" );
    console.log( Type("a")      === "String" );
    console.log( Type(/a/)      === "RegExp" );
    console.log( Type([1])      === "Array"  );
    console.log( Type(new Date) === "Date" );
    console.log( Type(new Error) === "Error" );
    console.log( Type(function a() {}) === "Function" );

    (function args(global) {
        console.log( Type(global)    === "Global" );
        console.log( Type(arguments) === "List" );
    })(this.self || global);
 */
/*
<!DOCTYPE html><html><head><meta charset="utf-8"><script src="logic.type.js"></script>
<script>
    if (this.require) {
        var Type = require("./logic.type").Type;
    } else {
        var Type = Monogram.Type;
    }

    console.log( Type(null)     === "Null" );
    console.log( Type(void 0)   === "Undefined" );
    console.log( Type(true)     === "Boolean" );
    console.log( Type(123)      === "Number" );
    console.log( Type("a")      === "String" );
    console.log( Type(/a/)      === "RegExp" );
    console.log( Type([1])      === "Array"  );
    console.log( Type({})       === "Object" );
    console.log( Type(new Date) === "Date" );
    console.log( Type(new Error) === "Error" );
    console.log( Type(function a() {}) === "Function" );

    (function args(global) {
        console.log( Type(global)    === "Global" );
        console.log( Type(arguments) === "List" );
        console.log( Type(arguments, true) === "Arguments" );
    })(this.self || global);

    // --- for DOM ---
    if (this.document) {
        console.log( Type(document.body) === "Node" );

        if (document.querySelectorAll) {
            console.log( Type(document.querySelectorAll("*")) === "List" );
            console.log( Type(document.querySelectorAll("*"), true) === "NodeList" ); // [IE8] "StaticNodeList"
        }

        console.log( Type(document.body.attributes) === "Attr" );
        console.log( Type(document.body.attributes, true) === "NamedNodeMap" );
        console.log( Type(document.getElementsByTagName("*")) === "List" );
        console.log( Type(document.getElementsByTagName("*"), true) === "NodeList" ) // [Firefox][IE] "HTMLCollection", [WebKit] "NodeList"

        if (this.getComputedStyle) {
            console.log( Type(getComputedStyle(document.body)) === "Style" );
            console.log( Type(getComputedStyle(document.body), true) === "CSSStyleDeclaration" );
        }
    }

</script></head><body></body></html>
 */

