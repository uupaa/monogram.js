// logic.type.js: type detection, assertion, structured clone and dump

//{@type
(function(global) {

// --- header ----------------------------------------------
                                // Type(mix):String
Type.alias      = Type_alias;   // Type.alias({ fullTypeName: shortTypeName, ... }):void
Type.complex    = Type_complex; // Type.complex(arg1:String/Object = undefined, arg2:String/Number = undefined):Integer
Type.allow      = Type_allow;   // Type.allow(name:String, mix:Mix, judge:Function/Boolean/TypeNameString):void
Type.deny       = Type_deny;    // Type.deny(name:String, mix:Mix, judge:Function/Boolean/TypeNameString):void
Type.dump       = Dump;         // Type.dump(mix:Mix, spaces:Integer = 4, depth:Integer = 5):String
Type.cast       = Cast;         // Type.cast(mix:Attr/Hash/List/FakeArray/Style/DateString/Mix):Object/Array/Date/Mix
Type.cast.attr  = Cast_attr;    // Type.cast.attr(mix:NamedNodeMap):Object
Type.cast.style = Cast_style;   // Type.cast.style(mix:CSSStyleDeclaration):Object
Type.clone      = Clone;        // Type.clone(mix:Mix, depth:Integer = 0, hook:Function = null):Mix

Type.name       = "Type";
Type.dump.name  = "Type.dump";
Type.cast.name  = "Type.cast";
Type.clone.name = "Type.clone";

// --- library scope vars ----------------------------------
var _strict = (function() { return !this; })(), // true is strict mode
    _alias = {
        "NodeList": "List",
        "Arguments": "List",
        "NamedNodeMap": "Attr",
        "HTMLCollection": "List",
        "StaticNodeList": "List", // [IE8]
        "CSSStyleDeclaration": "Style",
    },
    _prettyPrint = /Chrome\//.test((global.navigator || "").userAgent);

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

function Type_alias(obj) { // @arg Object: { RawTypeName: TypeName, ... }
                           // @help: Type.alias
                           // @desc: add type alias
    for (var key in obj) {
        _alias[ "[object " + key + "]" ] = obj[key];
    }
}

function Type_complex(arg1,   // @arg String/Object(= undefined):
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

function Type_deny(name,    // @arg String: argument name, function spec
                   mix,     // @arg Mix: value
                   judge) { // @arg Function/Boolean/TypeNameString:
                            // @help: Type.deny
                            // @desc: raise an assertion in a type match
    Type_allow(mix, judge, name, true);
}

function Type_allow(name,         // @arg String: argument name, function spec
                    mix,          // @arg Mix: value
                    judge,        // @arg Function/Boolean/InterfaceNameString/TypeNameString:
                                  //          types: "Global/List/Node"
                                  //                 "Null/Undefined/Boolean/Number/String"
                                  //                 "Date/Object/Array/Function/RegExp/Array"
                    __negate__) { // @hidden Boolean(= false):
                                  // @help: Type.allow
                                  // @desc: raise an assertion in a type mismatch
    __negate__ = __negate__ || false;

    var assert = false; // origin = "";

    if (judge == null) { // Type.allow(mix, undefined or null) -> nop
        return;
    }

    switch (typeof judge) {
    // judge fn(mix):boolean value
    case "function":
        assert = !(judge(mix) ^ __negate__);
        break;

    // judge boolean value
    case "boolean":
        assert = !(judge ^ __negate__);
        break;

    // judge type
    case "string":
        assert = !(judge.split("/").some(function(type) {
/*
            if (mix) {
                if (Monogram.Interface && Monogram.Interface.has(type)) {
                    // http://uupaa.hatenablog.com/entry/2012/10/05/173226
                    origin = "interface";
                    return _judgeInterface(mix, Monogram.Interface.getSpec(type));
                }
                if (Monogram.Class && Monogram.Class.has(type)) {
                    return true;
                }
            }
 */
            return _judgeType(mix, type);
        }) ^ __negate__);
        break;
    default:
        throw new TypeError("BAD_ARG");
    }
    if (assert) { // http://uupaa.hatenablog.com/entry/2011/11/18/115409
        debugger;
        try {
            var caller   = _strict ? null : (arguments.callee || 0).caller,
                nickname = caller ? _nickname(caller) : "???",
                asserter = __negate__ ? "Type.deny" : "Type.allow",
                msg      = "";

            msg = _msg(name, caller, nickname, asserter);

/*
            if (origin === "interface" && Monogram.Interface) {
                msg += "\ninterface " + judge + " "
                     + Monogram.Dump(Monogram.Interface[judge]) + "\n";
            }
 */
            throw new TypeError(msg);
        } catch (o_o) {
            console.log(_prettyPrint ? o_o.stack.replace(/at eval [\s\S]+$/m, "")
                                     : o_o + "");
            throw new TypeError("ASSERTION");
        }
    }

    function _msg(name, caller, nickname, asserter) {
        var rv = "", help = "",
            line   = ">>> " + nickname + " in " + asserter + "(";
            indent = Array(line.length + 1).join(" "); // String#repeat

        if ((global.Monogram || {}).Help) {
            help = Monogram.Help.url(caller);
        }
        rv = help + "\n\n" +
             line +
             name + ", " + judge + ")\n" +
             indent + Array(name.length + 1).join("~") + "\n" + // String#repeat
             indent + Dump(mix, 0) + "\n";
        return rv;
    }
}

/*
function _judgeInterface(mix, spec) {
    return Hash.every(spec, function(type, key) {
        if (key in mix) { // mix has key
            return spec[key].split("/").some(function(type) {
                if (type in Monogram.Interface) {
                    return _judgeInterface(mix[key], Monogram.Interface[type]);
                }
                return _judgeType(mix[key], type);
            });
        }
        return false;
    });
}
 */

function _judgeType(mix, type) {
    type = type.toLowerCase();
    if (type === "mix") {
        return true;
    }
    if (mix == null && type === mix + "") { // "null" or "undefined"
        return true;
    }
    return type === "void" ? mix === void 0
         : type === Type(mix).toLowerCase();
}

// --- Type.dump -------------------------------------------
function Dump(mix,     // @arg Mix: data
              spaces,  // @arg Integer(= 4): spaces, -1, 0 to 8
              depth) { // @arg Integer(= 5): max depth, 0 to 100
                       // @ret String:
                       // @help: Type.dump
                       // @desc: Dump Object
    spaces = spaces === void 0 ? 4 : spaces;
    depth  = depth || 5;

//{@debug
    //mm.deny("spaces", spaces, (spaces < -1 || spaces > 8  ));
    //mm.deny("depth",  depth,  (depth  <  1 || depth  > 100));
//}@debug

    return _recursiveDump(mix, spaces, depth, 1);
}

function _recursiveDump(mix,    // @arg Mix: value
                        spaces, // @arg Integer: spaces
                        depth,  // @arg Integer: max depth
                        nest) { // @arg Integer: nest count from 1
                                // @ret String:
                                // @inner:
    function _dumpArray(mix) {
        if (!mix.length) {
            return "[]";
        }
        var ary = [], i = 0, iz = mix.length;

        for (; i < iz; ++i) {
            ary.push(indent + _recursiveDump(mix[i], spaces, depth, nest + 1)); // recursive call
        }
        return "[" + lf + ary.join("," + lf) +
                     lf + _repeat(" ", spaces * (nest - 1)) + "]";
    }

    function _dumpObject(mix) {
        var ary = [], key, minify = spaces === -1,
            keys = Object.keys(mix).sort(), i = 0, iz = keys.length,
            skip = /^__[\w]+__$/;

        if (!iz) {
            return _getClassOrFunctionName(mix) + "{}"; // empty member
        }
        for (; i < iz; ++i) {
            key = keys[i];
            if (!skip.test(key)) {
                ary.push(indent + (minify ? (      key +  ':')
                                          : ('"' + key + '":')) + sp +
                         _recursiveDump(mix[key], spaces, depth, nest + 1)); // recursive call
            }
        }
        return _getClassOrFunctionName(mix) +
                    "{" + lf + ary.join("," + lf) +
                          lf + _repeat(" ", spaces * (nest - 1)) + "}";

        function _getClassOrFunctionName(mix) {
            if (typeof mix === "function") { // mix is function
                return _nickname(mix) + "()" + sp;
            }
            // Class name detection
            if (mix.constructor && mix.constructor.name &&
                mix.constructor.name !== "Object") {
                return "mm." + mix.constructor.name + sp;
            }
            return "";
        }
    }

    function _dumpNode(node) { // @arg: Node:
                               // @ret: String: "<body>"
                               //               "<div body>div:nth-child(1)>div>"
                               // @ref: HTMLElement#path
        var name = node.nodeName ? node.nodeName.toLowerCase() : "",
            roots = /^(?:html|head|body)$/;

        if (typeof node.path === "function") {
            // /^<(\w+) ?(.*)?>$/.exec( "<div body>div:nth-child(1)>div>" )
            return "<" + name + (roots.test(name) ? "" : " " + node.path()) + ">";
        }
        return name ? '<' + name + '>'
                    : node === document ? '<document>'
                                        : '<node>';
    }

    if (depth && nest > depth) {
        return "...";
    }

    var lf = spaces > 0 ? "\n" : "", // line feed
        sp = spaces > 0 ? " "  : "", // a space
        indent = _repeat(" ", spaces * nest);

    switch (Type(mix)) {
    case "Null":
    case "Global":
    case "Number":
    case "Boolean":
    case "Undefined":   return "" + mix;
    case "Date":        return mix.toJSON();
    case "Node":        return _dumpNode(mix);
    case "List":
    case "Array":       return _dumpArray(mix);
    case "RegExp":      return "/" + mix.source + "/";
    case "Hash":        return _dumpObject(mix.valueOf());
    case "Object":
    case "Function":    return _dumpObject(mix);
    case "String":      return '"' + _toJSONEscapedString(mix) + '"';
    case "Attr":        return _dumpObject(Cast_attr(mix));
    case "Style":       return _dumpObject(Cast_style(mix));
    }
    return "";
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
                return "\\u00" +
                       ("0" + _.charCodeAt(0).toString(16)).slice(-2);
            });
}

function _nickname(fn) { // copy from Function#nickname
    var name = fn.name || (fn + "").split("\x28")[0].trim().slice(9);

    return name ? name.replace(/^mm_/, "mm.") : "";
}

function _repeat(chr, count) { // copy from String#repeat
    count = count | 0;
    return (chr.length && count > 0) ? Array(count + 1).join(chr) : "";
}

// --- Type.cast -------------------------------------------
function Cast(mix) { // @arg Attr/Hash/List/FakeArray/Style/DateString/Mix:
                     // @ret Object/Array/Date/Mix:
                     // @help: Type.cast
                     // @desc: remove the characteristic
    switch (Type(mix)) {
    case "Attr":    return Cast_attr(mix);   // Type.cast(Attr) -> Object
    case "Hash":    return mix.valueOf();    // Type.cast(Hash) -> Object
    case "List":    return Array.from(mix);  // Type.cast(List) -> Array
    case "Style":   return Cast_style(mix);  // Type.cast(Style) -> Object
    case "String":  return Date.from(mix) || mix; // Type.cast(DateString) -> Date/String
    }
    return mix;
}

function Cast_attr(mix) { // @arg Attr: NamedNodeMap
                          // @ret Object:
                          // @inner:
    var rv = {}, i = 0, attr;

    for (; attr = mix[i++]; ) {
        rv[attr.name] = attr.value;
    }
    return rv;
}

function Cast_style(mix) { // @arg Style: CSSStyleDeclaration
                           // @ret Object:
                           // @inner:
    var rv = {}, key, value, i = 0, iz = mix.length;

    if (iz) { // [Firefox][WebKit][IE]
        for (; i < iz; ++i) {
            key = mix.item(i);
            value = mix[key];
            if (value && typeof value === "string") { // skip methods
                rv[key] = value;
            }
        }
    } else {
//{@opera
        for (key in mix) {
            value = mix[key];
            if (value && typeof value === "string") {
                rv[key] = value;
            }
        }
//}@opera
    }
    return rv;
}

// --- Type.clone -----------------------------------------------
function Clone(mix,    // @arg Mix: source object
               depth,  // @arg Integer(= 0): max depth, 0 is infinity
               hook) { // @arg Function(= null): handle the unknown object
                       // @ret Mix: copied object
                       // @throw: TypeError("DataCloneError: ...")
                       // @help: Type.clone
                       // @desc: Object with the reference -> deep copy
                       //        Object without the reference -> shallow copy
                       //        do not look prototype chain.
    return _recursiveClone(mix, depth || 0, hook, 0);
}

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
    if (mix instanceof Error) {
        return new mix.constructor(mix.message);
    }
    // --- Node, Attr, Style, Host Objects ---
    if (mix.nodeType) {
        return mix.cloneNode(true);
    }
    if (mix instanceof NamedNodeMap) {
        return Cast.attr(mix);
    }
    if (mix instanceof CSSStyleDeclaration) {
        return Cast.style(mix);
    }
    // --- ArrayLike(Arguments, NodeList, HTMLCollection) Object ---
    if ("length" in mix && typeof mix.item === "function") {
        for (rv = [], iz = mix.length; i < iz; ++i) {
            rv[i] = _recursiveClone(mix[i], depth, hook, nest + 1);
        }
        return rv;
    }
    if (hook) {
        return hook(mix, depth, hook, nest);
    }
    return mix;
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
<!DOCTYPE html><html><head><meta charset="utf-8"><script src="logic.type.js"></script>
<script>

    if (this.require) {
        var Type = require("../js/logic.type").Type;
    } else {
        var Type = Monogram.Type;
    }

    console.log("Basic types ---");
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

    console.log("Global, List, Arguments ---");
    (function args(global) {
        console.log( Type(global)    === "Global" );
        console.log( Type(arguments) === "List" );
        console.log( Type(arguments, true) === "Arguments" );
    })(this.self || global);

    console.log("DOM ---");
    if (this.document) {
        console.log( Type(document.body) === "Node" );

        console.log("NodeList ---");
        if (document.querySelectorAll) {
            console.log( Type(document.querySelectorAll("*")) === "List" );
            console.log( Type(document.querySelectorAll("*"), true) === "NodeList" ); // [IE8] "StaticNodeList"
        }

        console.log("Attr ---");
        console.log( Type(document.body.attributes) === "Attr" );
        console.log( Type(document.body.attributes, true) === "NamedNodeMap" );
        console.log("HTMLCollections/NodeList ---");
        console.log( Type(document.getElementsByTagName("*")) === "List" );
        console.log( Type(document.getElementsByTagName("*"), true) === "NodeList" ) // [Firefox][IE] "HTMLCollection", [WebKit] "NodeList"

        console.log("Style ---");
        if (this.getComputedStyle) {
            console.log( Type(getComputedStyle(document.body)) === "Style" );
            console.log( Type(getComputedStyle(document.body), true) === "CSSStyleDeclaration" );
        }
    }

    (function(global) {
        console.log( Type.clone(null)    === null );
        console.log( Type.clone(void 0)  === undefined );
        console.log( Type.clone(true)    === true );
        console.log( Type.clone(false)   === false );
        console.log( Type.clone(123)     === 123 );
        console.log( Type.clone(Infinity)=== Infinity );
        console.log( Type.clone(NaN)+""  === NaN+"");
        console.log( Type.clone("a")     === "a" );
        console.log((Type.clone(/a/)+"") ===(/a/+""));
        console.log((Type.clone([1])+"") ===([1]+""));
        console.log( Type.clone({}) );
        console.log( Type.clone({a:1,b:{c:{d:2}}}) );
        console.log( Type.clone(new Date()) );
        console.log( Type.clone(function a(){}) );

        // --- other and host objects ---
        console.log( Type.clone(new Error()) );
        console.log( Type.clone(new TypeError("!!"))+"" === new TypeError("!!")+"" );

        (function(a, b, c) {
            try {
                console.log( Type.clone(arguments) ); // ArrayLike
            } catch (err) {
                console.log("catch DataCloneError: " + err);
            }
        })(1, 2, 3);
        (function(a, b, c) {
            try {
                console.log( Type.clone(global) ); // global
            } catch (err) {
                console.log("catch DataCloneError: " + err);
            }
        })();
        if (global.document) {
            global.onload = function() {
                console.log( Type.clone(document.body) );

                if (document.querySelectorAll) {
                    console.log( Type.clone(document.querySelector("*")) );
                    console.log( Type.clone(document.querySelectorAll("*")) );
                }

                console.log( Type.clone(document.body.attributes) );
                console.log( Type.clone(document.getElementsByTagName("*")) );

                if (global.getComputedStyle) {
                    console.log( Type.clone(getComputedStyle(document.body)) );
                }
            };
        }
    })(this.self || global);

</script></head><body></body></html>
 */

