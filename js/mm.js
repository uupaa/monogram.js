// mm.js

// @need: Monogram.mixin (in mixin.js)
//        Monogram.args (in mixin.js)
//        Monogram.wiz (in mixin.js)
//        Monogram.Env (in logic.env.js)
//        Monogram.UID (in logic.uid.js)
//        Monogram.Hash (in extend.functions.js)
//        Monogram.Type (in logic.type.js)

var mm; // global.mm - monogram.js library name space

mm || (function(global, mixin, Hash, Type) {

// --- header ----------------------------------------------

// --- Typical types ---
//  Mix: Any type
//  Hash: key / value store
//  Array: Dense or Sparse Array
//  Global: Window or Global Object
//  Integer: Number without a fractional
//  ModArray: Modified Array. Array + { key: value, ... }
//  Function: Executable Object
//  Primitive: undefined, null, Boolean, Number and String
//
mm = mixin(HashFactory, {             // mm(obj:Object/Hash):Hash
    api:        mm_api,             // mm.api(version:Integer = 0):Object/Function
    // --- mixin ---
    mixin:      global.Monogram.mixin, // mm.mixin(base:Object/Function, extend:Object, override:Boolean = false):Object/Function
    args:       global.Monogram.args,  // mm.args(arg:Object/Function/undefined, defaults:Object):Object
    wiz:        global.Monogram.wiz,   // mm.wiz(base:Object/Function, extend:Object, override:Boolean = false):void
    // --- match ---
    has:        mm_has,             // mm.has(data:Mix, find:Mix):Boolean
    like:       mm_like,            // mm.like(lval:Mix, rval:Mix):Boolean
    some:       mm_some,            // mm.some(data:Object/Function/Array/Hash, fn:Function):Boolean
    every:      mm_every,           // mm.every(data:Object/Function/Array/Hash, fn:Function):Boolean
    match:      mm_match,           // mm.match(data:Object/Function/Array/Hash, fn:Function):Mix/undefined
    filter:     mm_filter,          // mm.filter(data:Object/Function/Array/Hash, fn:Function):Array
    // --- format ---
    // --- iterate ---
    map:        mm_map,             // mm.map(data:Object/Function/Array/Hash, fn:Function):Array
    each:       mm_each,            // mm.each(data:Object/Function/Array/Hash, fn:Function):void
    // --- generate ---
    uid:        mm_uid,             // mm.uid(group:String = ""):Integer
    cast:       Type.cast,          // mm.cast(mix:Attr/Hash/List/FakeArray/Style/DateString/Mix):Object/Array/Date/Mix
    clone:      Type.clone,         // mm.clone(mix:Mix, depth:Integer = 0, hook:Function/undefined = undefined):Mix
    pair:       mm_pair,            // mm.pair(key:Object/Integer/String, value:Mix):Object
    pack:       mm_pack,            // mm.pack(data:Object/Function/Array/Hash, glue:String = ":", joint:String = ";"):String
    wrap:       mm_wrap,            // mm.wrap(mix:Mix):Function
    clean:      mm_clean,           // mm.clean(data:Object/Function/Array/Hash, only:String = ""):DenseObject
    // --- calculate ---
    // --- enumerate ---
    count:      mm_count,           // mm.count(data:Object/Function/Array/Hash):Object
    keys:       mm_keys,            // mm.keys(data:Object/Function/Array/Hash/Style/Node/Global):Array
    values:     mm_values,          // mm.values(data:Object/Function/Array/Hash/Style/Node/Global):Array
    // --- manipulate ---
    clear:      mm_clear,           // mm.clear(obj:Object/Function/Class/Hash):Object/Function/Class/Hash
    // --- type detection ---
    type:       Type,
    // --- utility ---
    nop:        mm_nop,             // mm.nop():void
    conv:       mm_conv,            // mm.conv(from:CaseInsensitiveString, to:CaseInsensitiveString):Object
                                    // mm.conv("Integer",    "HexString")  {     0 : "00" ..   255 : "ff"}
                                    // mm.conv("HexString",  "Integer")    {   "00":   0  ..   "ff": 255 }
                                    // mm.conv("Integer",    "ByteString") {     0 :"\00" ..   255 :"\ff"}
                                    // mm.conv("ByteString", "Integer")    {  "\00":   0  ..  "\ff": 255 }
                                    //                                     {"\f780": 128  .."\f7ff": 255 }
    dump:       Type.dump,          // mm.dump(mix:Mix, spaces:Integer = 4, depth:Integer = 5):String
    strict:     mm_wrap(!this)(),   // mm.strict:Boolean - true is strict mode
    // --- assert / debug ---
    say:        mm_say,             // mm.say(mix:Mix):Boolean
    alert:      mm_alert            // mm.alert(mix:Mix):Boolean
});
mm.env = new Monogram.Env();

// --- Class Hash ------------------------------------------
function HashFactory(obj) { // @arg Object/Hash:
                            // @ret Hash:
                            // @help: mm
    return obj instanceof Hash ? new Hash(Type.clone(obj)) // copy constructor
                               : new Hash(obj);
}

// --- library scope vars ----------------------------------
var _log_db  = [],
    _log_index = 0,
    _conv_db;

// --- implement -------------------------------------------
function mm_api(version) { // @arg Integer: API version
                           // @ret Object/Function:
                           // @help: mm.api
                           // @desc: API Versioning
    return mm_api["ver" + version] ? mm_api["ver" + version] : mm;
}

function Object_api(version) { // @arg Integer API version
                               // @ret Object/Function:
                               // @desc: API Versioning
    return this["ver" + version] ? this["ver" + version](this) : this;
}

// --- match ---
function mm_has(data,   // @arg Mix:
                find) { // @arg Mix: { key: value, ... }
                        // @ret Boolean:
                        // @help: mm.has
                        // @desc: has hash pair(s).
                        //        do not look prototype chain.
    return !mm && typeof (data || 0).has === "function" ? data.has(find)
                                                        : Hash.has(data, find);
}

function mm_like(lval,   // @arg Mix: left value
                 rval) { // @arg Mix: right value
                         // @ret Boolean: true is like value and like structures
                         // @help: mm.like
                         // @desc: Like and deep matching.
                         //        This function does not search inside the prototype chain of the object.
                         //     `` 類似検索と深度探索を行い、よく似ているオブジェクトなら true を返します。
                         //        Object のプロトタイプチェーンは辿りません
    return !mm && typeof (lval || 0).like === "function" ? lval.like(rval)
                                                         : Hash.like(lval, rval);
}

// --- iterate / enumerate ---
function mm_map(data, // @arg Object/Function/Array/Hash: data
                fn) { // @arg Function: callback function
                      // @ret Array: [result, ...]
                      // @help: mm.map
                      // @desc: mm#map, Array#map
    return !mm && typeof data.map === "function" ? data.map(fn)
                                                 : Hash.map(data, fn);
}

function mm_each(data, // @arg Object/Function/Array/Hash: data
                 fn) { // @arg Function: callback function
                       // @help: mm.each
                       // @desc: each object
    typeof !mm && data.each === "function" ? data.each(fn)
                                           : Hash.each(data, fn);
}

function mm_some(data, // @arg Object/Function/Array/Hash: data
                 fn) { // @arg Function: fn(value, key)
                       // @ret Boolean:
                       // @help: mm.some
                       // @desc: return true if the return fn(value, key) is truthy
    return !mm && typeof data.some === "function" ? data.some(fn)
                                                  : Hash.some(data, fn);
}

function mm_every(data, // @arg Object/Function/Array/Hash: data
                  fn) { // @arg Function: fn(value, key)
                        // @ret Boolean:
                        // @help: mm.every
                        // @desc: return false if the return fn(value, key) is falsy
    return !mm && typeof data.every === "function" ? data.every(fn)
                                                   : Hash.every(data, fn);
}

function mm_match(data, // @arg Object/Function/Array/Hash: data
                  fn) { // @arg Function: fn(value, key)
                        // @ret Mix/undefined:
                        // @help: mm.match
                        // @desc: return value if the return fn(value, key) is truthy
    return !mm && typeof data.match === "function" ? data.match(fn)
                                                   : Hash.filter(data, fn, true);
}

function mm_filter(data, // @arg Object/Function/Array/Hash: data
                   fn) { // @arg Function: fn(value, key)
                         // @ret Array:
                         // @help: mm.filter
                         // @desc: return array if the return fn(value, key) is truthy
    return !mm && typeof data.filter === "function" ? data.filter(fn)
                                                    : Hash.filter(data, fn, false);
}

function mm_count(data) { // @arg Object/Function/Array/Hash: data
                          // @ret Object: { value: value-count, ... }
                          // @help: mm.count
                          // @desc: count the number of values
    return !mm && typeof data.count === "function" ? data.count()
                                                   : Hash.count(data);
}

function mm_keys(data) { // @arg Object/Function/Array/Hash/Style/Node/Global:
                         // @ret Array: [key, ...]
                         // @help: mm.keys
                         // @desc: enumerate keys
    return !mm && typeof data.keys === "function" ? data.keys()
                                                  : Object.keys(data);
}

function mm_values(data) { // @arg Object/Function/Array/Hash/Style/Node/Global:
                           // @ret Array: [value, ...]
                           // @help: mm.values
                           // @desc: enumerate values
    return !mm && typeof data.values === "function" ? data.values()
                                                    : Hash.values(data);
}

function mm_clear(data) { // @arg Object/Function/Class/Hash:
                          // @ret Object/Function/Class/Hash:
                          // @help: mm.clear
                          // @desc: clear
    return !mm && typeof data.clear === "function" ? data.clear()
                                                   : Hash.clear(data);
}

// --- utility ---
function mm_nop() { // @help: mm.nop
                    // @desc: no operation function
}

function mm_uid(group) { // @arg String(= ""): uid group name.
                         // @ret Integer: unique number, at 1 to 0x1fffffffffffff
                         // @help: mm.uid
                         // @desc: get unique id
    return global.Monogram.UID.create(group);
}

function mm_conv(from, // @arg CaseInsensitiveString: "Integer", "HexString", "ByteString"
                 to) { // @arg CaseInsensitiveString: "Integer", "HexString", "ByteString"
                       // @ret Object:
                       // @help: mm.conv
                       // @desc: convert tables
//{@debug
    mm.allow("from", from, ["integer", "hexstring", "bytestring"].has(from.toLowerCase()));
    mm.allow("to",   to,   ["integer", "hexstring", "bytestring"].has(  to.toLowerCase()));
//}@debug

    var num = { "integer": 1, hexstring: 2, bytestring: 4 },
        code = (num[from.toLowerCase()]) << 4 |
               (num[  to.toLowerCase()]);

    _conv_db || _mm_conv_init();

    return _conv_db[code] || {};

    function _mm_conv_init() {
        _conv_db = { 0x12: {}, 0x21: {}, 0x14: {}, 0x41: {} };

        var i = 0, hex, bin;

        for (; i < 0x100; ++i) {
            hex = (i + 0x100).toString(16).slice(1);
            bin = String.fromCharCode(i);
            _conv_db[0x12][i]   = hex;    // {   255 :   "ff" }
            _conv_db[0x21][hex] = i;      // {   "ff":   255  }
            _conv_db[0x14][i]   = bin;    // {   255 : "\255" }
            _conv_db[0x41][bin] = i;      // { "\255":   255  }
        }
        // http://twitter.com/edvakf/statuses/15576483807
        for (i = 0x80; i < 0x100; ++i) { // [Webkit][Gecko]
            _conv_db[0x41][String.fromCharCode(0xf700 + i)] = i; // "\f780" -> 0x80
        }
    }
}

function mm_pair(key,     // @arg Object/Integer/String: key
                 value) { // @arg Mix: value
                          // @ret Object: { key: value }
                          // @help: mm.pair
                          // @desc: make pair
    if (typeof key === "number" || typeof key === "string") {
        var rv = {};

        rv[key] = value;
        return rv;
    }
    return key; // Object or Object Like Object
}

function mm_pack(data,    // @arg Object/Function/Array/Hash:
                 glue,    // @arg String(= ":"):
                 joint) { // @arg String(= ";"):
                          // @ret String:
                          // @help: mm.pack
                          // @desc: pack Object to String
    return typeof data.pack === "function" ? data.pack(glue, joint)
                                           : Hash.pack(data, glue, joint);

}

function mm_wrap(mix) { // @arg Mix: result value
                        // @ret Function:
                        // @help: mm.wrap
                        // @desc: `function-producing` function
    return function() {
        return mix;
    };
}

function mm_clean(data,   // @arg Object/Function/Array/Hash:
                  only) { // @arg String(= ""): typeof filter
                          // @ret DenseObject: new Object as dense object
                          // @help: mm.clean
                          // @desc: convert sparse Object to dense Object, trim undefined, null and NaN value
                          //        ``疎なオブジェクト(sparse object)を密なオブジェクト(dense object)に変換します。
                          //          undefined, null および NaN の値を除去します
    return typeof data.clean === "function" ? data.clean(only)
                                            : Hash.clean(data, only);
}

// --- assert / debug ---
function mm_say(mix) { // @arg Mix:
                       // @ret Boolean: true
                       // @help: mm.say
                       // @desc: console.log(mm.dump(mix)) short hand
    global.console && global.console.log(Type.dump(mix));
    return true;
}

function mm_alert(mix) { // @args Mix:
                         // @ret Boolean: true
                         // @help: mm.alert
                         // @desc: alert(Type.dump(mix)) short hand
    alert(Type.dump(mix));
    return true;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { mm: HashFactory };
}

})(this.self || global, Monogram.mixin, Monogram.Hash, Monogram.Type);

