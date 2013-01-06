// dev.prof.js

var prof; // global.prof - prof.js library namespace
          // @see: http://uupaa.hatenablog.com/entry/2012/10/31/221550

prof || (function(global) { // @arg Global: window or global

// need ES5 APIs:
//      Object.keys, Object.defineProperty,
//      Array.isArray, Array#forEach, Array#map, Array#some,
//      String#trim, String#repeat,
//      Date.now, JSON.stringify, Number.isInteger
//
// optional monogram.js APIs:
//      mm.Interface, mm.Class, mm.dump, mm.env, mm.every

// --- header ----------------------------------------------
prof            = prof_dump;    // prof(key:String = ""):Object/String/undefined
prof_dump.on    = prof_on;      // prof.on()
prof_dump.off   = prof_off;     // prof.off()
prof_dump.add   = prof_add;     // prof.add(...:String)
prof_dump.clear = prof_clear;   // prof.clear()

if (!Function.prototype.help) {
    wiz(Function.prototype,      "help", Function_help);
    wiz(Function.prototype.help, "add",  Function_help_add);
    wiz(Function.prototype.help, "url",  Function_help_url);
}

// --- library scope vars ----------------------------------
var _trace = true,
    _time_db = {}, // { key: { time, count }, ... }
    _spec_db = {}, // { key: { spec, owner, fns, args, rtype, owobj, fnobj, key }, ... }
                   //    spec  - String: 'String#hoge(a:Integer/String = ",", b:Array):String'
                   //    owner - String: owner object path string. "String.prototype"
                   //    fns   - StringArray: ["hoge", ...]
                   //    args  - ObjectArray: [ { arg: "a", type: "Integer/String", def: ",", var_args: false },
                   //                           { arg: "b", type: "Array", def: undefined, var_args: false } ]
                   //    rtype - String: result type. "String"
                   //    owobj - Object/Function: function owner object
                   //    fnobj - Function: detected function
                   //    key   - String: "owner.fn" or "owner.parent.fn"
    _mm_strict = (function(mix) { return mix; })(!this), // mm.strict:Boolean - true is strict mode
    _mm_help_db = [], // [ <url, rex>, ... ]
    _mm_type_alias_db = { // copy from monogram.js
        "NodeList": "list",
        "Arguments": "list",
        "NamedNodeMap": "attr",
        "HTMLCollection": "list",
        "CSSStyleDeclaration": "style"
    };

// --- implement -------------------------------------------
function prof_dump(key) { // @arg String(= ""): find key. "" is dump all
                          // @ret Object/String/undefined: { time, count }
                          // @help: prof
                          // @desc: dump profile data (paste to Excel sheet)
/* result format:

    function	time	count
    obj.method1	12345	1
    obj.method2	12345	1
    :
    function	time	count

 */
    if (key) {
        return _time_db[key]; // { time, count } or undefined
    }
    var rv = [], keys = Object.keys(_time_db).sort(),
        headerLine = ["function", "time", "count"].join("\t");

    rv.push(headerLine); // add header

    while (key = keys.shift()) {
        rv.push([key, _time_db[key].time, _time_db[key].count].join("\t"));
    }

    rv.push(headerLine); // add footer

    return "\n" + rv.join("\n") + "\n";
}

function prof_on() { // @help: prof#prof.on
                     // @desc: trace on
    _trace = true;
}

function prof_off() { // @help: prof#prof.off
                      // @desc: trace off
    _trace = false;
}

function prof_add(ooo) { // @var_args String: spec data
                         // @throw: TypeError("BAD_SPEC")
                         // @help: prof#prof.add
                         // @desc: stock spec, hook functions
/* input format:
prof.add(
    'obj.method1()',
    'obj.method2(arg1:String)',
    'obj.method3(arg1:String):String',
    'obj.method4(arg1:String = "\n"):String',
    'obj.method5(arg1:Array, arg2:Number/Boolean = false):Array',
    'obj.method6(...:Mix):Array',
    'obj.method6(ooo:Mix):Array' );
 */
    var i = 0, iz = arguments.length, spec;

    for (; i < iz; ++i) {
        spec = _parse(arguments[i].trim());
        spec.spec  = arguments[i];
        spec.owobj = global[spec.owner];
        if (spec.owobj) {
            spec.fnobj = _detectFunction(spec.owobj, spec.fns.concat());
            if (spec.fnobj) {
                spec.key = spec.owner + "." + spec.fns.join("."); // make path: "owner.function"

                _time_db[spec.key] = { time: 0, count: 0 };
                _spec_db[spec.key] = spec;

                _hook(spec);
                continue;
            }
        }
        global.console && global.console.log("NOT_FOUND: " + spec.spec);
    }

    function _detectFunction(owner, fns) { // drill down
        var fn = owner[fns.shift()];

        while (fns.length) {
            fn = fn[fns.shift()];
        }
        return fn;
    }
}

function prof_clear() { // @help: prof#prof.clear
                        // @desc: clear profile data, and unhook all functions
    for (var key in _spec_db) {
        _unhook(_spec_db[key]);
    }
    _spec_db = {};
    _time_db = {};
}

function _hook(spec) { // @arg Object: { `_spec_db properties` }
                       // @inner: hook function, arguments assert,
                       //         result type assert, trace,
                       //         profiling
    var owobj = spec.owobj, ary = spec.fns.concat(), fnname,
        args  = spec.args;

    while (ary.length > 1) {
        owobj = owobj[ary.shift()];
    }
    fnname = ary[0];

    // hook function
    owobj[fnname] = function __prof__() {

        var i = 0, iz = Math.max(arguments.length, args.length),
            now, result, last_args, overflow = false;

        // --- judge arguments and types ---
        for (; i < iz; ++i) {
            if (i in args) {
                last_args = args[i];
            } else if (last_args && last_args.var_args) {
                ;
            } else {
                overflow = true;
            }

            if (overflow) { // (
                _mm_allow(arguments[i], "", spec.spec, spec.spec.lastIndexOf(")"), 1);
            } else if (last_args.arg) {
                _mm_allow(arguments[i],
                          (last_args.var_args ||
                           last_args.def !== void 0) ? last_args.type + "/undefined"
                                                     : last_args.type,
                          spec.spec,
                          spec.spec.indexOf(last_args.arg + ":"),
                          last_args.arg.length + 1 + last_args.type.length);
            }
        }
        // --- trace group ---
        if (_trace && global.console && global.console.group) {
            global.console.group(spec.key);
        }
        now = Date.now();

        result = spec.fnobj.apply(spec.owobj, arguments); // [!]

        _time_db[spec.key].time += (Date.now() - now);
        _time_db[spec.key].count++;

        // --- trace group end ---
        if (_trace && global.console && global.console.groupEnd) {
            global.console.groupEnd();
        }
        // --- judge result type ---
        if (spec.rtype) {
            _mm_allow(result,
                      spec.rtype,
                      spec.spec, // ((
                      spec.spec.lastIndexOf(")") + 2, // "):"
                      spec.rtype.length);
        }
        return result;
    };

    wiz(owobj[fnname], "__SRC__", spec.fnobj);

    _adoptFunctions(owobj[fnname], spec.fnobj);
}

function _unhook(spec) { // @arg Object: { `_spec_db properties` }
                         // @inner: unhook function
    var owner = spec.owobj, ary = spec.fns.concat(), fnname;

    while (ary.length > 1) {
        owner = owner[ary.shift()];
    }
    fnname = ary[0];
    owner[fnname] = spec.fnobj; // revert

    _adoptFunctions(owner[fnname], spec.fnobj);
}

function _adoptFunctions(adoptiveOwner, // @arg Object/Function:
                         trueOwner) {   // @arg Function:
    for (var child in trueOwner) {
        if (typeof trueOwner[child] === "function") {
            adoptiveOwner[child] = trueOwner[child];
        }
    }
}

function _parse(str) { // @arg String: 'a.fn2(a:Integer/String = ",", b:Array):Object'
                       // @ret Object: { owner, fns, args, rtype }
                       //       owner - String: "a"
                       //       fns   - StringArray: ["fn2"]
                       //       args  - ObjectArray:
                       //               [ { arg: "a", type: "Integer/String", def: "," },
                       //                 { arg: "b", type: "Array", def: undefined    } ],
                       //       rtype - String: "Object"
                       // @throw: TypeError("BAD_SPEC")
                       // @inner: parse function syntax
    var rv = { owner: "", fns: [], args: [], rtype: "" },
        ary, index = str.indexOf("(");

    if (index < 0) {
        throw new TypeError("BAD_SPEC");
    }
    ary      = str.slice(0, index).replace("#", ".prototype.").split(".");
    rv.owner = ary.shift();
    rv.fns   = ary;
    str      = str.slice(index + 1);
    index    = str.lastIndexOf(")");
    if (index < 0) {
        throw new TypeError("BAD_SPEC");
    }
    rv.args  = _parseArgs(str.slice(0, index));
    rv.rtype = (str.slice(index + 1) || "").replace(/^:/, "");
    return rv;
}

function _parseArgs(str) { // @arg String: 'arg:Type/MoreType = defaultValue'
                           // @ret ObjectArray: [ { arg, type, def, var_args }, ... ]
                           // @inner: parse argument, type, default value

    var rv = [], ary = [], quoted = 0;

    // split commas
    //      split    'a:String = ",",   b:String'
    //       to    [ 'a:String = ","', 'b:String' ]
    str.split(/\s*,\s*/).forEach(function(value) {
        if (/"$/.test(value) && ++quoted > 1) { // combine a quart consecutive
            ary[ary.length - 1] += ("," + value);
            quoted = 0;
            return;
        }
        ary.push(value)
    });

    // parse
    //  "arg:Type/MoreType = def" -> { arg: "arg", type: "Type/MoreType", def = "def" }
    //  "...:Type"                -> { arg: "",    type: "Type", def: undefined }
    //  "ooo:Type"                -> { arg: "",    type: "Type", def: undefined }
    ary.map(function(value) {
        value.replace(/^(\w+|\.\.\.):([\w/]+)(?:\s*=\s*(.*))?$/,
                      function(_, arg, type, def) {
            if (arg === "..." || arg === "ooo") {
                rv.push({ arg: "...", type: type, def: void 0, var_args: true  });
            } else if (def === void 0) {
                rv.push({ arg: arg,   type: type, def: void 0, var_args: false });
            } else {
                rv.push({ arg: arg,   type: type, def: def,    var_args: false });
            }
        });
    });
    return rv;
}

// copy from monogram.js
function _mm_allow(mix,      // @arg Mix:
                   judge,    // @arg Function/Boolean/InterfaceNameString/TypeNameString:
                             //          types: "Primitive/Global/List/Node/Hash/Class"
                             //                 "null/undefined/Boolean/Number/Integer/String"
                             //                 "Date/Object/Array/Function/RegExp/CodedArray"
                   spec,     // @arg String:
                   pos,      // @arg Integer: arg position
                   length) { // @arg Integer: arg and type length
    var assert = false;

    if (judge == null) { // _mm_allow(mix, undefined or null) -> nop
        return;
    }
    assert = !judge.split("/").some(function(type) {
                if (mix) {
                    if (typeof mm !== "undefined") {
                        if (type in mm.Interface) {
                            return _judgeInterface(mix, mm.Interface[type]);
                        }
                        if (type in mm.Class) {
                            return true;
                        }
                    }
                }
                return _judgeType(mix, type);
            });
    if (assert) { // http://uupaa.hatenablog.com/entry/2011/11/18/115409
        debugger;
        try {
            var caller = _mm_strict ? null : (arguments.callee || 0).caller,
                indent = " ".repeat(pos + 4),
                help   = Function_help_url(caller) || "";

            throw new TypeError(help                        + "\n\n" +
                                ">>> " + spec               + "\n" +
                                indent + "~".repeat(length) + "\n" +
                                indent + _dump(mix));
        } catch (o_o) {
            if (typeof mm !== "undefined") {
                mm.log(mm.env.chrome ? o_o.stack.replace(/at eval [\s\S]+$/m, "")
                                     : o_o + "");
            } else {
                global.console && global.console.log(o_o + "");
            }
            throw new TypeError("ASSERTION");
        }
    }
}

function _dump(mix) {
    if (typeof mm !== "undefined") {
        return mm.dump(mix, 0);
    }
    return JSON.stringify(mix, function(k, v) {
        if (k === "") { return v; }
        switch (typeof v) {
        case "function": return "function " + (v.name || "") + "() {}";
        case "object": return JSON.stringify(v);
        }
        return "" + v;
    });
}

// copy from monogram.js
function _judgeInterface(mix, spec) {
    return mm.every(spec, function(type, key) {
        if (key in mix) { // mix has key
            return spec[key].split("/").some(function(type) {
                if (type in mm.Interface) {
                    return _judgeInterface(mix[key], mm.Interface[type]);
                }
                return _judgeType(mix[key], type);
            });
        }
        return false;
    });
}

// copy from monogram.js
function _judgeType(mix, type) {
    type = type.toLowerCase();
    if (type === "mix") {
        return true;
    }
    if (mix == null && type === mix + "") { // "null" or "undefined"
        return true;
    }
    return type === "void"      ? mix === void 0
         : type === "this"      ? !!mix.ClassName
         : type === "class"     ? !!mix.ClassName
         : type === "integer"   ? Number.isInteger(mix)
         : type === "primitive" ? mix == null || typeof mix !== "object"
         : type === "codedarray"? Array.isArray(mix) && !!mix.code // Array.isCodedArray
         : type === _mm_type(mix);
}

// copy from monogram.js
function _mm_type(mix) {
    var rv, type;

    rv = mix === null   ? "null"
       : mix === void 0 ? "undefined"
       : mix === global ? "global"
       : mix.nodeType   ? "node"
       : mix.ClassName  ? mix.ClassName
       : "";
    if (rv) {
        return rv;
    }
    type = typeof mix;
    if (type !== "object") {
        return type;
    }
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
        if (mix[_mm_strict ? "" : "callee"] ||
            typeof mix.item === "function") {
            return "list"; // Arguments
        }
    }
    if (rv in _mm_type_alias_db) {
        return _mm_type_alias_db[rv];
    }
    return rv ? rv.toLowerCase() : "object";
}

// copy from monogram.js
function Function_help(that) {
    that = that || this;
    var url = Function_help_url(that),
        src = that.__SRC__ ? that.__SRC__ : that;

    return url + "\n\n" + src + "\n\n" + url;
}

// copy from monogram.js
function Function_help_url(fn) {
    var src  = fn.__SRC__ ? fn.__SRC__ : fn,
        help = /@help:\s*([^ \n\*]+)\n?/.exec("\n" + src + "\n");

    return help ? _findHelp(help[1].trim()) : "";
}

function _findHelp(help) {
    var ary = _mm_help_db, i = 0, iz = ary.length, url, rex, m;

    for (; i < iz; i += 2) {
        url = ary[i];
        rex = ary[i + 1];
        m   = rex.exec(help);

        if (m) {
            return m[2] === "#" ? (url + m[1] + "#" + m[1] + ".prototype." + m[3])
                 : m[2] === "." ? (url + m[1] + "#" + m[1] + "."           + m[3])
                                : (url + m[1]);
        }
    }
    return "";
}

// copy from monogram.js
function Function_help_add(url, word) {
    if (typeof word === "string") {
        word = [word];
    }
    if (Array.isArray(word)) {
        word = RegExp("^(" + word.join("|") + ")(?:([#\\.])([\\w\\,]+))?$");
    }
    _mm_help_db.push(url, word);
}

function wiz(object, key, value) {
    Object.defineProperty(object, key, {
        configurable: true, writable: true, value: value
    });
}

})(this.self || global);
