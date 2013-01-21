// extend.functions.js:
// @need: Monogram.wiz (in mixin.js)
//        Monogram.Type (in logic.type.js)

(function(global, wiz) {

// --- header ----------------------------------------------
function Hash(obj) { // @arg Object:
                     // @help: Hash
    Hash.ownProps(this, obj);
}
Hash.name   = "Hash";
Hash.nop    = function() {};
Hash.has    = Hash_has;
Hash.like   = Hash_like;
Hash.map    = Hash_map;
Hash.each   = Hash_each;
Hash.some   = Hash_some;
Hash.every  = Hash_every;
Hash.filter = Hash_filter;
Hash.clean  = Hash_clean;
Hash.clear  = Hash_clear;
Hash.count  = Hash_count;
Hash.values = Hash_values;
Hash.pack   = Hash_pack;
Hash.ownProps = Hash_ownProps;

wiz(Hash.prototype, {
    constructor:Hash,
    // --- mixin ---
    mix:        function(extend, override) {
                                  mixin(this, extend.valueOf(), override);/* @help: Hash#mix  */
                                  return this; },
    // --- match ---
    has:        function(find)  { return Hash_has(this, find.valueOf());  /* @help: Hash#has   */ },
    like:       function(value) { return Hash_like(this, value.valueOf());/* @help: Hash#like  */ },
    some:       function(fn)    { return Hash_some(this, fn);             /* @help: Hash#some  */ },
    every:      function(fn)    { return Hash_every(this, fn);            /* @help: Hash#every */ },
    match:      function(fn)    { return Hash_filter(this, fn, true);     /* @help: Hash#match */ },
    filter:     function(fn)    { return Hash_filter(this, fn, false);    /* @help: Hash#filter*/ },
    // --- iterate ---
    map:        function(fn)    { return Hash_map(this, fn);              /* @help: Hash#map   */ },
    each:       function(fn)    {        Hash_each(this, fn);             /* @help: Hash#each  */ },
    // --- generate ---
    clone:      function()      { return new Hash(this.valueOf());        /* @help: Hash#copy  */ },
    pack:       function(glue, joint) {
                                  return Hash_pack(this, glue, joint);    /* @help: Hash#pack  */ },
    clean:      function(only)  { return new Hash(Hash_clean(this, only));/* @help: Hash#clean */ },
    // --- enumerate ---
    count:      function()      { return Hash_count(this);                /* @help: Hash#count */ },
    keys:       function()      { return Object.keys(this);               /* @help: Hash#keys  */ },
    values:     function()      { return Hash_values(this);               /* @help: Hash#values*/ },
    // --- manipulate ---
    get:        function(key)   { return this[key];                       /* @help: Has#get    */ },
    set:        function(key, value) {
                                  this[key] = value; return this;         /* @help: Has#set    */ },
    clear:      function()      { return Hash_clear(this);                /* @help: Hash#clear */ },
    // --- utility ---
    help:       function()      { return Hash.nop(Hash); },
    freeze:     function()      {        Object.freeze(this); return this;/* @help: Hash#freeze */},
    toJSON:     function()      { return JSON.stringify(this.valueOf());  /* @help: Hash#toJSON */},
    valueOf:    function()      { return Hash_ownProps({}, this); },
    toString:   function()      { return JSON.stringify(this.valueOf()); }
}, true); // override (Object#valueOf, Object#toString)


wiz(Date, {
//  now:        Date_now,           // [ES5]  Date.now():Integer
    from:       Date_from           //        Date.from(dateString:String):Date
});
wiz(Date.prototype, {
    diff:       Date_diff,          //        Date#diff(diffDate:Date/Integer):Object { days, times, toString }
    dates:      Date_dates,         //        Date#dates():Object { y, m, d }
    times:      Date_times,         //        Date#times():Object { h, m, s, ms }
    format:     Date_format         //        Date#format(format:String = "I"):String
//  toJSON:     Date_toJSON         // [ES5]  Date#toJSON():JSONObject
});
wiz(Array, {
//  of:         Array_of,           // [ES6]  Array.of(...:Mix):MixArray
//  from:       Array_from,         // [ES6]  Array.from(list:FakeArray):Array
    range:      Array_range,        //        Array.range(begin:Integer, end:Integer, filterOrStep:Function/Integer = 1):Array
    toArray:    Array_toArray       //        Array.toArray(mix:Mix/Array):Array
//  isArray:    Array_isArray       // [ES5]  Array.isArray(mix:Mix):Boolean
});
wiz(Array.prototype, {
    // --- match ---
    has:        Array_has,          //        [].has(find:Mix/MixArray):Boolean
    match:      Array_match,        //        [].match(fn:Function, that:this):Mix
//  indexOf:    Array_indexOf,      // [ES5]  [].indexOf(mix:Mix, index:Integer = 0):Integer
//  lastIndexOf:Array_lastIndexOf,  // [ES5]  [].lastIndexOf(mix:Mix, index:Integer = 0):Integer
    // --- format ---
    at:         Array_at,           //        [].at(format:String):String
    // --- filter ---
    sieve:      Array_sieve,        //        [].sieve():Object - { values:DenseArray, dups:DenseArray }
    unique:     Array_unique,       //        [].unique():DenseArray
    reject:     Array_reject,       //        [].reject(fn:Function):DenseArray
    select:     Array_select,       //        [].select(fn:Function):DenseArray
//  filter:     Array_filter,       // [ES5]  [].filter(fn:Function, that:this):Array
    flatten:    Array_flatten,      //        [].flatten():DenseArray
    // --- iterate ---
//  map:        Array_map,          // [ES5]  [].map(fn:Function, that:this):Array
    each:       Array.prototype.forEach,
                                    //        [].each(fn:Function, that:this) - [alias]
//  some:       Array_some,         // [ES5]  [].some(fn:Function, that:this):Boolean
//  every:      Array_every,        // [ES5]  [].every(fn:Function, that:this):Boolean
//  forEach:    Array_forEach,      // [ES5]  [].forEach(fn:Function, that:this):void
//  reduce:     Array_reduce,       // [ES5]  [].reduce(fn:Function, init:Mix):Mix
//  reduceRight:Array_reduceRight,  // [ES5]  [].reduceRight(fn:Function, init:Mix):Mix
    // --- generate ---
    copy:       Array_copy,         //        [].copy(deep:Boolean = false):Array
    clean:      Array_clean,        //        [].clean(only:String = ""):DenseArray
//  toArray:    Array_toArray,      //        [].toArray():Array
    toHexString:Arrra_toHexString,  //        [].toHexString():String
    // --- calculate ---
    or:         Array_or,           //        [].or(merge:Array):Array
    and:        Array_and,          //        [].and(compare:Array):Array
    xor:        Array_xor,          //        [].xor(compare:Array):Array
    sum:        Array_sum,          //        [].sum():Number
    clamp:      Array_clamp,        //        [].clamp(low:Number, high:Number):Array
    nsort:      Array_nsort,        //        [].nsort(desc:Boolean = false):Array
    average:    Array_average,      //        [].average(median:Boolean = false):Number
    // --- enumerate ---
    count:      Array_count,        //        [].count():Object
    // --- manipulate ---
    fill:       Array_fill,         //        [].fill(value:Primitive/Object/Array/Date,
                                    //                from:Integer = 0, to:Integer = this.length):Array
    clear:      Array_clear,        //        [].clear():this
    shifts:     Array_shifts,       //        [].shifts():DenseArray
    remove:     Array_remove,       //        [].remove(find:Mix, all:Boolean = false):this
    replace:    Array_replace,      //        [].replace(find:Mix, value:Mix = null, all:Boolean = false):this
    // --- utility ---
    dump:       Array_dump,         //        [].dump():String
    choice:     Array_choice,       //        [].choice():Mix
    freeze:     Array_freeze,       //        [].freeze():ConstArray
    shuffle:    Array_shuffle,      //        [].shuffle():DenseArray
    first:      Array_first,        //        [].first(lastIndex:Integer = 0):Mix/undefined
    last:       Array_last          //        [].last(index:Integer = 0):Mix/undefined
});
wiz(String.prototype, {
    // --- match ---
    has:        String_has,         //        "".has(find:String, anagram:Boolean = false):Boolean
    // --- format ---
    at:         String_at,          //        "@@".at(...:Mix):String
    up:         String_up,          //        "".up(index:Integer = undedefind):String
    low:        String_low,         //        "".low(index:Integer = undedefind):String
    down:       String_low,         //        [alias]
//  trim:       String_trim,        // [ES5]  " trim both sp ".trim():String
    trims:      String_trims,       //        "-trim-".trims(chr:String):String
    trimQuote:  String_trimQuote,   //        "'quoted'".trimQuote():String
//  sprintf:    String_sprintf,     //        "%05s".format(...:Mix):String
    overflow:   String_overflow,    //        "".overflow(maxLength:Integer, ellipsis:String = "...",
                                    //                    affect:String = "left"):String
    removeTag:  String_removeTag,   //        "<tag></tag>".removeTag():String
    capitalize: String_capitalize,  //        "".capitalize():String
    // --- filter ---
    unique:     String_unique,      //        "abcabc".unique():String
    // --- iterate ---
    // --- generate ---
//  repeat:     String_repeat,      // [ES6]  "".repeat(count:Integer):String
    unpack:     String_unpack,      //        "key:value".unpack(glue:String = ":", joint:String = ";"):Object
    numbers:    String_numbers,     //        "1,2,3".numbers(joint:String = ","):NumberArray
//  reverse:    String_reverse,     // [ES6]  "".reverse():String
    toEntity:   String_toEntity,    //        "".toEntity():HTMLEntityString
    fromEntity: String_fromEntity,  //        "".fromEntity():String
    // --- calculate ---
    // --- enumerate ---
    count:      String_count,       //        "abc".count():Object
    // --- manipulate ---
    insert:     String_insert,      //        "".insert(str:String, index:Integer = 0):String
    remove:     String_remove,      //        "".remove(str:String, index:Integer = 0):String
    // --- utility ---
    crlf:       String_crlf,        //        "\r\n".crlf(trim:Boolean = false):StringArray
    exec:       String_exec         //        "".exec():Mix/undefined
});

//mixin(Number, {
//  isNaN:      Number_isNaN,       // [ES6]  Number.isNaN(mix:Mix):Boolean
//  isFinite:   Number_isFinite,    // [ES6]  Number.isFinite(mix:Mix):Boolean
//  isInteger:  Number_isInteger,   // [ES6]  Number.isInteger(mix:Mix):Boolean
//  toInteger:  Number_toInteger    // [ES6]  Number.toInteger(mix:Mix):Integer
//});
wiz(Number.prototype, {
    // --- format ---
    pad:        Number_pad,         //        0..pad(digits:Integer = 2, radix:Integer = 10):String
    // --- generate ---
    to:         Number_to,          //        0..to(end:Integer, filterOrStep:Integer = 1):Array
    // --- calculate ---
    rad:        Number_rad,         //        180..rad():Number    - 180..rad() === Math.PI
    deg:        Number_deg,         //        Math.PI.deg():Number - Math.PI.deg() === 180
    xor:        Number_xor,         //        0..xor(value:Integer):Integer
    frac:       Number_frac,        //        255..frac(range:Integer = 256):Number
    rand:       Number_rand,        //        100..rand():Integer/Number
    clamp:      Number_clamp,       //        0..clamp(low:Number, high:Number):Number
    // --- utility ---
    chr:        Number_chr,         //        0x32.chr():String
    ms:         Number_ms,          //        0..ms(fn_that:Function/Await/Array, ...):Integer
    wait:       Number_ms,          //        0..wait(fn_that:Function/Await/Array, ...):Integer [DEPRECATED]
    times:      Number_times        //        0..times(fn_that:Function/Array, ...):ResultMixArray
});
wiz(Function.prototype, {
//  bind:       Function_bind,      // [ES5]  fn#bind():Function
    nickname:   Function_nickname,  //        Function#nickname(defaultName = ""):String
    argsApply:  Function_argsApply  //        fn#argsApply(that, ...):Mix
});
wiz(RegExp, {
    esc:        RegExp_esc,         //        RegExp.esc(str:String):EscapedString
    DATE:       /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/
});             // [1]y    [2]m   [3]d   [4]h   [5]m   [6]s       [7]ms
wiz(RegExp.prototype, {
    flag:       RegExp_flag         //        /regexp/.flag(flag:String):RegExp
});

Math.PI2 = Math.PI * 2;             //        Math.PI2

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Date_from(date) { // @arg Date/String:
                           // @ret Date/null:
                           // @help: Date.from
                           // @desc: parse date string
    if (typeof date !== "string") {
        return date;
    }
    var m = RegExp.DATE.exec(date), d;

    if (m) {
        return new Date(Date.UTC(+m[1], +m[2] - 1,   +m[3], // Y, M, D
                                 +m[4], +m[5], +m[6], m[7] ? +m[7] : 0));
    }
    d = new Date(date);
    return isNaN(+d) ? null : d; // date.valueOf() -> NaN -> parse error
}

function Date_diff(diffDate) { // @arg Date/Integer: diff date
                               // @ret Object: { days, times, toString }
                               //    days - Integer: days
                               //    times - Object: Date#times result
                               //    toString - Function:
                               // @help: Date#diff
                               // @desc: date.diff(time_t) or date.diff(date)
    var span = Math.abs(+this - +diffDate),
        diff = new Date(span); // 1970-01-01 + span

    return {
        days: (span / 86400000) | 0,
        times: diff.times(),
        toString: function(format) { // @arg String(= "m:s.ms"): Date#format
            return diff.format(format || "m:s.ms");
        }
    };
}

function Date_dates() { // @ret Object: { y, m, d }
                        // @help: Date#dates
                        // @desc: get date info
    return { y:  this.getUTCFullYear(),         // 1970 -
             m:  this.getUTCMonth() + 1,        //    1 - 12
             d:  this.getUTCDate() };           //    1 - 31
}

function Date_times() { // @ret Object: { h, m, s, ms }
                        // @help: Date#times
                        // @desc: get time info
    return { h:  this.getUTCHours(),            //    0 - 23
             m:  this.getUTCMinutes(),          //    0 - 59
             s:  this.getUTCSeconds(),          //    0 - 59
             ms: this.getUTCMilliseconds() };   //    0 - 999
}

function Date_format(format) { // @arg String(= "I"): format("Y-M-D h:m:s.ms")
                               // @ret String: formated date string
                               // @help: Date#format
                               // @desc: format date
    var rv = [],
        ary = (format || "I").split(""), key, i = 0, iz = ary.length,
        iso = this.toJSON(),
        m   = iso.split(/[^\d]/),
        map = {
            I: iso,  d: (+this / 86400000) | 0,
            Y: m[0], M: m[1], D: m[2], h: m[3], m: m[4], s: m[5], ms: m[6]
        };

    for (; i < iz; ++i) {
        key = ary[i];
        if (key === "m" && ary[i + 1] === "s") { // "m" or "ms"
            key = "ms";
            ++i;
        }
        rv.push( map[ key ] || key );
    }
    return rv.join("");
}

function Array_range(begin,          // @arg Integer: begin number
                     end,            // @arg Integer: end number
                     filterOrStep) { // @arg Function/Integer(= 1): filter or skip number
                                     // @ret Array: [begne, ... end]
                                     // @see: Array.range, Number#to
                                     // @throw: Error("BAD_ARG")
                                     // @help: Array.range
                                     // @desc: range generator
    return (begin).to(end, filterOrStep); // Number#to
}

function Array_toArray(mix) { // @arg Mix/Array:
                              // @ret Array:
                              // @help: Array.toArray
    return Array.isArray(mix) ? mix : [mix];
}

function Arrra_toHexString() { // @ret String:
                               // @this: ByteArray:
                               // @help: Array#toHexString
    var rv = [], i = 0, iz = this.length;

    for (; i < iz; ++i) {
        rv[i] = (this[i] + 0x100).toString(16).slice(-2);
    }
    return rv.join("");
}

function Array_match(fn,     // @arg Function:
                     that) { // @arg this(= undefined): fn this
                             // @ret Mix/undefined:
                             // @help: Array#match
                             // @desc: return value if the return fn(value, key) is truthy.
    var i = 0, iz = this.length;

    for (; i < iz; ++i) {
        if (i in this && fn.call(that, this[i], i, this)) {
            return this[i];
        }
    }
    return;
}

function Array_at(format) { // @arg String: format with "@@"
                            // @ret String: "formatted string"
                            // @this: replacement arguments
                            // @desc: placeholder( "@@" ) replacement
                            // @help: Array#at
    var ary = this, i = 0;

    return format.replace(/@@/g, function() {
        return ary[i++];
    });
}

function Array_has(find) { // @arg Mix/MixArray: element or [element, ...]
                           // @ret Boolean:
                           // @desc: Array has all element(s)
                           // @help: Array#has
    if (Array.isArray(find)) {
        if (this.length < find.length) {
            return false;
        }
        return !_Array_compare(this, find, true).escaped;
    }
    return this.indexOf(find) >= 0;
}

function Array_copy(deep) { // @arg Boolean(= false): true is deep copy
                            // @help: Array#copy
                            // @desc: has non-copyable object -> shallow copy
                            //        copyable object -> deep copy
    return deep ? Monogram.Type.clone(this) // deep copy
                : this.concat(); // shallow copy
}

function Array_unique() { // @ret DenseArray: new Array has unique element(s)
                          // @help: Array#unique
                          // @desc: make array from unique element (trim null and undefined elements)
    return this.sieve().values;
}

function Array_clean(only) { // @arg String(= ""): typeof filter. "number", "string"
                             // @ret DenseArray: new array
                             // @help: Array#clean
                             // @desc: convert sparse array to dense array, trim undefined, null and NaN value
    only = only || "";

    var rv = [], value, i = 0, iz = this.length;

    for (; i < iz; ++i) {
        value = this[i];
        if (value === value && value != null) {
            if (!only || typeof value === only) {
                rv.push(value);
            }
        }
    }
    return rv;
}

/*
function Array_toArray() { // @ret Array:
                           // @help: Array#toArray
                           // @desc: array to array
                           // @see: NodeList#toArray, HTMLCollection#toArray
    return this;
}
 */

function Array_count() { // @ret Object: { value: value-count, ... }
                         // @help: Array#count
                         // @desc: count the number of values
    return Hash_count(this);
}

function Array_sieve() { // @ret Object: { values:DenseArray, dups:DenseArray }
                         // @help: Array#sieve
                         // @desc: sieve values, duplicate values
    var ary = this.clean(), values = [], dups = [], i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        values.indexOf(ary[i]) >= 0 ? dups.push(ary[i])
                                    : values.push(ary[i]);
    }
    return { values: values, dups: dups };
}

function Array_shifts() { // @ret Array: cloned new Array
                          // @help: Array#shifts
                          // @desc: shift all elements
    var rv = this.concat(); // shallow copy

    this.length = 0;
    return rv; // return all elements
}

function Array_remove(find,  // @arg Mix: find value
                      all) { // @arg Boolean(= false): true is find all elements
                             // @ret this:
                             // @help: Array#remove
                             // @desc: remove element(s)
    return this.replace(find, null, all);
}

function Array_replace(find,  // @arg Mix: find value
                       value, // @arg Mix(= null): replace value. null or undefined is remove
                       all) { // @arg Boolean(= false): true is find all elements
                              // @ret this:
                              // @help: Array#replace
                              // @desc: replace element(s)
    var index = 0, remove = value == null;

    while (index = this.indexOf(find, index) + 1) {
        remove ? this.splice(index - 1, 1)
               : this.splice(index - 1, 1, value);
        if (!all) {
            break;
        }
        --index;
    }
    return this;
}

function Array_shuffle() { // @ret DenseArray: new Array
                           // @help: Array#shuffle
                           // @desc: shuffle element(s)
    var rv = this.clean(), i = rv.length, j, k;

    if (i) {
        // Fisher-Yates
        while (--i) {
            j = (Math.random() * (i + 1)) | 0;
            if (i !== j) {
                k     = rv[i];
                rv[i] = rv[j];
                rv[j] = k;
            }
        }
    }
    return rv;
}

function Array_first(index) { // @arg Integer(= 0): index from first
                              // @ret Mix/undefined: element value
                              // @help: Array#first
                              // @desc: get value from first
    return this[index || 0];
}

function Array_last(lastIndex) { // @arg Integer(= 0): index from last
                                 // @ret Mix/undefined: element value
                                 // @help: Array#last
                                 // @desc: get value from last
    return this[this.length - (lastIndex || 0) - 1];
}

// --- calculate ---
function Array_sum() { // @ret Number: sum
                       // @desc: sum of numeric elements
                       // @help: Array#sum
    var rv = 0, ary = this.clean("number"), i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        rv += ary[i];
    }
    return rv;
}

function Array_dump() { // @ret String: [ 0x1234, 0x12, 0x0, ... ]
                        // @desc: Hex dump
                        // @help: Array#dump
    return this.clean("number").map(function(value) {
                return (value < 0 ? "-0x" : "0x") + value.pad(4, 16); // Number#pad
            }).join(", ");
}

function Array_clamp(low,    // @arg Number: low numeric value
                     high) { // @arg Number: high numeric value
                             // @ret Array: new Array
                             // @desc: to clamp numeric elements
                             // @help: Array#clamp
    return this.clean("number").map(function(num) { // Array#clean
        return num.clamp(low, high);                // Number#clamp
    });
}

function Array_nsort(desc) { // @arg Boolean(= false): false is ascending(0 -> 99)
                             //                        true is descending(99 -> 0)
                             // @ret Array: new Array
                             // @desc: numeric sort
                             // @help: Array#nsort
    function ascending(a, b) { // 0, 1, .. 98, 99
        return a - b;
    }

    function descending(a, b) { // 99, 98, .. 1, 0
        return b - a;
    }

    return this.clean("number").sort(desc ? descending : ascending); // Array#clean
}

function Array_average(median) { // @arg Boolean(= false): true is median
                                 //                        false is total/length
                                 // @ret Number: average
                                 // @desc: average of number elements(arithmetic mean)
                                 // @help: Array#average
    var ary = this.clean("number"), iz = ary.length; // Array#clean

    if (!median) {
        return ary.sum() / iz;
    }
    ary.nsort(); // 0, 1, .. 98, 99

    if (iz % 2) {
        return ary[(iz - 1) / 2];
    }
    return (ary[iz / 2 - 1] + ary[iz / 2]) / 2;
}

function Array_or(merge) { // @arg Array: merge array
                           // @ret Array: filtered array
                           // @desc: OR operator
                           // @help: Array#or
    return this.concat(merge).unique();
}

function Array_and(compare) { // @arg Array: compare array
                              // @ret Array: filtered new array
                              // @desc: AND operator
                              // @help: Array#and
    return _Array_compare(this, compare, false).matched;
}

function _Array_compare(source,   // @arg Array: source array
                        compare,  // @arg Array: compare array
                        escape) { // @arg Boolean: escape when the value is not found
                                  // @ret Object: { matched: Array, escaped: Boolean }
                                  // @inner: array compare `` 両方の配列に存在する要素からなる新しい配列を生成します
    var rv = [], ary = source.concat(), pos = 0, value,
        i = 0, iz = compare.length;

    for (; i < iz; ++i) {
        if (i in compare) {
            value = compare[i];

            pos = ary.indexOf(value);
            if (pos >= 0) { // has
                rv.push(value);
                ary.splice(pos, 1);
            } else if (escape) {
                return { matched: rv, escaped: true };
            }
        }
    }
    return { matched: rv, escaped: false };
}

function Array_xor(compare) { // @arg Array: compare array
                              // @ret Array: filtered array
                              // @desc: XOR operator
                              // @help: Array#xor
    var rv = [], index, i = 0, iz = this.length,
        cmp = compare.concat();

    for (; i < iz; ++i) {
        if (i in this) {
            index = cmp.indexOf(this[i]);
            index >= 0 ? cmp.splice(index, 1)
                       : rv.push(this[i]);
        }
    }
    return rv.concat(cmp);
}

function Array_fill(value, // @arg Primitive/Object/Array/Date(= undefined): fill value
                    from,  // @arg Integer(= 0): fill from index
                    to) {  // @arg Integer(= this.length): fill to index
                           // @ret Array: new Array
                           // @see: http://www.ruby-lang.org/ja/man/html/Array.html
                           // @desc: fill value
                           // @help: Array#fill
    var rv = this.concat(), i = from || 0, iz = to || rv.length;

    switch (Monogram.Type(value)) {
    case "Date":   for (; i < iz; ++i) { rv[i] = new Date(value); } break;
    case "Array":  for (; i < iz; ++i) { rv[i] = value.concat();  } break;
    case "Object": for (; i < iz; ++i) { rv[i] = Monogram.Type.clone(value); } break;
    default:       for (; i < iz; ++i) { rv[i] = value; }
    }
    return rv;
}

function Array_clear() { // @ret this:
                         // @desc: removes all elements from self
                         // @help: Array#clear
    this.length = 0;
    return this;
}

function Array_choice() { // @ret Mix:
                          // @desc: Random choice
                          // @help: Array#choice
    return this[ (Math.random() * this.length) | 0 ];
}

function Array_freeze() { // @ret ConstArray:
                          // @help: Array#freeze
    Object.freeze(this);
    return this;
}

function Array_reject(fn) { // @arg Function: callback(element, index)
                            // @ret DenseArray: new Array
                            // @desc: reject elements
                            // @help Array#rejct
    var rv = [], ary = this.clean(), i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        fn(ary[i], i) || rv.push(ary[i]);
    }
    return rv;
}

function Array_select(fn) { // @arg Function: callback(element, index)
                            // @ret DenseArray: new Array
                            // @desc: select elements
                            // @help: Array#select
    var rv = [], ary = this.clean(), i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        fn(ary[i], i) && rv.push(ary[i]);
    }
    return rv;
}

function Array_flatten() { // @ret DenseArray: flat new array
                           // @desc: array flatten
                           // @help: Array#flatten
    function _recursiveExpand(ary) {
        var i = 0, iz = ary.length, value;

        for (; i < iz; ++i) {
            if (i in ary) {
                value = ary[i];
                Array.isArray(value) ? _recursiveExpand(value) // recursive call
                                     : rv.push(value);
            }
        }
    }

    var rv = [];

    _recursiveExpand(this);
    return rv;
}

// --- String ----------------------------------------------
function String_trims(chr) { // @arg String: trim char
                             // @ret String: trimed string
                             // @help: String#trims
                             // @desc: trim both all spaces and strip all characters
    var esc = RegExp.esc(chr);

    return this.trim().replace(RegExp("^" + esc + "+"), "").
                       replace(RegExp(esc + "+" + "$"), "");
}

function String_trimQuote() { // @ret String: trimed string
                              // @help: String#trimQuote
                              // @desc: trim both spaces and strip single/double quotes.
                              //        does not remove the quotes that are not symmetric.
    var str = this.trim(), m = /^["']/.exec(str);

    if (m) {
        m = RegExp(m[0] + "$").exec(str);
        if (m) {
            return str.trims(m[0]);
        }
    }
    return str;
}

function String_insert(str,     // @arg String:
                       index) { // @arg Integer(= 0):
                                // @ret String:
                                // @help: String#insert
                                // @desc: insert string
    index = index || 0;

    var leftSide  = this.slice(0, index),
        rightSide = this.slice(index);

    return leftSide + str + rightSide;
}

function String_remove(str,     // @arg String:
                       index) { // @arg Integer(= 0):
                                // @ret String:
                                // @help: String#remove
                                // @desc: remove string
    if (str) {
        index = this.indexOf(str, index || 0);
        if (index >= 0) {
            return this.slice(0, index) + this.slice(index + str.length);
        }
    }
    return this + "";
}

function String_unpack(glue,    // @arg String(= ":"): glue
                       joint) { // @arg String(= ";"): joint
                                // @ret Object: { key: value, ... }
                                // @help: String#unpack
                                // @desc: deserialize string("key:value;...") to Object({ key: value, ... })
    glue  = glue  || ":";
    joint = joint || ";";

    var rv = {}, index, key, value,
        ary = this.trims(joint).split(joint), i = 0, iz = ary.length,
        primitive = {
            "":     "",   "NaN":   NaN,   "null":      null,
            "true": true, "false": false, "undefined": void 0
        };

    for (; i < iz; ++i) {
        index = ary[i].indexOf(glue);
        key = index >= 0 ? ary[i].slice(0, index)
                         : ary[i];
        value = "";
        if (index >= 0) {
            value = ary[i].slice(index + 1).trim();
            value = value in primitive ? primitive[value] // primitive -> convert
                  : isFinite(value) ? parseFloat(value)   // number    -> parse float
                  : value;                                // other     -> string
        }
        rv[key.trim()] = value;
    }
    return rv;
}

function String_at(ooo) { // @var_args Mix: replace values
                          // @ret String: "@@:@@".at(1,2) -> "1:2"
                          // @help: String#at
                          // @desc: search for "@@", replace the argument
    var i = 0, args = arguments;

    return this.replace(/@@/g, function() {
        return args[i++];
    });
}

function String_up(index) { // @arg Integer(= undefined): position. allow negative index
                            //                            undefined equals this.toUpperCase()
                            // @ret String:
                            // @help: String#up
                            // @desc: String#toUpperCase(index)
    return _String_up_or_low(this, index, "toUpperCase");
}

function String_low(index) { // @arg Integer(= undefined): position. allow negative index
                             //                            undefined equals this.toLowerCase()
                             // @ret String:
                             // @help: String#low
                             // @desc: String#toLowerCase(index)
    return _String_up_or_low(this, index, "toLowerCase");
}

function _String_up_or_low(that, index, method) {
   if (index !== void 0) {
        // calc negative index
        index = index < 0 ? that.length + index : index;
        if (index in that) {
            return that.slice(0, index) + that[index][method]() +
                   that.slice(index + 1);
        }
        return "" + that;
    }
    return that[method]();
}

function String_has(find,      // @arg String: find string or find characters
                    anagram) { // @arg Boolean(= false): true is anagram search
                               // @ret Boolean: has string or has all anagram characters
                               // @help: String#has
                               // @desc: String has character(s) and anagram matching
    return anagram ? this.split("").has(find.split("")) // Array#has delegation
                   : this.indexOf(find) >= 0;
}

function String_count() { // @ret Object: found count or { char: char-count, ... }
                          // @help: String#count
                          // @desc: count the number of character
    var rv = {}, c, ary = this.split(""), i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        c = ary[i];
        rv[c] ? ++rv[c] : (rv[c] = 1);
    }
    return rv;
}

function String_numbers(joint) { // @arg String(= ","):
                                 // @ret NumberArray:
                                 // @help: String#numbers
                                 // @desc: to number array
    return this.trim().split(joint || ",").map(parseFloat).clean("number");
}

function String_unique() { // @ret String:
                           // @help: String#unique
                           // @desc: remove duplicate characters

    return this.split("").unique().join("");
}

function String_toEntity() { // @ret HTMLEntityString:
                             // @help: String#toEntity
                             // @desc: convert String to HTML Entity
    function _toEntity(code) {
        var hash = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

        return hash[code];
    }

    return this.replace(/[&<>"]/g, _toEntity);
}

function String_fromEntity() { // @ret String:
                               // @help: String#fromEntity
                               // @desc: decode String from HTML Entity
    function _fromEntity(code) {
        var hash = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"' };

        return hash[code];
    }

    return this.replace(/&(?:amp|lt|gt|quot);/g, _fromEntity).
                replace(/\\u([0-9a-f]{4})/g, function(m, hex) { // \u0000 ~ \uffff
                    return String.fromCharCode(parseInt(hex, 16));
                });
}

function String_overflow(maxLength, // @arg Integer: max length
                         ellipsis,  // @arg String(= "..."):
                         affect) {  // @arg String(= "left"): "left", "mid", "right"
                                    // @ret String:
                                    // @help: String#overflow
                                    // @desc: adjust the length of the string, to append the ellipsis
//{@debug
//   mm.allow("affect", ["left", "mid", "right"].has(affect));
//}@debug

    ellipsis = ellipsis || "...";
    var ez = ellipsis.length, e2, l2;

    if (this.length > maxLength) {
        if (maxLength - ez < 1) {
            return ellipsis.slice(0, maxLength);
        }
        switch (affect || "left") {
        case "mid":
            e2 = (ez / 2) | 0;
            l2 = (maxlength / 2) | 0;
            return this.slice(0, l2 - e2) + ellipsis +       // "ov...low"
                   this.slice(-((maxlength - l2) - (ez - e2)));
        case "right":
            return ellipsis + this.slice(-(maxlength - ez)); // "...rflow"
        default:
            return this.slice(0, maxlength - ez) + ellipsis; // "overf..."
        }
    }
    return "" + this;
}

function String_removeTag() { // @ret String:
                              // @help: String#removeTag
                              // @desc: remove HTML tags
    return this.replace(/<\/?[^>]+>/g, "");
}

function String_capitalize() { // @ret String:
                               // @help: String#capitalize
    return this.low().up(0);
}

function String_crlf(trim) { // @arg Boolean(= false): trim lines
                             // @ret StringArray:
                             // @help: String#crlf
                             // @desc: split line feed
    return trim ? this.trim().split(/\s*(?:\r\n|\r|\n)\s*/)
                : this.split(/(?:\r\n|\r|\n)/);
}

function String_exec() { // @ret Mix/undefined: result
                         // @help: String#exec
    try {
        return (new Function(this))();
    } catch (o_o) {
    }
    return;
}

function Number_to(end,            // @arg Integer: end number
                   filterOrStep) { // @arg Function/Integer(= 1): filter function or step number
                                   // @ret Array: [begin, ... end]
                                   // @this: begin number
                                   // @help: Number#to
                                   // @desc: create number array
                                   // @throw: Error("BAD_ARG")
    var rv = [], begin = this | 0, reverse = begin > end,
        i  = (reverse ? end : begin) | 0,
        iz = (reverse ? begin : end) | 0,
        type = typeof filterOrStep,
        step = 1;

    if (type === "function") {
        for (; i <= iz; ++i) {
            filterOrStep(i) && rv.push(i);
        }
    } else {
        if (type === "number") {
            step = filterOrStep | 0;
        }
        if (step < 1 || end >= 0x7FFFFFFF) {
            throw new Error("BAD_ARG");
        }
        for (; i <= iz; i += step) {
            rv.push(i);
        }
    }
    return reverse ? rv.reverse() : rv;
}

function Number_pad(digits,  // @arg Integer(= 2): digits. 1 - 32
                    radix) { // @arg Integer(= 10): radix. 2 - 36
                             // @ret String:
                             // @help: Number#pad
                             // @desc: to uint32 and pad zero
//{@debug
//    mm.deny("digits", digits, digits && (digits < 1 || digits > 32));
//    mm.deny("radix",  radix,  radix  && (radix  < 2 || radix  > 36));
//}@debug

    digits = digits || 2;
    radix  = radix  || 10;

    var num = Math.abs(+this) >>> 0;

    // 0..pad() -> "00"
    // 9..pad() -> "09"
    // (-11.1).pad(4) -> "0011"
    if (digits === 2 && radix === 10 && num < 100) {
        return num < 10 ? "0" + num : "" + num;
    }
    return ("00000000000000000000000000000000" +
            num.toString(radix)).slice(-digits);
}

function Number_xor(value) { // @arg Integer:
                             // @ret Integer:
                             // @help: Number#xor
                             // @desc: 32bit xor value
    return (this ^ value) >>> 0; // to uint32
}

function Number_ms(fn_that, // @arg Function/Await/Array: callback or [that, callback]
                   ooo) {   // @var_args Mix(= undefined): callback.apply(that, var_args)
                            // @this Number: delay milliseconds
                            // @ret Integer: atom (setTimeout timer id)
                            // @help: Number#ms
                            // @desc: lazy evaluate function
//{@debug
    if (Array.isArray(fn_that)) {
        if (typeof fn_that[1] !== "function" || fn_that.length !== 2) {
            throw new Error("BAD_ARG");
        }
    }
//}@debug

    var that = fn_that[0] || null,
        fn   = fn_that[1] || fn_that,
        args = Array.prototype.slice.call(arguments, 1);

    return setTimeout(function() {
                fn.pass ? fn.pass(args)
                        : fn.apply(that, args);
            }, this);
}

function Number_times(fn_that, // @arg Function/Array: callback or [that, callback]
                      ooo) {   // @var_args Mix(= undefined): callback.apply(that, var_args, call_count)
                               // @ret ResultMixArray: callback results
                               // @help: Number#times
                               // @desc: n times callback function
//{@debug
    if (Array.isArray(fn_that)) {
        if (typeof fn_that[1] !== "function" || fn_that.length !== 2) {
            throw new Error("BAD_ARG");
        }
    }
//}@debug

    var rv   = [],
        that = fn_that[0] || null,
        fn   = fn_that[1] || fn_that,
        args = Array.prototype.slice.call(arguments, 1),
        i = 0, iz = +this | 0,
        fn_args = args ? args.concat() : [],
        fn_args_last = fn_args.length;

    if (iz > 0) {
        for (; i < iz; ++i) {
            fn_args[fn_args_last] = i; // add/update index
            rv.push(fn.apply(that, fn_args));
        }
    }
    return rv;
}

function Number_clamp(low,    // @arg Number: low numeric value
                      high) { // @arg Number: high numeric value
                              // @ret Number: clamped value
                              // @desc: to clamp numeric elements
                              // @help: Number#clamp
    var num = +this, swap;

    // swap low <-> high
    if (low > high) {
        swap = [high, low];
        low  = swap[0];
        high = swap[1];
    }
    return num < low  ? low  :
           num > high ? high : num;
}

function Number_rad() { // @ret Number: radians value
                        // @help Number#toRadians
                        // @desc: Degree to Radian
    return this * Math.PI / 180;
}

function Number_deg() { // @ret Number: degrees value
                        // @help Number#toDegrees
                        // @desc: Radian to Degree
    return this * 180 / Math.PI;
}

function Number_frac(range) { // @arg Integer(= 256): fraction range
                              // @ret Number:
                              // @desc: convert integer to fraction value
//{@debug
//    mm.deny("range", range, range && range <= 0);
//}@debug
    range = range || 256;

    // 255..frac(256) -> 1
    // 128..frac(256) -> 0.5
    var threshold = (this * 100 / range + 0.5) | 0;

    return threshold / 100;
}

function Number_chr() { // @ret String:
                        // @help: Number#chr
                        // @desc: convert char code to String
    return String.fromCharCode(this);
}

function Number_rand() { // @ret Integer/Number:
                         // @help: Number#rand
                         // @desc: create random number
    var num = +this;

    return num ? (Math.random() * num) | 0 // 10..rand() -> from 0   to 10 (integer)
               :  Math.random();           //  0..rand() -> from 0.0 to 1.0 (number)
}

function Function_argsApply(that,  // @arg this: method this
                            ooo) { // @var_args Mix:
                                   // @ret Mix:
                                   // @help: Function#argsApply
                                   // @desc: method call, expand the Arguments object
    var ary = [], args = arguments, i = 1, iz = args.length;

    for (; i < iz; ++i) {
        if (Monogram.Type(args[i]) === "List") {
            Array.prototype.push.apply(ary, Array.from(args[i]));
        } else {
            ary.push( args[i] );
        }
    }
    return this.apply(that, ary);
}

function RegExp_esc(str) { // @arg String:
                           // @ret EscapedString:
                           // @help: RegExp.esc
   return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
}

function RegExp_flag(command) { // @arg String(= ""): ""(clear). "+g"(add), "-g"(remove)
                                // @ret RegExp: new RegExp Object
                                // @help: RegExp#flag
                                // @desc: add/remove/clear RegExp flag
   var flag = (this + "").slice(this.source.length + 2);

    if (!command) { // flag() -> clear
        flag = "";
    } else if (command[0] === "-") { // flag("-img") -> remove
        command.slice(1).split("").each(function(f) {
            flag = flag.remove(f);
        });
    } else { // flag("+img") -> add
        flag = (flag + command.trims("+")).unique();
    }
    return RegExp(this.source, flag);
}

function Function_nickname(defaultName) { // @arg String(= ""): default nickname
                                          // @ret String: function name
                                          // @help: Function#nickname
                                          // @desc: get function name
    // pick: "function funcname(args...)" -> "funcname"
    var name = this.name || (this + "").split("\x28")[0].trim().slice(9);

    return name ? name.replace(/^mm_/, "mm.") // mm_like -> mm.like
                : defaultName; // [IE][Opera<11]
}

// --- Hash ----------------------------------------------
function Hash_has(data,   // @arg Object/Function:
                  find) { // @arg Object: { key: value, ... }
                          // @ret Boolean:
                          // @help: Hash.has
    var key, keys = Object.keys(find), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if (!(key in data) || !_Hash_has( data[key], find[key] )) {
            return false;
        }
    }
    return true;
}

function _Hash_has(data, find) {
    if (data.constructor.name !== find.constructor.name) {
        return false;
    }
    switch (Monogram.Type(data)) {
    case "List":    return Array.from(data).has(Array.from(find));
    case "Array":   return data.has(find);
    case "RegExp":  return data.source === find.source;
    case "String":  return data.has(find);
    case "Object":  return Hash_has(data, find);
    case "Number":  return isNaN(data) && isNaN(find) ? true : data === find;
    }
    return data === find;
}

function Hash_like(lval,   // @arg Mix: left value
                   rval) { // @arg Mix: right value
                           // @ret Boolean: true is like value and like structures
                           // @help: Hash.like
                           // @desc: Like and deep matching.
                           //        This function does not search inside
                           //        the prototype chain of the object.
    var ltype = Monogram.Type(lval),
        rtype = Monogram.Type(rval),
        alike = { String: 1, Date: 1, List: 2, Array: 2, Object: 3, Hash: 3 };

    if (ltype !== rtype) { // String <-> Date, List <-> Array, Object <-> Hash
        if (alike[ltype] &&
            alike[ltype] === alike[rtype]) {
            if (rtype === "String" || rtype === "List" || rtype === "Hash") {
                return Hash_like(lval, Monogram.Type.cast(rval));
            }
            return Hash_like(Monogram.Type.cast(lval), rval);
        }
        return false;
    }
    switch (ltype) {
    case "List":    return "" + Array.from(lval).sort() ===
                           "" + Array.from(rval).sort();
    case "Array":   return "" + lval.sort() === "" + rval.sort();
    case "RegExp":  return      lval.source ===      rval.source;
    case "Object":  if (Object.keys(lval).length !== Object.keys(rval).length) {
                        return false;
                    }
                    return Hash_has(lval, rval);
    case "Number":  return isNaN(lval) && isNaN(rval) ? true : lval === rval;
    }
    return (lval && lval.toJSON) ? lval.toJSON() === rval.toJSON()
                                 : lval === rval;
}

function Hash_map(obj,  // @arg Object/Function:
                  fn) { // @arg Function: callback function
                        // @ret Array: [result, ...]
                        // @help: Hash.map
    var rv = [], key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        rv.push( fn(obj[key], key) );
    }
    return rv;
}

function Hash_each(obj,  // @arg Object/Function:
                   fn) { // @arg Function: callback function
                         // @help: Hash.each
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        fn(obj[key], key); // fn(value, index)
    }
}

function Hash_some(obj,  // @arg Object/Function:
                   fn) { // @arg Function: fn(value, key)
                         // @ret Boolean:
                         // @help: Hash.some
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if ( fn(obj[key], key) ) {
            return true;
        }
    }
    return false;
}

function Hash_every(obj,  // @arg Object/Function:
                    fn) { // @arg Function: fn(value, key)
                          // @ret Boolean:
                          // @help: Hash.every
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if ( !fn(obj[key], key) ) {
            return false;
        }
    }
    return true;
}

function Hash_filter(obj,     // @arg Object/Function:
                     fn,      // @arg Function: fn(value, key)
                     match) { // @arg Boolean(= false): true is Object_match
                              //                        false is Object_filter
                              // @ret Array/undefined:
                              // @help: Hash.filter
    var rv = [], key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if ( fn(obj[key], key) ) {
            rv.push( obj[key] );
            if (match) {
                return obj[key];
            }
        }
    }
    return match ? void 0 : rv;
}

function Hash_clean(data,   // @arg Object/Function:
                    only) { // @arg String(= ""): typeof filter
                            // @ret DenseObject: new Object
                            // @help: Hash.clean
                            // @desc: convert sparse object to dense object,
                            //        trim undefined, null and NaN value
    only = only || "";

    var rv = {}, key, value, keys = Object.keys(data),
        i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        value = data[key];
        if (value === value && value != null) {
            if (!only || typeof value === only) {
                rv[key] = value;
            }
        }
    }
    return rv;
}

function Hash_clear(obj) { // @arg Object/Function/Class/Hash:
                           // @ret Object/Function/Class/Hash:
                           // @help: Hash.clear
    var keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) {
        delete obj[keys[i]];
    }
    return obj;
}

function Hash_count(obj) { // @arg Object/Function/Array:
                           // @ret Object: { value: value-count, ... }
                           // @help: Hash.count
    var rv = {}, value, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        value = obj[keys[i]] + ""; // toString(value)
        rv[value] ? ++rv[value] : (rv[value] = 1);
    }
    return rv;
}

function Hash_values(obj) { // @arg Object/Function/Array/Style/Node/Global:
                            // @ret Array: [value, ...]
                            // @help: Hash.values
    var rv = [], keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        rv.push( obj[keys[i]] );
    }
    return rv;
}

function Hash_pack(obj,     // @arg Object:
                   glue,    // @arg String(= ":"): glue
                   joint) { // @arg String(= ";"): joint
                            // @ret String: "key:value;key:value;..."
                            // @help: Hash.pack
                            // @desc: serialize hash key/values ({ key: valye, ... }) to "key:value;..."
    glue = glue || ":";

    var rv = [], key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        rv.push(key + glue + obj[key]);
    }
    return rv.join(joint || ";");
}

function Hash_ownProps(rv, obj) { // @help: Hash.ownProps
                                  // @desc: collect own properties
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        rv[key] = obj[key];
    }
    return rv;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Hash: Hash };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Hash = Hash;

})(this.self || global, Monogram.wiz);

