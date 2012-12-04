var mm; // global.mm - monogram.js library name space

mm || (function(global) { // @arg Global: window or global

// --- header ----------------------------------------------
function _defineLibraryAPIs(mix) {

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
    mm = mix(HashFactory, {             // mm(obj:Object/Hash):Hash
        api:        mm_api,             // mm.api(version:Integer = 0):Object/Function
        // --- Interface and Class ---
        Interface:  Interface,          // mm.Interface(name:String, spec:Object):void
        Class:      ClassFactory,       // mm.Class(specs:String,
                                        //          properties:Object = undefined,
                                        //          statics:Object = undefined):Function
        // --- key / value store ---
        Hash:       Hash,               // mm.Hash(obj:Object):Hash
        // --- await some processes ---
        Await:      Await,              // mm.Await(fn:Function, waits:Integer,
                                        //          tick:Function = undefined):Await
        // --- messaging ---
        Msg:        Msg,                // mm.Msg()
        msg:        {},                 // mm.msg - Msg pool
        // --- mixin ---
        arg:        mm_arg,             // mm.arg(arg:Object/Function/undefined, defaults:Object):Object
        mix:        mm_mix,             // mm.mix(base:Object/Function, extend:Object, override:Boolean = false):Object/Function
        wiz:        mm_wiz,             // mm.wiz(base:Object/Function, extend:Object, override:Boolean = false):void
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
        cast:       mm_cast,            // mm.cast(mix:Attr/Hash/List/FakeArray/Style/DateString/Mix):Object/Array/Date/Mix
        copy:       mm_copy,            // mm.copy(mix:Mix, depth:Integer = 0, hook:Function/undefined = undefined):Mix
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
        clear:      Object_clear,       // mm.clear(obj:Object/Function/Class/Hash):Object/Function/Class/Hash
        // --- utility ---
        nop:        mm_nop,             // mm.nop():void
        conv:       mm_conv,            // mm.conv(from:CaseInsensitiveString, to:CaseInsensitiveString):Object
                                        // mm.conv("Integer",    "HexString")  {     0 : "00" ..   255 : "ff"}
                                        // mm.conv("HexString",  "Integer")    {   "00":   0  ..   "ff": 255 }
                                        // mm.conv("Integer",    "ByteString") {     0 :"\00" ..   255 :"\ff"}
                                        // mm.conv("ByteString", "Integer")    {  "\00":   0  ..  "\ff": 255 }
                                        //                                     {"\f780": 128  .."\f7ff": 255 }
        dump:       mm_dump,            // mm.dump(mix:Mix, spaces:Integer = 4, depth:Integer = 5):String
        strict:     mm_wrap(!this)(),   // mm.strict:Boolean - true is strict mode
        // --- assert / debug ---
        say:        mm_say,             // mm.say(mix:Mix):Boolean
        alert:      mm_alert,           // mm.alert(mix:Mix):Boolean
        deny:       mm_deny,            // mm.deny(name:String, mix:Mix, judge:Function/Boolean/TypeNameString):void
        allow:      mm_allow,           // mm.allow(name:String, mix:Mix, judge:Function/Boolean/TypeNameString):void
        perf:       mm_perf,            // mm.perf():Object
        pollution:  mm_pollution,       // mm.pollution():StringArray
        // --- type detection ---
        type:   mix(mm_type, {          // mm.type(mix:Mix):String
            alias:  mm_type_alias       // mm.type.alias(obj:Object):void
        }),
        complex:    mm_complex,         // mm.complex(arg1:String/Object, arg2:String/Number):Integer
        // --- log / log group ---
        log:    mix(mm_log, {           // mm.log(...:Mix):void
            copy:   mm_log_copy,        // mm.log.copy():Object
            dump:   mm_log_dump,        // mm.log.dump(url:String = ""):void
            warn:   mm_log_warn,        // mm.log.warn(...:Mix):void
            error:  mm_log_error,       // mm.log.error(...:Mix):void
            clear:  mm_log_clear,       // mm.log.clear():void
            limit:  0                   // mm.log.limit - Integer: stock length
        }),
        logg:   mix(mm_logg, {          // mm.logg(label:String/Function, mode:Integer = 0x0):Object
            nest:   0                   // mm.logg.nest - Number: nest level
        })
    });
    // --- url ---
//{@url
    mm.url = mix(mm_url, {              // mm.url(url:URLObject/URLString = ""):URLString/URLObject
        resolve:    mm_url_resolve,     // mm.url.resolve(url:URLString):URLString
        normalize:  mm_url_normalize,   // mm.url.normalize(url:URLString):URLString
        buildQuery: mm_url_buildQuery,  // mm.url.buildQuery(obj:URLObject, joint:String = "&"):URLQueryString
        parseQuery: mm_url_parseQuery   // mm.url.parseQuery(query:URLString/URLQueryString):URLQueryObject
    });
//}@url
    // --- environment ---
    mm.env = _detectEnv({
        ua:         "",                 // mm.env.ua     - String: user agent
        lang:       "en",               // mm.env.lang   - String: language. "en", "ja", ...
        secure:     false,              // mm.env.secure - Boolean: is SSL page
        // --- browser ---
        ie:         !!document.uniqueID,// mm.env.ie     - Boolean: is IE
        ie8:        false,              // mm.env.ie8    - Boolean: is IE 8
        ie9:        false,              // mm.env.ie9    - Boolean: is IE 9
        ie10:       false,              // mm.env.ie10   - Boolean: is IE 10
        ipad:       false,              // mm.env.ipad   - Boolean: is iPad
        gecko:      !!global.netscape,  // mm.env.gecko  - Boolean: is Gecko
        opera:      !!global.opera,     // mm.env.opera  - Boolean: is Opera
        chrome:     false,              // mm.env.chrome - Boolean: is Chrome, Chrome for Android, Chrome for iOS
        webkit:     false,              // mm.env.webkit - Boolean: is WebKit
        safari:     false,              // mm.env.safari - Boolean: is Safari, MobileSafari
        mobile:     false,              // mm.env.mobile - Boolean: is Mobile device
        // --- run at ... ---
        node:       !!(global.require &&
                       global.process), // mm.env.node   - Boolean: is node.js (run at Server)
        ngcore:     !!global.Core,      // mm.env.ngcore - Boolean: is ngCore (run at ngCore)
        browser:    !!(global.navigator &&
                       global.document),// mm.env.browser - Boolean: is Browser (run at Browser)
        titanium:   !!global.Ti,        // mm.env.titanium - Boolean: is Titanium (run at Titanium)
        // --- os ---
        ios:        false,              // mm.env.ios    - Boolean: is iOS
        mac:        false,              // mm.env.mac    - Boolean: is Mac OS X
        android:    false,              // mm.env.android - Boolean: is Android
        windows:    false,              // mm.env.windows - Boolean: is Windows
        // --- device ---
        touch:      false,              // mm.env.touch  - Boolean: is Touch device
        retina:     false               // mm.env.retina - Boolean: is Retina display. devicePixelRatio >= 2.0
    });
    // --- version ---
    mm.ver = {
        ie:         !mm.env.ie      ? 0 : _ver("MSIE "),        // 10, 9
        ios:        !mm.env.ios     ? 0 : _ver("OS "),          // 6, 5.1
        mac:        !mm.env.mac     ? 0 : _ver("Mac OS X"),     // 10.6
        gecko:      !mm.env.gecko   ? 0 : _ver("rv:"),          // 16, 15
        opera:      !mm.env.opera   ? 0 : parseFloat(global.opera.version()),
        chrome:     !mm.env.chrome  ? 0 : _ver("Chrome/"),      // 22
        webkit:     !mm.env.webkit  ? 0 : _ver("AppleWebKit/"), // 537,4, 534
        safari:     !mm.env.safari  ? 0 : _ver("Version/"),     // 6.0, 5.1
        android:    !mm.env.android ? 0 : _ver("Android"),      // 4.1, 4.0, 2.3
        windows:    !mm.env.windows ? 0 : _ver("Windows NT ")   // win8: 6.2, win7: 6.1, vista: 6, xp: 5.1
    };
    function _ver(rex) {
        return parseFloat(mm.env.ua.split(rex)[1].replace("_", ".")) || 1;
    }
    // --- vendor prefix ---
    // mm.vendor.fn - String: vendor function prefix
    // mm.vendor.css - String: vendor css prefix
    // mm.vendor.style - String: vendor style property prefix
    mm.vendor = mm.env.webkit ? { fn: "webkit",css: "-webkit-",style: "webkit" }
              : mm.env.gecko  ? { fn: "moz",   css: "-moz-",   style: "Moz"    }
              : mm.env.opera  ? { fn: "o",     css: "-o-",     style: "O"      }
              : mm.env.ie     ? { fn: "ms",    css: "-ms-",    style: "ms"     }
                              : { fn: "",      css: "",        style: ""       };
}

// --- Boolean, Date, Array, String, Number, Function, RegExp, Math ---
function _extendNativeObjects(mix, wiz) {

    // --- Type Detection, API Versioning ---
    wiz(Function.prototype, { __CLASS__: "function",typeFunction: true, api: Object_api });
    wiz( Boolean.prototype, { __CLASS__: "boolean", typeBoolean:  true, api: Object_api });
    wiz(  String.prototype, { __CLASS__: "string",  typeString:   true, api: Object_api });
    wiz(  Number.prototype, { __CLASS__: "number",  typeNumber:   true, api: Object_api });
    wiz(  RegExp.prototype, { __CLASS__: "regexp",  typeRegExp:   true, api: Object_api });
    wiz(   Array.prototype, { __CLASS__: "array",   typeArray:    true, api: Object_api });
    wiz(    Date.prototype, { __CLASS__: "date",    typeDate:     true, api: Object_api });

    // --- Extension ---
    wiz(Date, {
//[ES]  now:        Date_now,           // Date.now():Integer
        from:       Date_from           // Date.from(dateString:String):Date
    });
    wiz(Date.prototype, {
        diff:       Date_diff,          // Date#diff(diffDate:Date/Integer):Object { days, times, toString }
        dates:      Date_dates,         // Date#dates():Object { y, m, d }
        times:      Date_times,         // Date#times():Object { h, m, s, ms }
        format:     Date_format         // Date#format(format:String = "I"):String
//[ES]  toJSON:     Date_toJSON         // Date#toJSON():JSONObject
    });
    wiz(Array, {
//[ES]  of:         Array_of,           // Array.of(...:Mix):MixArray
//[ES]  from:       Array_from,         // Array.from(list:FakeArray):Array
        range:      Array_range,        // Array.range(begin:Integer, end:Integer, filterOrStep:Function/Integer = 1):Array
        toArray:    Array_toArray,      // Array.toArray(mix:Mix/Array):Array
//[ES]  isArray:    Array_isArray       // Array.isArray(mix:Mix):Boolean
    });
    wiz(Array.prototype, {
        // --- match ---
        has:        Array_has,          // [].has(find:Mix/MixArray):Boolean
        match:      Array_match,        // [].match(fn:Function, that:this):Mix
//[ES]  indexOf:    Array_indexOf,      // [].indexOf(mix:Mix, index:Integer = 0):Integer
//[ES]  lastIndexOf:Array_lastIndexOf,  // [].lastIndexOf(mix:Mix, index:Integer = 0):Integer
        // --- format ---
        at:         Array_at,           // [].at(format:String):String
        // --- filter ---
        sieve:      Array_sieve,        // [].sieve():Object - { values:DenseArray, dups:DenseArray }
        unique:     Array_unique,       // [].unique():DenseArray
        reject:     Array_reject,       // [].reject(fn:Function):DenseArray
        select:     Array_select,       // [].select(fn:Function):DenseArray
//[ES]  filter:     Array_filter,       // [].filter(fn:Function, that:this):Array
        flatten:    Array_flatten,      // [].flatten():DenseArray
        // --- iterate ---
//[ES]  map:        Array_map,          // [].map(fn:Function, that:this):Array
        each:       Array.prototype.forEach,
                                        // [].each(fn:Function, that:this) - [alias]
//[ES]  some:       Array_some,         // [].some(fn:Function, that:this):Boolean
//[ES]  every:      Array_every,        // [].every(fn:Function, that:this):Boolean
//[ES]  forEach:    Array_forEach,      // [].forEach(fn:Function, that:this):void
//[ES]  reduce:     Array_reduce,       // [].reduce(fn:Function, init:Mix):Mix
//[ES]  reduceRight:Array_reduceRight,  // [].reduceRight(fn:Function, init:Mix):Mix
        sync:       Array_sync,         // [].sync():ModArray { each, map, some, every }
        async:      Array_async,        // [].async(callback:Function, wait:Integer = 0,
                                        //          unit:Integer = 1000):ModArray { each, map, some, every }
        // --- generate ---
        copy:       Array_copy,         // [].copy(deep:Boolean = false):Array
        clean:      Array_clean,        // [].clean(only:String = ""):DenseArray
        toArray:    Array_toArray,      // [].toArray():Array
        toUTF8Array:    Array_toUTF8Array,      // [utf16].toUTF8Array():UTF8Array
        toUTF16Array:   Array_toUTF16Array,     // [utf8].toUTF16Array():UTF16Array
        toUTF16String:  Array_toUTF16String,    // [utf8].toUTF16String():String
        toBase64String: Array_toBase64String,   // [byte].toBase64String():Base64String
        // --- calculate ---
        or:         Array_or,           // [].or(merge:Array):Array
        and:        Array_and,          // [].and(compare:Array):Array
        xor:        Array_xor,          // [].xor(compare:Array):Array
        sum:        Array_sum,          // [].sum():Number
        clamp:      Array_clamp,        // [].clamp(low:Number, high:Number):Array
        nsort:      Array_nsort,        // [].nsort(desc:Boolean = false):Array
        average:    Array_average,      // [].average(median:Boolean = false):Number
        // --- enumerate ---
        count:      Array_count,        // [].count():Object
        // --- manipulate ---
        fill:       Array_fill,         // [].fill(value:Primitive/Object/Array/Date,
                                        //         from:Integer = 0, to:Integer = this.length):Array
        clear:      Array_clear,        // [].clear():this
        shifts:     Array_shifts,       // [].shifts():DenseArray
        remove:     Array_remove,       // [].remove(find:Mix, all:Boolean = false):this
        replace:    Array_replace,      // [].replace(find:Mix, value:Mix = null, all:Boolean = false):this
        // --- utility ---
        dump:       Array_dump,         // [].dump():String
        choice:     Array_choice,       // [].choice():Mix
        freeze:     Array_freeze,       // [].freeze():ConstArray
        stream:     Array_stream,       // [].stream(delay:String/Integer = 0):Object
        shuffle:    Array_shuffle,      // [].shuffle():DenseArray
        first:      Array_first,        // [].first(lastIndex:Integer = 0):Mix/undefined
        last:       Array_last,         // [].last(index:Integer = 0):Mix/undefined
        // --- test ---
        test:   mix(Array_test, {       // [ test case, ... ].test(label:String = "", arg = undefined):void
            tick:   null                // Array#.test.tick({ok,msg,name,pass,miss}) - Tick Callback Function
        })
    });
    wiz(String.prototype, {
        // --- match ---
        has:        String_has,         // "".has(find:String, anagram:Boolean = false):Boolean
        isURL:      String_isURL,       // "".isURL(isRelative:Boolean = false):Boolean
        // --- format ---
        at:         String_at,          // "@@".at(...:Mix):String
        up:         String_up,          // "".up(index:Integer = undedefind):String
        low:        String_low,         // "".low(index:Integer = undedefind):String
        down:       String_low,         // [alias]
//[ES]  trim:       String_trim,        // " trim both sp ".trim():String
        trims:      String_trims,       // "-trim-".trims(chr:String):String
        trimQuote:  String_trimQuote,   // "'quoted'".trimQuote():String
        format:     String_format,      // "%05s".format(...:Mix):String
        overflow:   String_overflow,    // "".overflow(maxLength:Integer, ellipsis:String = "...",
                                        //             affect:String = "left"):String
        removeTag:  String_removeTag,   // "<tag></tag>".removeTag():String
        capitalize: String_capitalize,  // "".capitalize():String
        // --- filter ---
        unique:     String_unique,      // "abcabc".unique():String
        // --- iterate ---
        // --- generate ---
//[ES]  repeat:     String_repeat,      // "".repeat(count:Integer):String
        unpack:     String_unpack,      // "key:value".unpack(glue:String = ":", joint:String = ";"):Object
        numbers:    String_numbers,     // "1,2,3".numbers(joint:String = ","):NumberArray
//[ES]  reverse:    String_reverse,     // "".reverse():String
        toBase64:   String_toBase64,    // "".toBase64(safe:Boolean = false):Base64String
        fromBase64: String_fromBase64,  // "".fromBase64():String
        toEntity:   String_toEntity,    // "".toEntity():HTMLEntityString
        fromEntity: String_fromEntity,  // "".fromEntity():String
        toUTF8Array:String_toUTF8Array, // "".toUTF8Array():UTF8Array
        toUTF16Array:String_toUTF16Array,// "".toUTF16Array():UTF16Array
        // --- calculate ---
        // --- enumerate ---
        count:      String_count,       // "abc".count():Object
        // --- manipulate ---
        insert:     String_insert,      // "".insert(str:String, index:Integer = 0):String
        remove:     String_remove,      // "".remove(str:String, index:Integer = 0):String
        // --- utility ---
        crlf:       String_crlf,        // "\r\n".crlf(trim:Boolean = false):StringArray
        exec:       String_exec,        // "".exec():Mix/undefined
        stream:     String_stream       // "".stream(methods:Object/Array, delay:String/Integer = 0):Object
    });

//  mix(Number, {
//[ES]  isNaN:      Number_isNaN,       // Number.isNaN(mix:Mix):Boolean
//[ES]  isFinite:   Number_isFinite,    // Number.isFinite(mix:Mix):Boolean
//[ES]  isInteger:  Number_isInteger,   // Number.isInteger(mix:Mix):Boolean
//[ES]  toInteger:  Number_toInteger    // Number.toInteger(mix:Mix):Integer
//  });
    wiz(Number.prototype, {
        // --- format ---
        pad:        Number_pad,         // 0..pad(digits:Integer = 2, radix:Integer = 10):String
        // --- generate ---
        to:         Number_to,          // 0..to(end:Integer, filterOrStep:Integer = 1):Array
        // --- calculate ---
        rad:        Number_rad,         // 180..rad():Number    - 180..rad() === Math.PI
        deg:        Number_deg,         // Math.PI.deg():Number - Math.PI.deg() === 180
        xor:        Number_xor,         // 0..xor(value:Integer):Integer
        frac:       Number_frac,        // 255..frac(range:Integer = 256):Number
        rand:       Number_rand,        // 100..rand():Integer/Number
        clamp:      Number_clamp,       // 0..clamp(low:Number, high:Number):Number
        // --- utility ---
        chr:        Number_chr,         // 0x32.chr():String
        wait:       Number_wait,        // 0..wait(fn_that:Function/Array, ...):Integer
        times:      Number_times        // 0..times(fn_that:Function/Array, ...):ResultMixArray
    });
    wiz(Function.prototype, {
//[ES]  bind:       Function_bind,      // fn#bind():Function
        help:   mix(Function_help, {    // fn#help(that:Object = null):String
            add:    Function_help_add,  // fn#help.add(url:URLString, word:String/StringArray/RegExp):void
            url:    Function_help_url   // fn#help.url(fn:Function):String
        }),
        argsApply:  Function_argsApply, // fn#argsApply(that, ...):Mix
        nickname:   Function_nickname,  // fn#nickname(defaultName:String = ""):String
        // --- await ---
        await:      Function_await      // fn#await(waits:Integer, tick:Function = undefined):Await
    });
    wiz(RegExp, {
        esc:        RegExp_esc,         // RegExp.esc(str:String):EscapedString
        FILE:       /^(file:)\/{2,3}(?:localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i,
                    //                 localhost    /dir/f.ext ?key=value    #hash
                    //  [1]                         [2]        [3]          [4]
        URL:        /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/,
                    //  https://    user:pass@    server   :port    /dir/f.ext   ?key=value     #hash
                    //  [1]         [3]           [4]       [5]     [6]         [7]            [8]
        PATH:       /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/,
                    //  /dir/f.ext   key=value    hash
                    //  [1]          [2]          [3]
        DATE:       /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/
                    // [1]y    [2]m   [3]d   [4]h   [5]m   [6]s       [7]ms

    });
    wiz(RegExp.prototype, {
        flag:       RegExp_flag         // /regexp/.flag(flag:String):RegExp
    });

    Math.PI2 = Math.PI * 2;             // Math.PI2

//{@easing
    // This code block base idea from Robert Penner's easing equations.
    //      (c) 2001 Robert Penner, all rights reserved.
    //      http://www.robertpenner.com/easing_terms_of_use.html
    var fn,
        easing = {
            linear: "(c*t/d+b)", // linear(t, b, c, d,  q1, q1, q3, q4)
                                 //     t:Number - current time (from 0)
                                 //     b:Number - beginning value
                                 //     c:Number - change in value(delta value), (end - begin)
                                 //     d:Number - duration(unit: ms)
                                 // q1~q4:Number - tmp arg
        // --- Quad ---
            inquad: "(q1=t/d,c*q1*q1+b)",
           outquad: "(q1=t/d,-c*q1*(q1-2)+b)",
         inoutquad: "(q1=t/(d*0.5),q1<1?c*0.5*q1*q1+b:-c*0.5*((--q1)*(q1-2)-1)+b)",
        // --- Cubic ---
           incubic: "(q1=t/d,c*q1*q1*q1+b)",
          outcubic: "(q1=t/d-1,c*(q1*q1*q1+1)+b)",
        inoutcubic: "(q1=t/(d*0.5),q1<1?c*0.5*q1*q1*q1+b:c*0.5*((q1-=2)*q1*q1+2)+b)",
        outincubic: "(q1=t*2,q2=c*0.5,t<d*0.5?(q3=q1/d-1,q2*(q3*q3*q3+1)+b)" +
                                            ":(q3=(q1-d)/d,q2*q3*q3*q3+b+q2))",
        // --- Quart ---
           inquart: "(q1=t/d,c*q1*q1*q1*q1+b)",
          outquart: "(q1=t/d-1,-c*(q1*q1*q1*q1-1)+b)",
        inoutquart: "(q1=t/(d*0.5),q1<1?c*0.5*q1*q1*q1*q1+b" +
                                      ":-c*0.5*((q1-=2)*q1*q1*q1-2)+b)",
        outinquart: "(q1=t*2,q2=c*0.5,t<d*0.5?(q3=q1/d-1,-q2*(q3*q3*q3*q3-1)+b)" +
                                            ":(q4=q1-d,q3=q4/d,q2*q3*q3*q3*q3+b+q2))",
        // --- Back ---
            inback: "(q1=t/d,q2=1.70158,c*q1*q1*((q2+1)*q1-q2)+b)",
           outback: "(q1=t/d-1,q2=1.70158,c*(q1*q1*((q2+1)*q1+q2)+1)+b)",
         inoutback: "(q1=t/(d*0.5),q2=1.525,q3=1.70158," +
                        "q1<1?(c*0.5*(q1*q1*(((q3*=q2)+1)*q1-q3))+b)" +
                            ":(c*0.5*((q1-=2)*q1*(((q3*=q2)+1)*q1+q3)+2)+b))",
         outinback: "(q1=t*2,q2=c*0.5," +
                        "t<d*0.5?(q3=q1/d-1,q4=1.70158,q2*(q3*q3*((q4+1)*q3+q4)+1)+b)" +
                               ":(q3=(q1-d)/d,q4=1.70158,q2*q3*q3*((q4+1)*q3-q4)+b+q2))",
        // --- Bounce ---
          inbounce: "(q1=(d-t)/d,q2=7.5625,q3=2.75,c-(q1<(1/q3)?(c*(q2*q1*q1)+0)" +
                    ":(q1<(2/q3))?(c*(q2*(q1-=(1.5/q3))*q1+.75)+0):q1<(2.5/q3)" +
                    "?(c*(q2*(q1-=(2.25/q3))*q1+.9375)+0)" +
                    ":(c*(q2*(q1-=(2.625/q3))*q1+.984375)+0))+b)",
         outbounce: "(q1=t/d,q2=7.5625,q3=2.75,q1<(1/q3)?(c*(q2*q1*q1)+b)" +
                    ":(q1<(2/q3))?(c*(q2*(q1-=(1.5/q3))*q1+.75)+b):q1<(2.5/q3)" +
                    "?(c*(q2*(q1-=(2.25/q3))*q1+.9375)+b)" +
                    ":(c*(q2*(q1-=(2.625/q3))*q1+.984375)+b))"
    };
    for (fn in easing) {
        Math[fn] = new Function("t,b,c,d,q1,q2,q3,q4", "return " + easing[fn]);
        Math[fn].src = easing[fn];
    }
//}@easing
}

// --- Class Hash ------------------------------------------
function HashFactory(obj) { // @arg Object/Hash:
                            // @ret Hash:
                            // @help: mm
    return obj instanceof Hash ? new Hash(mm_copy(obj)) // copy constructor
                               : new Hash(obj);
}

function Hash(obj) { // @arg Object:
                     // @help: mm.Hash
    Object_collectOwnProperties(this, obj);
}

function _defineHashPrototype(wiz) {
    wiz(Hash.prototype, {
        __CLASS__:  "hash",
        // --- mixin ---
        mix:        function(extend, override) {
                                      mm_mix(this, extend.valueOf(), override); return this; /* @help: Hash#mix */ },
        // --- match ---
        has:        function(find)  { return Object_has(this, find.valueOf());  /* @help: Hash#has   */ },
        like:       function(value) { return Object_like(this, value.valueOf());/* @help: Hash#like  */ },
        some:       function(fn)    { return Object_some(this, fn);             /* @help: Hash#some  */ },
        every:      function(fn)    { return Object_every(this, fn);            /* @help: Hash#every */ },
        match:      function(fn)    { return Object_filter(this, fn, true);     /* @help: Hash#match */ },
        filter:     function(fn)    { return Object_filter(this, fn, false);    /* @help: Hash#filter*/ },
        // --- iterate ---
        map:        function(fn)    { return Object_map(this, fn);    /* @help: Hash#map   */ },
        each:       function(fn)    {        Object_each(this, fn);   /* @help: Hash#each  */ },
        // --- generate ---
        copy:       function()      { return new Hash(mm_copy(this)); /* @help: Hash#copy  */ },
        pack:       function(glue, joint) {
                                      return Object_pack(this, glue, joint);     /* @help: Hash#pack  */ },
        clean:      function(only)  { return new Hash(Object_clean(this, only)); /* @help: Hash#clean */ },
        // --- enumerate ---
        count:      function()      { return Object_count(this);      /* @help: Hash#count */ },
        keys:       function()      { return Object.keys(this);       /* @help: Hash#keys  */ },
        values:     function()      { return Object_values(this);     /* @help: Hash#values*/ },
        // --- manipulate ---
        get:        function(key)   { return this[key];               /* @help: Has#get    */ },
        set:        function(key, value) {
                                      this[key] = value; return this; /* @help: Has#set    */ },
        clear:      function()      { return Object_clear(this);      /* @help: Hash#clear */ },
        // --- utility ---
        help:       function()      { return Function_help(Hash); },
        dump:       function()      { return mm_dump.argsApply(null, this, arguments);  /* @help: Hash#dump   */ },
        freeze:     function()      {        Object.freeze(this); return this;          /* @help: Hash#freeze */ },
        toJSON:     function()      { return JSON.stringify(this.valueOf());            /* @help: Hash#toJSON */ },
        valueOf:    function()      { return Object_collectOwnProperties({}, this); },
        toString:   function()      { return mm_dump(this, -1, 100); }
    }, true); // override (Object#valueOf, Object#toString)
}

// --- Messaging -------------------------------------------
function Msg() {
    this._deliverable = {}; // deliverable instance db { __CLASS_UID__: instance, ... }
    this._broadcast   = []; // broadcast address
    Object.defineProperty(this, "__CLASS__",     { value: "msg" });
    Object.defineProperty(this, "__CLASS_UID__", { value: mm_uid("mm.class") });
}
Msg.prototype = {
    bind:           Msg_bind,           // Msg#bind(...):this
    unbind:         Msg_unbind,         // Msg#unbind(...):this
    list:           Msg_list,           // Msg#list():ClassNameStringArray
    to:             Msg_to,             // Msg#to(...):WrapperedObject
    post:           Msg_post,           // Msg#post(msg:String, ...):this
    send:           Msg_send            // Msg#send(msg:String, ...):ResultArray
};

// --- Await -----------------------------------------------
function Await(fn,     // @arg Function: callback({ ok, args, state })
               waits,  // @arg Integer: wait count
               tick) { // @arg Function(= null): tick callback({ ok, args, state })
                       // @help: Await
    this._db = {
        missable: 0,    // Integer: missable
        waits: waits,   // Integer: waits
        pass:  0,       // Integer: pass() called count
        miss:  0,       // Integer: miss() called count
        state: 100,     // Integer: 100(continue) or 200(success) or 400(error)
        args:  [],      // Array: pass(arg), miss(arg) collections
        tick:  tick || null,
        fn:    fn
    };
    Object.defineProperty(this, "__CLASS__",     { value: "await" });
    Object.defineProperty(this, "__CLASS_UID__", { value: mm_uid("mm.class") });
}
Await.prototype = {
    missable:       Await_missable,     // Await#missable(count:Integer):this
    pass:           Await_pass,         // Await#pass(value:Mix = undefined):this
    miss:           Await_miss,         // Await#miss(value:Mix = undefined):this
    state:          Await_state         // Await#state():Integer
};

// --- library scope vars ----------------------------------
var _base64_db,
    _mm_uid_db = {},
    _mm_log_db = [],
    _mm_log_index = 0,
    _mm_conv_db,
    _mm_help_db = [], // [ <url, rex>, ... ]
    _mm_type_alias_db = {
        "NodeList": "list",
        "Arguments": "list",
        "NamedNodeMap": "attr",
        "HTMLCollection": "list",
        "CSSStyleDeclaration": "style"
    };

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

function Interface(name,   // @arg String:
                   spec) { // @arg Object: { key: typeString, ... }
                           // @help: mm.Interface
//
//  TypeScript:
//      interface Point { x: number; y: number; }
//
//  monogram.js:
//      mm.Interface("Point", { x: "number", y: "number" });
//
    if (name in mm) {
        throw new TypeError("ALREADY_EXISTS: " + name);
    }
    mm.Interface[name] = spec;
}

function ClassFactory(specs,      // @arg String: "Class:Traits:Interface:BaseClass"
                      properties, // @arg Object(= undefined): prototype method and literals
                      statics) {  // @arg Object(= undefined): static method and literals
                                  // @ret Function: initializer
                                  // @help: mm.Class
/*
//{@debug
    mm.allow("specs",      specs,      "String"); // "Class:Singleton:Interface:Base"
    mm.allow("properties", properties, "Object/undefined");
    mm.allow("statics",    statics,    "Object/undefined");
//}@debug
 */

    properties = properties || {};

    var InheritBaseClass,
        spec = _parseClassSpec(specs); // { klass: String, traits: StringArray,
                                       //   base: String, ifs: StringArray }
    // --- validate class ---
    if (mm.Class[spec.klass]) { // already?
        return mm[spec.klass];
    }
    // --- validate interface ---
    spec.ifs.each(function(name) {
        mm_allow("properties", properties, name);
    });

    // --- class definition ---
    mm.Class[spec.klass] = spec.klass;
    mm[spec.klass] = spec.traits.has("Singleton") ? SingletonClass
                                                  : GenericClass;

    if (spec.base) {
        InheritBaseClass = function() {};
        InheritBaseClass.prototype = mm[spec.base].prototype;
        mm[spec.klass].prototype = new InheritBaseClass();

        mm_mix(mm[spec.klass].prototype, properties, true); // override mixin prototype.methods
        mm[spec.klass].prototype.constructor = mm[spec.klass];
        mm[spec.klass].prototype.__BASE__ = mm_mix({}, mm[spec.base].prototype);
    } else {
        mm_mix(mm[spec.klass].prototype, properties); // mixin prototype.methods
        mm[spec.klass].prototype.__BASE__ = null;
    }
    mm[spec.klass].prototype.callSuper = _callSuperMethod;

    statics && mm_mix(mm[spec.klass], statics);

    if (spec.traits.has("Singleton") && !spec.traits.has("SelfInit")) {
        mm["i" + spec.klass] = new mm[spec.klass];
    }
    return mm[spec.klass];

    function SingletonClass(ooo) { // @var_args Mix: constructor arguments
        if (!SingletonClass.__INSTANCE__) {
             SingletonClass.__INSTANCE__ = this; // keep self instance

            _factory(this, arguments);
        }
        return SingletonClass.__INSTANCE__;
    }

    function GenericClass(ooo) { // @var_args Mix: constructor arguments
        _factory(this, arguments);
    }

    function _factory(that, args) { // @lookup: className, properties,
        Object.defineProperty(that, "__CLASS__",     { value: spec.klass.toLowerCase() });
        Object.defineProperty(that, "__CLASS_UID__", { value: mm_uid("mm.class") });

        var obj = that, stack = [];

        // --- constructor chain --- (Base#init -> Class#init)
        while (obj = obj.__BASE__) {
            obj.init && stack.push(obj);
        }
        while (obj = stack.pop()) {
            obj.init.apply(that, args);
        }

        // [!] call Class#init(args, ...)
        properties.init && properties.init.apply(that, args);

        that.gc = function() {
            // [!] call Class#gc
            properties.gc && properties.gc.call(that);

            // --- gc chain --- (Class#gc -> Base#gc)
            obj = that;
            while (obj = obj.__BASE__) {
                obj.gc && obj.gc.call(that);
            }

            if (spec.traits.has("Singleton")) {
                delete SingletonClass.__INSTANCE__;
                delete mm["i" + spec.klass];
            }
            Object_clear(that); // destroy them all
            that.gc = function GCSentinel() {
                mm_log("GC_BAD_CALL");
            };
        };
    }
}

function _callSuperMethod(name,  // @arg String: method name
                          ooo) { // @var_args Mix: args
                                 // @ret Mix/undefined:
                                 // @inner: this.callSuper("method", args, ...)
/*
//{@debug
    mm.allow("name", name, "String");
//}@debug
 */
    var obj = this,
        args = Array.prototype.slice.call(arguments, 1);

    while (obj = obj.__BASE__) {
        if (typeof obj[name] === "function") {
            return obj[name].apply(this, args);
        }
    }
    args.unshift(name);
    return this.trap.apply(this, args); // call trap(method, ...)
}

function _parseClassSpec(ident) { // @arg StringArray: "Class:Trait:Base"
                                  // @ret Object: { klass, traits, base, ifs }
                                  //        klass - String: "Class"
                                  //        traits - StringArray: ["Singleton", "SelfInit"]
                                  //        base - String: "BaseClass"
                                  //        ifs - StringArray: ["Interface", ...]
                                  // @throw: TypeError("CLASS_NAME_NOT_FOUND"),
                                  //         TypeError("CLASS_NAME_MULTIPLE_INHERITANCE: ..."),
                                  //         TypeError("TRAITS_OR_CLASS_NAME_NOT_FOUND: ...")
                                  // @inner: parse traits and base class string
    var TRAITS = ["Singleton", "SelfInit"],
        ary = ident.split(":"), name,
        rv = { klass: "", traits: [], base: "", ifs: [] };

    rv.klass = ary.shift(); // "Class:Base" -> "Class"
    if (!rv.klass) {
        throw new TypeError("CLASS_NAME_NOT_FOUND");
    }
    while (name = ary.shift()) {
        if (name in mm.Interface) {
            rv.ifs.push(name);
        } else if (TRAITS.has(name)) {
            rv.traits.push(name);
        } else if (mm.Class[name]) { // already Class
            if (rv.base) {
                throw new TypeError("CLASS_NAME_MULTIPLE_INHERITANCE: " + name);
            }
            rv.base = name;
        } else {
            throw new TypeError("TRAITS_OR_CLASS_NAME_NOT_FOUND: " + name);
        }
    }
    return rv;
}

// --- mixin ---
function mm_arg(arg,        // @arg Object/Function/undefined: { argument-name: value, ... }
                defaults) { // @arg Object: default argument. { argument-name: value, ... }
                            // @ret Object: arg
                            // @help: mm.arg
                            // @desc: supply default argument values
/*                            
//{@debug
    mm.allow("arg",      arg,      "Object/Function/undefined");
    mm.allow("defaults", defaults, "Object");
//}@debug
 */
    return arg ? mm_mix(arg, defaults) : defaults;
}

function mm_mix(base,       // @arg Object/Function: base object. { key: value, ... }
                extend,     // @arg Object: key/value object. { key: value, ... }
                override) { // @arg Boolean(= false): override
                            // @ret Object/Function: base
                            // @help: mm.mix
                            // @desc: mixin values. do not look prototype chain.
// [!] mm.allow prohibited

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

function mm_wiz(base,       // @arg Object/Function:
                extend,     // @arg Object:
                override) { // @arg Boolean(= false): override
                            // @help: mm.wiz
                            // @desc: prototype extend without enumerability,
                            //        mixin with "invisible" magic.
                            //        do not look prototype chain.
// [!] mm.allow prohibited
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

// --- match ---
function mm_has(data,   // @arg Mix:
                find) { // @arg Mix: { key: value, ... }
                        // @ret Boolean:
                        // @help: mm.has
                        // @desc: has hash pair(s).
                        //        do not look prototype chain.
    return !mm && typeof (data || 0).has === "function" ? data.has(find)
                                                        : Object_has(data, find);
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
                                                         : Object_like(lval, rval);
}

// --- iterate / enumerate ---
function mm_map(data, // @arg Object/Function/Array/Hash: data
                fn) { // @arg Function: callback function
                      // @ret Array: [result, ...]
                      // @help: mm.map
                      // @desc: mm#map, Array#map
    return !mm && typeof data.map === "function" ? data.map(fn)
                                                 : Object_map(data, fn);
}

function mm_each(data, // @arg Object/Function/Array/Hash: data
                 fn) { // @arg Function: callback function
                       // @help: mm.each
                       // @desc: each object
    typeof !mm && data.each === "function" ? data.each(fn)
                                           : Object_each(data, fn);
}

function mm_some(data, // @arg Object/Function/Array/Hash: data
                 fn) { // @arg Function: fn(value, key)
                       // @ret Boolean:
                       // @help: mm.some
                       // @desc: return true if the return fn(value, key) is truthy
    return !mm && typeof data.some === "function" ? data.some(fn)
                                                  : Object_some(data, fn);
}

function mm_every(data, // @arg Object/Function/Array/Hash: data
                  fn) { // @arg Function: fn(value, key)
                        // @ret Boolean:
                        // @help: mm.every
                        // @desc: return false if the return fn(value, key) is falsy
    return !mm && typeof data.every === "function" ? data.every(fn)
                                                   : Object_every(data, fn);
}

function mm_match(data, // @arg Object/Function/Array/Hash: data
                  fn) { // @arg Function: fn(value, key)
                        // @ret Mix/undefined:
                        // @help: mm.match
                        // @desc: return value if the return fn(value, key) is truthy
    return !mm && typeof data.match === "function" ? data.match(fn)
                                                   : Object_filter(data, fn, true);
}

function mm_filter(data, // @arg Object/Function/Array/Hash: data
                   fn) { // @arg Function: fn(value, key)
                         // @ret Array:
                         // @help: mm.filter
                         // @desc: return array if the return fn(value, key) is truthy
    return !mm && typeof data.filter === "function" ? data.filter(fn)
                                                    : Object_filter(data, fn, false);
}

function mm_count(data) { // @arg Object/Function/Array/Hash: data
                          // @ret Object: { value: value-count, ... }
                          // @help: mm.count
                          // @desc: count the number of values
    return !mm && typeof data.count === "function" ? data.count()
                                                   : Object_count(data);
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
                                                    : Object_values(data);
}

// --- utility ---
function mm_nop() { // @help: mm.nop
                    // @desc: no operation function
}

function mm_uid(group) { // @arg String(= ""): uid group name.
                         // @ret Integer: unique number, at 1 to 0x1fffffffffffff
                         // @help: mm.uid
                         // @desc: get unique id
    _mm_uid_db[group] || (_mm_uid_db[group] = 0);

    // IEEE754 fraction size. 0x1fffffffffffff = Math.pow(2, 53) - 1
    if (++_mm_uid_db[group] >= 0x1fffffffffffff) { // overflow?
          _mm_uid_db[group] = 1; // reset
    }
    return _mm_uid_db[group];
}

function mm_cast(mix) { // @arg Attr/Hash/List/FakeArray/Style/DateString/Mix:
                        // @ret Object/Array/Date/Mix:
                        // @help: mm.cast
                        // @desc: remove the characteristic
    switch (mm_type(mix)) {
    case "attr":    return _mm_cast_attr(mix);    // cast(Attr) -> Object
    case "hash":    return mix.valueOf();         // cast(Hash) -> Object
    case "list":    return Array.from(mix);       // cast(List) -> Array
    case "style":   return _mm_cast_style(mix);   // cast(Style) -> Object
    case "string":  return Date.from(mix) || mix; // cast(DateString) -> Date/String
    }
    return mix;
}

function _mm_cast_attr(mix) { // @arg Attr: NamedNodeMap
                              // @ret Object:
                              // @inner:
    var rv = {}, i = 0, attr;

    for (; attr = mix[i++]; ) {
        rv[attr.name] = attr.value;
    }
    return rv;
}

function _mm_cast_style(mix) { // @arg Style: CSSStyleDeclaration
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

function mm_copy(mix,    // @arg Mix: source object
                 depth,  // @arg Integer(= 0): max depth, 0 is infinity
                 hook) { // @arg Object(= undefined): handle the unknown object
                         // @ret Mix/null: copied object, null is fail
                         // @throw: TypeError("UNKNOWN_TYPE: ...")
                         // @help: mm.copy
                         // @desc: Object with the reference -> deep copy
                         //        Object without the reference -> shallow copy
                         //        do not look prototype chain.
    return _recursiveCopy(mix, depth || 0, hook || null, 0);
}

function _recursiveCopy(mix, depth, hook, nest) { // @inner:
    if (depth && nest > depth) {
        return;
    }
    var rv, keys, i = 0, iz;

    switch (mm_type(mix)) {
    // --- deep copy ---
    case "undefined":
    case "null":    return "" + mix; // "null" or "undefined"
    case "boolean":
    case "string":
    case "number":  return mix.valueOf();
    case "regexp":  return RegExp(mix.source,
                                  (mix + "").slice(mix.source.length + 2));
    case "date":    return new Date(+mix);
    case "array":
        for (rv = [], iz = mix.length; i < iz; ++i) {
            rv[i] = _recursiveCopy(mix[i], depth, hook, nest + 1);
        }
        return rv;
    case "hash":
    case "object":
        for (rv = {}, keys = Object.keys(mix), iz = keys.length; i < iz; ++i) {
            rv[keys[i]] = _recursiveCopy(mix[keys[i]], depth, hook, nest + 1);
        }
        return rv;
    // --- shallow copy (by reference) ---
    case "function":
        return mix;
    }
    if (hook) {
        return hook(mix);
    }
    throw new TypeError("UNKNOWN_TYPE: " + mix);
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

    _mm_conv_db || _mm_conv_init();

    return _mm_conv_db[code] || {};

    function _mm_conv_init() {
        _mm_conv_db = { 0x12: {}, 0x21: {}, 0x14: {}, 0x41: {} };

        var i = 0, hex, bin;

        for (; i < 0x100; ++i) {
            hex = (i + 0x100).toString(16).slice(1);
            bin = String.fromCharCode(i);
            _mm_conv_db[0x12][i]   = hex;    // {   255 :   "ff" }
            _mm_conv_db[0x21][hex] = i;      // {   "ff":   255  }
            _mm_conv_db[0x14][i]   = bin;    // {   255 : "\255" }
            _mm_conv_db[0x41][bin] = i;      // { "\255":   255  }
        }
        // http://twitter.com/edvakf/statuses/15576483807
        for (i = 0x80; i < 0x100; ++i) { // [Webkit][Gecko]
            _mm_conv_db[0x41][String.fromCharCode(0xf700 + i)] = i; // "\f780" -> 0x80
        }
    }
}

function mm_dump(mix,     // @arg Mix: data
                 spaces,  // @arg Integer(= 4): spaces, -1, 0 to 8
                 depth) { // @arg Integer(= 5): max depth, 0 to 100
                          // @ret String:
                          // @help: mm.dump
                          // @desc: Dump Object
    spaces = spaces === void 0 ? 4 : spaces;
    depth  = depth || 5;

//{@debug
    mm.deny("spaces", spaces, (spaces < -1 || spaces > 8  ));
    mm.deny("depth",  depth,  (depth  <  1 || depth  > 100));
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
                     lf + " ".repeat(spaces * (nest - 1)) + "]";
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
                          lf + " ".repeat(spaces * (nest - 1)) + "}";

        function _getClassOrFunctionName(mix) {
            if (mix.typeFunction) { // mix is function
                return mix.nickname("") + "()" + sp;
            }
            // Class name detection
            return mix.__CLASS__ ? "mm." + mix.__CLASS__ + sp : "";
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
            return "<@@@@>".at(name, roots.test(name) ? "" : " " + node.path());
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
        indent = " ".repeat(spaces * nest);

    switch (mm_type(mix)) {
    case "null":
    case "global":
    case "number":
    case "boolean":
    case "undefined":   return "" + mix;
    case "date":        return mix.toJSON();
    case "node":        return _dumpNode(mix);
    case "attr":        return _dumpObject(_mm_cast_attr(mix));
    case "list":
    case "array":       return _dumpArray(mix);
    case "style":       return _dumpObject(_mm_cast_style(mix));
    case "regexp":      return "/" + mix.source + "/";
    case "hash":        return _dumpObject(mix.valueOf());
    case "object":
    case "function":    return _dumpObject(mix);
    case "string":      return '"' + _toJSONEscapedString(mix) + '"';
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
                                           : Object_pack(data, glue, joint);

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
                                            : Object_clean(data, only);
}

// --- assert / debug ---
function mm_say(mix) { // @arg Mix:
                       // @ret Boolean: true
                       // @help: mm.say
                       // @desc: console.log(mm.dump(mix)) short hand
    global.console && global.console.log(mm_dump(mix));
    return true;
}

function mm_alert(mix) { // @args Mix:
                         // @ret Boolean: true
                         // @help: mm.alert
                         // @desc: alert(mm.dump(mix)) short hand
    alert(mm_dump(mix));
    return true;
}

function mm_deny(name,    // @arg String: argument name, function spec
                 mix,     // @arg Mix:
                 judge) { // @arg Function/Boolean/TypeNameString:
                          // @help: mm.deny
                          // @desc: raise an assertion in a type match
    mm_allow(mix, judge, name, true);
}

function mm_allow(name,         // @arg String: argument name, function spec
                  mix,          // @arg Mix:
                  judge,        // @arg Function/Boolean/InterfaceNameString/TypeNameString:
                                //          types: "Primitive/Global/List/Node/Hash/Class"
                                //                 "null/undefined/Boolean/Number/Integer/String"
                                //                 "Date/Object/Array/Function/RegExp/Array"
                  __negate__) { // @hidden Boolean(= false):
                                // @help: mm.allow
                                // @desc: raise an assertion in a type mismatch
    __negate__ = __negate__ || false;

    var assert = false, origin = "";

    if (judge == null) { // mm.allow(mix, undefined or null) -> nop
        return;
    }
    switch (typeof judge) {
    case "function": assert = !(judge(mix) ^ __negate__); break;
    case "boolean":  assert = !(judge      ^ __negate__); break;
    case "string":   assert = !(judge.split("/").some(function(type) {
            if (mix) {
                if (type in mm.Interface) {
                    // http://uupaa.hatenablog.com/entry/2012/10/05/173226
                    origin = "interface";
                    return _judgeInterface(mix, mm.Interface[type]);
                }
                if (type in mm.Class) {
                    return true;
                }
            }
            return _judgeType(mix, type);
        }) ^ __negate__);
        break;
    default:
        throw new TypeError("BAD_ARG");
    }
    if (assert) { // http://uupaa.hatenablog.com/entry/2011/11/18/115409
        debugger;
        try {
            var caller   = mm.strict ? null : (arguments.callee || 0).caller,
                nickname = caller ? caller.nickname() : "???",
                asserter = __negate__ ? "mm.deny" : "mm.allow",
                msg      = "";

            msg = _msg(name, caller, nickname, asserter);

            if (origin === "interface") {
                msg += "\ninterface @@ @@\n".at(judge, mm_dump(mm.Interface[judge]));
            }
            throw new TypeError(msg);
        } catch (o_o) {
            mm_log(mm.env.chrome ? o_o.stack.replace(/at eval [\s\S]+$/m, "")
                                 : o_o + "");
            throw new TypeError("ASSERTION");
        }
    }

    function _msg(name, caller, nickname, asserter) {
        var rv = "",
            line   = ">>> " + nickname + " in " + asserter + "(";
            indent = " ".repeat(line.length);

        rv = Function_help_url(caller) + "\n\n" +
             line +
             name + ", " + judge + ")\n" +
             indent + "~".repeat(name.length) + "\n" +
             indent + mm_dump(mix, 0) + "\n";
        return rv;
    }
}

function _judgeInterface(mix, spec) {
    return Object_every(spec, function(type, key) {
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

function _judgeType(mix, type) {
    type = type.toLowerCase();
    if (type === "mix") {
        return true;
    }
    if (mix == null && type === mix + "") { // "null" or "undefined"
        return true;
    }
    return type === "void"      ? mix === void 0
         : type === "this"      ? !!mix.__CLASS__
         : type === "class"     ? !!mix.__CLASS__
         : type === "integer"   ? Number.isInteger(mix)
         : type === "primitive" ? mix == null || typeof mix !== "object"
         : type === mm_type(mix);
}

function mm_perf() { // @ret Object: { processing, redirect, appcache, dns, dom, load, fetch }
                     //       processing - Number: Processing time
                     //       redirect - Number: redirect elapsed
                     //       appcache - Number: Application cache elapsed
                     //       dns      - Number: DomainLookup elapsed
                     //       dom      - Number: DOMContentLoaded event elapsed
                     //       load     - Number: window.load event elapsed
                     //       fetch    - Number: fetchStart to window.load event finished
                     // @help: mm.perf
                     // @desc: calc performance data

    var tm = (global.performance || 0).timing || 0;

    if (!tm) {
        return { processing: 0, redirect: 0, appcache: 0,
                 dns: 0, dom: 0, load: 0, fetch: 0 };
    }
    return {
        processing: tm.loadEventStart - tm.responseEnd,
        redirect:   tm.redirectEnd - tm.redirectStart,
        appcache:   tm.domainLookupStart - tm.fetchStart,
        dns:        tm.domainLookupEnd - tm.domainLookupStart,
        dom:        tm.domContentLoadedEventEnd - tm.domContentLoadedEventStart,
        load:       tm.loadEventEnd - tm.loadEventStart,
        fetch:      tm.loadEventEnd - tm.fetchStart
    };
}

function mm_pollution() { // @ret StringArray: [key, ...]
                          // @help: mm.pollution
                          // @desc: detect global object pollution
    if (mm_pollution._keys) {
        return mm_pollution._keys.xor( Object.keys(global) ); // Array#xor
    }
    mm_pollution._keys = Object.keys(global);
    return [];
}


// --- type / detect ---
function mm_type(mix) { // @arg Mix: search
                        // @ret TypeLowerCaseString:
                        // @help: mm.type
                        // @desc: get type/class name
    var rv, type;

    rv = mix === null   ? "null"
       : mix === void 0 ? "undefined"
       : mix === global ? "global"
       : mix.nodeType   ? "node"
       : mix.__CLASS__  ? mix.__CLASS__ // ES Spec: [[Class]] like internal property
       : "";

    if (rv) {
        return rv;
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
        if (mix[mm.strict ? "" : "callee"] ||
            typeof mix.item === "function") {
            return "list"; // Arguments
        }
    }
    if (rv in _mm_type_alias_db) {
        return _mm_type_alias_db[rv];
    }
    return rv ? rv.toLowerCase() : "object";
}

function mm_type_alias(obj) { // @arg Object: { fullTypeName: shortTypeName, ... }
                                 // @help: mm.type.add
    Object_each(obj, function(value, key) {
        _mm_type_alias_db["[object " + key + "]"] = value;
    });
}

function mm_complex(arg1,   // @arg String/Object(= undefined):
                    arg2) { // @arg String/Number(= undefined):
                            // @ret Integer: 1 ~ 4
                            // @help: mm.complex
                            // @desc: detect argument combinations
    //  [1][get all items]  mm.complex() -> 1
    //  [2][get one item]   mm.complex(key:String) -> 2
    //  [3][set one item]   mm.complex(key:String, value:Mix) -> 3
    //  [4][set all items]  mm.complex({ key: value:Mix, ... }) -> 4

    return arg1 === void 0 ? 1
         : arg2 !== void 0 ? 3
         : arg1 && typeof arg1 === "string" ? 2 : 4;
}

// --- log ---
function mm_log(ooo) { // @var_args Mix: message
                       // @help: mm.log
                       // @desc: push log db
    _mm_log_db.push({ type: 0, time: Date.now(),
                      msg:  [].slice.call(arguments).join(" ") });
    _mm_log_db.length > mm_log.limit && mm_log_dump();
}

function mm_log_warn(ooo) { // @var_args Mix: message
                            // @help: mm.log.warn
                            // @desc: push log db
    _mm_log_db.push({ type: 1, time: Date.now(),
                      msg:  [].slice.call(arguments).join(" ") });
    _mm_log_db.length > mm_log.limit && mm_log_dump();
}

function mm_log_error(ooo) { // @var_args Mix: message
                             // @help: mm.log.error
                             // @desc: push log db
    _mm_log_db.push({ type: 2, time: Date.now(),
                      msg:  [].slice.call(arguments).join(" ") });
    _mm_log_db.length > mm_log.limit && mm_log_dump();
}

function mm_log_copy() { // @ret: Object { data: [log-data, ...], index: current-index }
                         // @help: mm.log.copy
                         // @desc: copy log
    return { data: _mm_log_db.copy(), index: _mm_log_index };
}

function mm_log_dump(url) { // @arg String(= ""): "" or url(http://example.com?log=@@)
                            // @help: mm.log.dump
                            // @desc: dump log
    function _stamp(db) {
        return new Date(db.time).format(db.type & 4 ? "[D h:m:s ms]:" : "[I]:");
    }
    var db = _mm_log_db, i = _mm_log_index, iz = db.length,
        console = global.console,
        space = mm.env.webkit ? "  " : "";

    if (!url) {
        if (console) {
            for (; i < iz; ++i) {
                switch (db[i].type) {
                case 0: console.log( space + _stamp(db[i]) + db[i].msg); break;
                case 1: console.warn(space + _stamp(db[i]) + db[i].msg); break;
                case 2: console.error(       _stamp(db[i]) + db[i].msg); break;
                case 4: console.log( space + _stamp(db[i]) + db[i].msg);
                case 6: console.error(       _stamp(db[i]) + db[i].msg); break;
                }
            }
        }
    } else if (url.indexOf("http") === 0) {
        if (global.Image) {
            for (; i < iz; ++i) {
                (new Image).src = url.at(db[i].msg);
            }
        }
    }
    _mm_log_index = i;
}

function mm_log_clear() { // @help: mm.log.clear
                          // @desc: clear log db
    _mm_log_index = 0;
    _mm_log_db = [];
}

function mm_logg(label,  // @arg String/Function: label (group name)
                 mode) { // @arg Integer(= 0x0): 0x4 is perf mode
                         // @ret Object: { out, error, valueOf }
                         // @help: mm.logg
                         // @desc: log group
    label = label.nickname ? label.nickname() : label;
    mode  = mode || 0;

    var now = Date.now(),
        nest = mm_logg.nest++,
        line = mm.env.lang === "ja" ? ["\u2502", "\u250c", "\u2502", "\u2514"]
                                    : ["|",      "+-",     "| ",     "`-"    ];

    _mm_log_db.push({ type: mode, time: Date.now(), msg: _msg(1, "") });
    _logg.out   = _out;
    _logg.error = _error;
    return _logg;

    function _msg(index, msg) {
        return "@@@@ @@( @@ )".at(line[0].repeat(nest), line[index], label, msg);
    }
    function _error(ooo) {
        _mm_log_db.push({ type: mode + 2, time: Date.now(),
                          msg:  _msg(2, [].slice.call(arguments).join(" ")) });
    }
    function _logg(ooo) {
        _mm_log_db.push({ type: mode, time: Date.now(),
                          msg:  _msg(2, [].slice.call(arguments).join(" ")) });
    }
    function _out() {
        _mm_log_db.push({ type: mode, time: Date.now(),
                          msg:  _msg(3, (new Date).diff(now)) });
        --mm_logg.nest;
        _mm_log_db.length > mm_log.limit && mm_log_dump();
    }
}

// --- Messaging ---
function Msg_bind(ooo) { // @var_args Instance: register drain instance
                         // @ret this:
                         // @throw: Error("NOT_DELIVERABLE")
                         // @help: Msg#bind
                         // @desc: register the drain(destination of the message) instance
    Array.prototype.slice.call(arguments).forEach(function(instance) {
        if (instance &&
            instance.__CLASS_UID__ && typeof instance.msgbox === "function") {

            this._deliverable[instance.__CLASS_UID__] = instance; // overwrite
        } else {
            throw new Error("NOT_DELIVERABLE");
        }
    }, this);

    // update broadcast address
    this._broadcast = mm_values(this._deliverable);
    return this;
}

function Msg_unbind(ooo) { // @var_args Instance: drain instance. undefined is unbind all instance
                           // @ret this:
                           // @help: Msg#unbind
                           // @desc: unregister drain instance
    var args = arguments.length ? Array.prototype.slice.call(arguments)
                                : this._broadcast;

    args.each(function(instance) {
        if (instance.__CLASS_UID__) {
            delete this._deliverable[instance.__CLASS_UID__];
        }
    }, this);

    // update broadcast address
    this._broadcast = mm_values(this._deliverable);
    return this;
}

function Msg_list() { // @ret ClassNameStringArray: [className, ...]
                      // @help: Msg#list
                      // @desc: get registered instance list
    return mm.map(this._deliverable, function(instance) {
        return instance.__CLASS__;
    });
}

function Msg_to(ooo) { // @var_args Instance: delivery to address.
                       //            undefined   is Broadcast
                       //            Instance    is Unicast
                       //            instance... is Multicast
                       // @ret WrapperedObject: { that, addr, deli, post, send }
                       // @help: Msg#to
                       // @desc: set destination address
    var deli = {}, i;

    for (i in this._deliverable) {
        deli[i] = this._deliverable[i];
    }
    return {
        that: this,
        addr: arguments.length ? Array.prototype.slice.call(arguments)
                               : this._broadcast.concat(), // shallow copy
        deli: deli,
        post: Msg_post,
        send: Msg_send
    };
}

function Msg_send(msg,   // @arg String: msg
                  ooo) { // @var_args Mix: msgbox args. msgbox(msg, arg, ...)
                         // @ret Array: [result, ...], "NOT_DELIVERABLE" is ERROR
                         // @help: Msg#send
                         // @desc: send a message synchronously
    var rv = [], instance,
        addr = (this.addr || this._broadcast).concat(), i = 0, iz = addr.length,
        args = Array.prototype.slice.call(arguments),
        deli = this.deli || this._deliverable;

    for (; i < iz; ++i) {
        instance = deli[ addr[i].__CLASS_UID__ ];

        if (instance && instance.msgbox) {
            rv[i] = instance.msgbox.apply(instance, args);
        } else {
            rv[i] = "NOT_DELIVERABLE";
            if (instance) {
                mm_log(msg + " is not deliverable. " + instance.__CLASS__);
            }
        }
    }
    return rv;
}

function Msg_post(msg,   // @arg String: msg
                  ooo) { // @var_args Mix: msgbox args. msgbox(msg, arg, ...)
                         // @ret this:
                         // @help: Msg#post
                         // @desc: post a message asynchronously
    var addr = (this.addr || this._broadcast).concat(), // shallow copy
        args = Array.prototype.slice.call(arguments),
        deli = this.deli || this._deliverable;

    0..wait(function() {
        var instance, i = 0, iz = addr.length;

        for (; i < iz; ++i) {
            instance = deli[ addr[i].__CLASS_UID__ ];

            if (instance && instance.msgbox) {
                instance.msgbox.apply(instance, args);
            } else {
                if (instance) {
                    mm_log(msg + " is not deliverable. " + instance.__CLASS__);
                }
            }
        }
    });
    return this.that || this;
}

function Date_from(date) { // @arg Date/String:
                           // @ret Date/null:
                           // @help: Date.from
                           // @desc: parse date string
    if (date.typeDate) {
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
    return deep ? mm_copy(this)  // deep copy
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

function Array_toArray() { // @ret Array:
                           // @help: Array#toArray
                           // @desc: array to array
                           // @see: NodeList#toArray, HTMLCollection#toArray
    return this;
}

function Array_toUTF8Array() { // @ret UTF8Array:
                               // @help: Array#toUTF8Array
                               // @desc: convert UTF16Array to UTF8Array
                               // @see: https://gist.github.com/4185267
    var rv = [], i = 0, iz = this.length, c = 0, d = 0, u = 0;

    while (i < iz) {
        c = this[i++];
        if (c <= 0x7F) { // [1]
            // 00000000 0zzzzzzz
            rv.push(c);                                       // 0zzz zzzz (1st)
        } else if (c <= 0x07FF) { // [2]
            // 00000yyy yyzzzzzz
            rv.push(c >>>  6 & 0x1f | 0xc0,                   // 110y yyyy (1st)
                    c        & 0x3f | 0x80);                  // 10zz zzzz (2nd)
        } else if (c <= 0xFFFF) { // [3] or [5]
            if (c >= 0xD800 && c <= 0xDBFF) { // [5] Surrogate Pairs
                // 110110UU UUwwwwxx 110111yy yyzzzzzz
                d = this[i++];
                u = (c >>> 6 & 0x0f) + 1; // 0xUUUU+1 -> 0xuuuuu
                rv.push(
                     u >>>  2 & 0x07 | 0xf0,                  // 1111 0uuu (1st)
                    (u <<   4 & 0x30 | 0x80) | c >>> 2 & 0xf, // 10uu wwww (2nd)
                    (c <<   4 & 0x30 | 0x80) | d >>> 6 & 0xf, // 10xx yyyy (3rd)
                     d        & 0x3f | 0x80);                 // 10zz zzzz (4th)
            } else {
                // xxxxyyyy yyzzzzzz
                rv.push(c >>> 12 & 0x0f | 0xe0,               // 1110 xxxx (1st)
                        c >>>  6 & 0x3f | 0x80,               // 10yy yyyy (2nd)
                        c        & 0x3f | 0x80);              // 10zz zzzz (3rd)
            }
        } else if (c <= 0x10FFFF) { // [4]
            // 000wwwxx xxxxyyyy yyzzzzzz
            rv.push(c >>> 18 & 0x07 | 0xf0,                   // 1111 0www (1st)
                    c >>> 12 & 0x3f | 0x80,                   // 10xx xxxx (2nd)
                    c >>>  6 & 0x3f | 0x80,                   // 10yy yyyy (3rd)
                    c        & 0x3f | 0x80);                  // 10zz zzzz (4th)
        }
    }
    return rv;
}

function Array_toUTF16Array() { // @ret UTF16Array:
                                // @help: Array#toUTF16Array
                                // @desc: convert UTF8Array to UTF16Array
                                // @see: https://gist.github.com/4185267
    var rv = [], i = 0, iz = this.length,
        c = 0, d = 0, e = 0, f = 0,
        u = 0, w = 0, x = 0, y = 0, z = 0;

    while (i < iz) {
        c = this[i++];
        if (c < 0x80) {         // [1] 0x00 - 0x7F (1 byte)
            rv.push(c);
        } else if (c < 0xE0) {  // [2] 0xC2 - 0xDF (2 byte)
            d = this[i++];
            rv.push( (c & 0x1F) <<  6 | d & 0x3F );
        } else if (c < 0xF0) {  // [3] 0xE0 - 0xE1, 0xEE - 0xEF (3 bytes)
            d = this[i++];
            e = this[i++];
            rv.push( (c & 0x0F) << 12 | (d & 0x3F) <<  6 | e & 0x3F );
        } else if (c < 0xF5) {  // [4] 0xF0 - 0xF4 (4 bytes)
            d = this[i++];
            e = this[i++];
            f = this[i++];
            u = (((c & 0x07) << 2) | ((d >> 4) & 0x03)) - 1;
            w = d & 0x0F;
            x = (e >> 4) & 0x03;
            z = f & 0x3F;
            rv.push( 0xD8 | (u << 6) | (w << 2) | x,
                     0xDC | (y << 4) | z );
        }
    }
    return rv;
}

function Array_toUTF16String() { // @ret String:
                                 // @help: Array#toUTF16String
                                 // @desc: UTF16Array to String
    var rv = [], i = 0, iz = this.length, bulkSize = 10240;

    // avoid String.fromCharCode.apply(null, BigArray) exception
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, this.slice(i, i + bulkSize)) );
    }
    return rv.join("");
}

function Array_toBase64String(safe) { // @arg Boolean(= false):
                                      // @ret Base64String:
                                      // @this ByteArray:
                                      // @help: Array#toBase64
                                      // @desc: ByteArray to Base64String
    _base64_db || _initBase64();

debugger;
    var rv = [], ary = this, // this is IntegerArray
        c = 0, i = 0, iz = ary.length,
        pad = [0, 2, 1][iz % 3],
        chars = _base64_db.chars;

    --iz;
    while (i < iz) {
        c =  ((ary[i++] & 0xff) << 16) |
             ((ary[i++] & 0xff) <<  8) |
              (ary[i++] & 0xff); // 24bit
        rv.push(chars[(c >> 18) & 0x3f], chars[(c >> 12) & 0x3f],
                chars[(c >>  6) & 0x3f], chars[ c        & 0x3f]);
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    if (safe) {
        return rv.join("").replace(/\=+$/g, "").replace(/\+/g, "-").
                                                replace(/\//g, "_");
    }
    return rv.join("");
}

function Array_count() { // @ret Object: { value: value-count, ... }
                         // @help: Array#count
                         // @desc: count the number of values
    return Object_count(this);
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

function Array_average(median) { // @arg Boolean(= false): true is median `` ソートしたサンプルの中央の値を採用します
                                 //                        false is total/length `` 合計値をサンプル数で割った値を採用します
                                 // @ret Number: average
                                 // @desc: average of number elements(arithmetic mean) `` 数値要素の平均値を返します
                                 // @help: Array#average
    var ary = this.clean("number"), iz = ary.length; // Array#clean

    if (!median) {
        return ary.sum() / iz;
    }
    ary.nsort(); // 0, 1, .. 98, 99

    if (iz % 2) {
        return ary[(iz - 1) / 2];               // odd  `` 奇数(中央の値が平均値)
    }
    return (ary[iz / 2 - 1] + ary[iz / 2]) / 2; // even `` 偶数(中央の2値の平均値)
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
    var rv = [], index, i = 0, iz = this.length;

    for (; i < iz; ++i) {
        if (i in this) {
            index = compare.indexOf(this[i]);
            index >= 0 ? compare.splice(index, 1)
                       : rv.push(this[i]);
        }
    }
    return rv.concat(compare);
}

function Array_fill(value, // @arg Primitive/Object/Array/Date(= undefined): fill value
                    from,  // @arg Integer(= 0): fill from index
                    to) {  // @arg Integer(= this.length): fill to index
                           // @ret Array: new Array
                           // @see: http://www.ruby-lang.org/ja/man/html/Array.html
                           // @desc: fill value
                           // @help: Array#fill
    var rv = this.concat(), i = from || 0, iz = to || rv.length;

    switch (mm_type(value)) {
    case "date":   for (; i < iz; ++i) { rv[i] = new Date(value); } break;
    case "array":  for (; i < iz; ++i) { rv[i] = value.concat();  } break;
    case "object": for (; i < iz; ++i) { rv[i] = mm_copy(value);  } break;
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

function String_isURL(isRelative) { // @arg Boolean(= false):
                                    // @ret Boolean: true is absolute/relative url
                                    // @desc: is absolute url or relative url
                                    // @help: String#isURL
    if (isRelative) {
        return RegExp.URL.test("http://a.a/" + this.replace(/^\/+/, ""));
    }
    return /^(https?|wss?):/.test(this) ? RegExp.URL.test(this)
                                        : RegExp.FILE.test(this);
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

function String_format(ooo) { // @var_args Mix: sprintf format
                              // @ret String:
                              // @help: String#format
                              // @desc: format `` 文字列をフォーマットします
    var next = 0, index = 0, args = arguments;

    return this.replace(
                /%(?:(\d+)\$)?(#|0| )?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcs])/g, _parse);
                //   ~~~~~    ~~~~~~~ ~~~~~      ~~~~~      ~~~~~~~~~~~~~~
                //  argIndex   flag   width    precision        types
                //
    function _parse(_,        // @arg String: dummy
                    argIndex, // @arg String: matched arg index
                    flag,     // @arg String: flag (#|0| )
                    width,    // @arg String: width
                    prec,     // @arg String: precision
                    size,     // @arg String: dummy
                    types) {  // @arg String: types (%|i|d|u|o|x|X|f|c|s)

        if (types === "%") { // escape "%%" -> "%"
            return types;
        }
        index = argIndex ? parseInt(argIndex) : next++;

        // 0x0001: parse int        (%i, %d, %u, %o, %x, %X)
        // 0x0002: parse float      (%f)
        // 0x0004: to string        (%s)
        // 0x0010: negative padding control (%i, %d, %f)
        // 0x0020: to unsinged      (%u, %o, %x, %X)
        // 0x0040: add prefix       (%o -> "0", %x -> "0x", %X -> "0x")
        // 0x0080: precision        (%f, %s)
        // 0x0100: to octet         (%o)
        // 0x0200: to hex           (%x, %X)
        // 0x0800: padding          (%c)
        // 0x1000: to upper case    (%X)
        // 0x2000: get char         (%c)
        // 0x4000: check overflow   (%c)
        var BITS = {
                i: 0x0011, // "%i" padding + to int
                d: 0x0011, // "%d" padding + to int
                u: 0x0021, // "%u" padding + to unsinged
                o: 0x0161, // "%o" padding + to octet + to unsigned + add prefix("0")
                x: 0x0261, // "%x" padding + to hex   + to unsigned + add prefix("0")
                X: 0x1261, // "%X" padding + to upper case + to hex + to unsigned + add prefix("0")
                f: 0x0092, // "%f" precision + padding + to float
                c: 0x6800, // "%c" get first char + padding
                s: 0x0084  // "%s" precision + to string
            },
            bits = BITS[types], overflow, pad,
            rv = (args[index] === void 0) ? "" : args[index];

        bits & 0x0001 && (rv = parseInt(rv));
        bits & 0x0002 && (rv = parseFloat(rv));
        bits & 0x0003 && (rv = rv === rv ? rv : ""); // isNaN
        bits & 0x0004 && (rv = ((types === "s" ? rv : types) || "").toString());
        bits & 0x0020 && (rv = rv >= 0 ? rv : rv % 0x100000000 + 0x100000000);
        bits & 0x0300 && (rv = rv.toString(bits & 0x100 ? 8 : 16));
        bits & 0x0040 && flag === "#" && (rv = (bits & 0x100 ? "0" : "0x") + rv);
        bits & 0x0080 && prec && (rv = bits & 2 ? rv.toFixed(prec)
                                                : rv.slice(0, prec));
        bits & 0x6000 && (overflow = (typeof rv !== "number" || rv < 0));
        bits & 0x2000 && (rv = overflow ? "" : String.fromCharCode(rv));

        rv = bits & 0x1000 ? rv.toString().toUpperCase()
                           : rv.toString();
        // padding
        if (!(bits & 0x0800 || width === void 0 || rv.length >= width)) {
            pad = ((!flag || flag === "#") ? " " : flag).repeat(width - rv.length);
            rv  = ((bits & 0x0010 && flag === "0") && !rv.indexOf("-")) ?
                        "-" + pad + rv.slice(1) :
                        pad + rv;
        }
        return rv;
    }
}

function String_unique() { // @ret String:
                           // @help: String#unique
                           // @desc: remove duplicate characters

    return this.split("").unique().join("");
}

function String_toUTF8Array() { // @ret UTF8Array: [...]
                                // @help: String#toUTF8Array
                                // @desc: String to UTF8Array
    return this.toUTF16Array().toUTF8Array(); // String#toUTF16Array, Array#toUTF8Array
}

function String_toUTF16Array() { // @arg String:
                                 // @ret UTF16Array: [...]
                                 // @help String#toUTF16Array
                                 // @desc convert String to UTF16Array
    var rv = [], i = 0, iz = this.length;

    for (; i < iz; ++i) {
        rv[i] = this.charCodeAt(i);
    }
    return rv;
}

function String_toBase64(safe) { // @arg Boolean(= false):
                                 // @ret Base64String:
                                 // @help: String#toBase64
                                 // @desc: String to Base64String
    return this.toUTF16Array().toUTF8Array().toBase64String(safe);
}

function String_fromBase64() { // @ret String:
                               // @help: String#fromBase64
                               // @desc: decode Base64String to String
    _base64_db || _initBase64();

    var rv = [], c = 0, i = 0, ary = this.split(""),
        iz = this.length - 1,
        codes = _base64_db.codes;

    while (i < iz) {                // 00000000|00000000|00000000 (24bit)
        c = (codes[ary[i++]] << 18) // 111111  |        |
          | (codes[ary[i++]] << 12) //       11|1111    |
          | (codes[ary[i++]] <<  6) //         |    1111|11
          |  codes[ary[i++]];       //         |        |  111111
                                    //    v        v        v
        rv.push((c >> 16) & 0xff,   // --------
                (c >>  8) & 0xff,   //          --------
                 c        & 0xff);  //                   --------
    }
    rv.length -= [0, 0, 2, 1][this.replace(/\=+$/, "").length % 4]; // cut tail

    return rv.toUTF16Array().toUTF16String();
}

function _initBase64() { // @inner: init base64
    var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        i = 0;

    _base64_db = {
        chars: base.split(""),              // ["A", "B", ... "/"]
        codes: { "=": 0, "-": 62, "_": 63 } // { 65: 0, 66: 1 }
                                            // charCode and URLSafe64 chars("-", "_")
    };

    for (; i < 64; ++i) {
        _base64_db.codes[base.charAt(i)] = i;
    }
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
   mm.allow("affect", ["left", "mid", "right"].has(affect));
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
    mm.deny("digits", digits, digits && (digits < 1 || digits > 32));
    mm.deny("radix",  radix,  radix  && (radix  < 2 || radix  > 36));
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

function Number_wait(fn_that, // @arg Function/Array: callback or [that, callback]
                     ooo) {   // @var_args Mix(= undefined): callback.apply(that, var_args)
                              // @this Number: delay seconds
                              // @ret Integer: atom (setTimeout timer id)
                              // @help: Number#wait
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
                fn.apply(that, args);
            }, this * 1000);
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
    mm.deny("range", range, range && range <= 0);
//}@debug
    range = range || 256;

    // 255..frac(256) -> 1
    // 128..frac(256) -> 0.5
    return ((this * 100 / range + 0.5) | 0) / 100;
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

function Function_help(that) { // @arg this:
                               // @ret String:
                               // @help: Function#help
                               // @desc: show help url
    that = that || this;
    var url = Function_help_url(that),
        src = that.__SRC__ ? that.__SRC__ : that;

    return url + "\n\n" + that + "\n\n" + url;
}

function Function_help_url(fn) { // @arg Function/undefined:
                                 // @ret String:
                                 // @desc: get help url
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
            return m[2] === "#" ? "@@@@#@@.prototype.@@".at(url, m[1], m[1], m[3])
                 : m[2] === "." ? "@@@@#@@.@@".at(url, m[1], m[1], m[3])
                                : "@@@@".at(url, m[1]);
        }
    }
    return "";
}

function Function_help_add(url,    // @arg URLString: help url string
                           word) { // @arg String/StringArray/RegExp: keywords or pattern
                                   // @desc: add help chain
    if (typeof word === "string") {
        word = [word];
    }
    if (Array.isArray(word)) {
        word = RegExp("^(" + word.join("|") + ")(?:([#\\.])([\\w\\,]+))?$");
    }
    _mm_help_db.push(url, word);
}

function Function_argsApply(that,  // @arg this: method this
                            ooo) { // @var_args Mix:
                                   // @ret Mix:
                                   // @help: Function#argsApply
                                   // @desc: method call, expand the Arguments object
    var ary = [], args = arguments, i = 1, iz = args.length;

    for (; i < iz; ++i) {
        if (mm_type(args[i]) === "list") {
            Array.prototype.push.apply(ary, Array.from(args[i]));
        } else {
            ary.push( args[i] );
        }
    }
    return this.apply(that, ary);
}

function Function_nickname(defaultName) { // @arg String(= ""): default nickname
                                          // @ret String: function name
                                          // @help: Function#nickname
                                          // @desc: get function name
   var name = this.name || (this + "").split("\x28")[0].trim().slice(9);

    return name ? name.replace(/^mm_/, "mm.") // mm_like -> mm.like
                : defaultName; // [IE][Opera<11]
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

// --- Await -----------------------------------------------
function Function_await(waits,  // @arg Integer: wait count
                        tick) { // @arg Function(= undefined): tick callback({ ok, args, state })
                                // @ret AwaitInstance:
                                // @this: callback function. callback(result)
                                //    result - Object: { ok, args, state }
                                //      ok - Boolean: true is result.state === 200
                                //      args - Array: pass(arg) and miss(arg) args collections
                                //      state - Integer: 200(success), 400(error)
                                // @help: Await#await
                                // @desc: create Await instance
    if (!waits) {
        return this({ ok: true, args: [], state: 200 });
    }
    return new Await(this, waits, tick);
}

function Await_missable(count) { // @arg Integer: missable count
//{@debug
    if (count < 0 || count >= this._db.waits) {
        throw new Error("BAD_ARG");
    }
//}@debug
    this._db.missable = count;
    return this;
}

function Await_pass(value) { // @arg Mix(= undefined): value
                             // @ret this:
                             // @help: Await#pass
                             // @desc: pass a process
    ++this._db.pass;
    this._db.args.push(value);
    _Await_next(this._db);
    return this;
}

function Await_miss(value) { // @arg Mix(= undefined): value
                             // @ret this:
                             // @help: Await#miss
                             // @desc: miss a process
    ++this._db.miss;
    this._db.args.push(value);
    _Await_next(this._db);
    return this;
}

function _Await_next(db) {
    if (db.state === 100) {
        // `` miss が missable を超えて呼ばれている  -> 失敗
        // `` pass + miss が waits 以上呼ばれている  -> 成功
        db.state = db.miss > db.missable ? 400         // ng
                 : db.pass + db.miss >= db.waits ? 200 // ok
                 : db.state;
    }
    db.tick && db.tick({ ok: db.state === 200, args: db.args, state: db.state }); // tick callback

    if (db.state > 100) { // change state?
        if (db.fn) {
            db.fn({ ok: db.state === 200, args: db.args, state: db.state }); // end callback
            db.fn = db.tick = null;
            db.args = []; // gc
        }
    }
}

function Await_state() { // @ret Integer: current state,
                         //                 100 is continue,
                         //                 200 is success,
                         //                 400 is error
                         // @help: Await#state
                         // @desc: get current state
    return this._db.state;
}

// --- test ----------------------------------------------
function Array_test(label, // @arg String(= ""): label
                    arg) { // @arg Mix(= undefined): test arg
                           // @this: test case
                           // @throw: TypeError("NEED_BOOLEAN_RESULT_VALUE: ...")
                           //         TypeError("BAD_TYPE: ...")
                           // @help: Array#test
                           // @desc: unit test
    if (!this.length) { return; }

    var nicknames = _enumNicknames(this.clean()), // { object, array }
        plan, group, param;

    plan  = _streamTokenizer( nicknames.array.join(" > ") );
    group = plan.shift();
    param = mm.mix(nicknames.object, { arg: arg, pass: 0, miss: 0,
                                       logg: mm_logg(label || "") });

    group && _recursiveTestCase( plan, group, param );
}

function _recursiveTestCase(plan,    // @arg StringArrayArray: [[fn1, fn2, ...], [fn3, ...]]
                            group,   // @arg Array: group
                            param) { // @arg FunctionObject: { init, fin, fn1, ... }
                                     // @throw: TypeError("NEED_BOOLEAN_RESULT_VALUE: ...")
                                     //         TypeError("BAD_TYPE: ...")
                                     // @inner: do test
    var index = 0;

    group.each(function(action) { // @param String: command string. "fn1"

        var lval, rval, // left-value, right-value
            jrv, // judge function result value
            jfn, // judge function name
            msg;

        switch (mm.type(param[action])) {
        case "array": // [ left-values, right-value, override-judge-function ]
            try {
                lval = param[action][0];
                rval = param[action][1];
                jfn = param[action][2] || mm.like;
                jrv = jfn(lval, rval);
                msg = "= @@( @@ )".at( jfn.nickname(),
                                       mm_dump(lval, 0) + ", " +
                                       mm_dump(rval, 0) );
            } catch (O_o) {
                msg = O_o + "";
            }
            _callback( jrv, msg);
            break;
        case "boolean":
            _callback( param[action] );
            break;
        case "function": // function -> sync or async lazy evaluation
            jrv = param[action](_callback);

            switch (jrv) {
            case false:  // function  sync() { return false; } -> miss
            case true:   // function  sync() { return true;  } -> pass
                _callback(jrv);
                break;
            case void 0: // function  sync(no arguments) { return undefined; } -> TypeError
                         // function async(no arguments) { ...               } -> TypeError
                         // function async(next) { 0..wait(next);                        } -> pass
                         // function async(next) { 0..wait(function() { next(true);  }); } -> pass
                         // function async(next) { 0..wait(function() { next(false); }); } -> miss
                if (param[action].length) {
                    break;
                }
            default:     // function  sync() { return 123; } -> TypeError
                debugger;
                throw new TypeError("NEED_BOOLEAN_RESULT_VALUE: " + action);
            }
            break;
        default:
            debugger;
            throw new TypeError("BAD_TYPE: " + action);
        }

        function _callback(result, // @arg Boolean:
                           msg) {  // @arg String(= ""): log message
                                   // @lookup: param, action, index, group
            var miss = result === false, nextAction, tick_result;

            miss ? param.logg.error(action + ":", result, msg)
                 : param.logg(action + ":", result, msg);
            miss ? ++param.miss
                 : ++param.pass;

            if (typeof Array_test.tick === "function") {
                tick_result = Array_test.tick({ ok:   !miss,
                                                msg:  msg    || "",
                                                name: action || "",
                                                pass: param.pass,
                                                miss: param.miss });
                if (tick_result === false) { // false -> break
                    return;
                }
            }
            if (++index >= group.length) {
                nextAction = plan.shift();
                nextAction ? _recursiveTestCase( plan, nextAction, param )
                           : param.logg.out(); // end of action
            }
        }
    });
}

function _enumNicknames(ary) { // @arg FunctionArray/MixArray:
                               // @ret Object: { array, object }
                               //        array - Array: [ nickname, key, ... ]
                               //        object - Object: { nickname: fn, ... key: value ... }
                               // @desc: enum function nickname from Array
                               // @inner: enum nicknames
    var rv = { object: {}, array: [] }, i = 0, iz = ary.length, key;

    for (; i < iz; ++i) {
        key = typeof ary[i] === "function" ? ary[i].nickname("fn" + i)
                                           : "" + i;
        rv.object[key] = ary[i];
        rv.array.push(key);
    }
    return rv;
}

function _streamTokenizer(command) { // @arg String: command string. "a>b+c>d>foo"
                                     // @ret ArrayArrayString:
                                     //         exec plan. [ ["a"], ["b", "c"], ["d"], ["foo"] ]
                                     //                      ~~~~~  ~~~~~~~~~~  ~~~~~  ~~~~~~~
                                     //                      group   group       group  group
                                     //                         ________^_________
                                     //                         parallel execution
                                     // @inner: stream DSL tokenizer
    var plan = [], remain = [];

    command.match(/([\w\-\u00C0-\uFFEE]+|[/+>])/g).each(function(token) {
        token === "+" ? 0 :
        token === ">" ? (remain.length && plan.push(remain.shifts())) // Array#shifts
                      : remain.push(token);
    });
    remain.length && plan.push(remain.concat());
    return plan;
}

/*
        "fn1 > fn2 + fn3".stream({ ... })
        ~~~~~~~~~~~~~~~~~  +---------------------------+
              command    > > _streamTokenizer(command) |
                           +------------v--------------+
                                        v

                            [ [ "fn1" ],  [ "fn2", "fn3" ] ]
                                ~~~~~     ~~~~~~~~~~~~~~~~
                                action         group (parallel execution group)

                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                        plan
 */

// --- stream ----------------------------------------------
function Array_stream(delay) { // @arg String/Integer(= 0): base delay. 1 / "1" / "1s" / "1000ms"
                               // @this - FunctionArray
                               // @ret Object: { uid: number, halt: function }
                               // @help: Array#stream
                               // @desc: create Stream
    var names = _enumNicknames(this); // { array, object }

    return names.array.join(" > ").stream(names.object, delay);
}

function String_stream(methods, // @arg Object: { key: fn, ... }
                       delay) { // @arg String/Integer(= 0): base delay. 1 / "1" / "1s" / "1000ms"
                                // @ret Object: { halt: function }
                                // @this: command string. "fn1 > delay > fn2 + fn3"
                                //            fn - FunctionNameString:
                                //            delay - IntegerString/UnitizedIntegerString: "1" or "1s" is 1sec, "1ms" is 1ms
                                // @throw: TypeError("FUNCTION_NOT_FOUND: ...")
                                //         TypeError("NEED_BOOLEAN_RESULT_VALUE: ...")
                                // @desc: create stream
                                // @help: String#stream
    var commands = this.split(/\s*>+\s*/).join(delay ? ">" + delay + ">" : ">"),
        plan = _streamTokenizer(commands); // plan: [ [ "fn1" ], [ delay ], [ "fn2", "fn3" ] ]

    methods.__cancel__ = false;
    methods.__halt__ = function(action, error) {
        methods.__halt__ = mm.nop;
        methods.__cancel__ = true;
        methods.halt && methods.halt(action || "user", error || false);
    };
    plan.length && _nextStream(methods, plan);

    return { halt: methods.__halt__ }; // provide halt method
}

function _nextStream(methods, // @arg Object: { init, fin, halt, fn1, ... }
                     plan) {  // @arg StringArrayArray: [[fn1, fn2, ...], [fn3, ...]]
                              // @throw: TypeError("FUNCTION_NOT_FOUND: ...")
                              //         TypeError("NEED_BOOLEAN_RESULT_VALUE: ...")
                              // @inner: exec next stream group
    if (methods.__cancel__) {
        return;
    }
    var i = 0, group = plan.shift(); // parallel execution group. [action, ...]

    group && group.each(function(action) { // @param String: command string. "fn1"
        var r, ms, delay = /^(?:(\d+ms)|(\d+s)|(\d+))$/.exec(action);

        if (delay) { // "1", "1s", "1ms"
            ms = parseInt(delay[0]) * (delay[1] ? 1 : 1000);
            setTimeout(function() {
                _judge(true);
            }, ms);
        } else if (!(action in methods)) {
            throw new TypeError("FUNCTION_NOT_FOUND: " + action);
        } else { // action is function
            try {
                // sync or async lazy evaluation
                r = methods[action](_judge);
            } catch (O_o) { // wow?
//{@debug
                mm_log(mm.env.chrome ? O_o.stack.replace(/at eval [\s\S]+$/m, "")
                                     : O_o + "");
                debugger;
//}@debug
                return methods.__halt__(action, true); // halt
            }
            switch (r) {
            case false:  // function  sync() { return false; } -> miss
            case true:   // function  sync() { return true;  } -> pass
                _judge(r);
                break;
            case void 0: // function  sync(no arguments) { return undefined; } -> TypeError
                         // function async(no arguments) { ...               } -> TypeError
                         // function async(next) { 0..wait(next);                        } -> pass
                         // function async(next) { 0..wait(function() { next(true);  }); } -> pass
                         // function async(next) { 0..wait(function() { next(false); }); } -> miss
                if (methods[action].length) { // function has arguments
                    break;
                }
            default:     // function  sync() { return 123; } -> TypeError
//{@debug
                debugger;
//}@debug
                throw new TypeError("NEED_BOOLEAN_RESULT_VALUE: " + action);
            }
        }

        function _judge(result) { // @arg Boolean:
            if (result === false) {
                methods.__halt__(action, false); // halt
            } else if (++i >= group.length) {
                _nextStream(methods, plan); // recursive call
            }
        }
    });
}

// --- sync / async iterate ------------------------------------------
function Array_sync() { // @ret ModArray: Array + { map, each, some, every }
                        // @help: Array#sync
                        // @desc: overwritten by the synchronization method
    this.map  = Array.prototype.map;
    this.each = Array.prototype.each;
    this.some = Array.prototype.some;
    this.every= Array.prototype.every;
    return this;
}

function Array_async(callback, // @arg Function(= undefined): callback(result:MixArray/Boolean/undefined, error:Boolean)
                     wait,     // @arg Integer(= 0): async wait time (unit: ms)
                     unit) {   // @arg Integer(= 0): units to processed at a time.
                               //                    0 is auto detection (maybe 50000)
                               // @ret ModArray: Array + { map, each, some, every }
                               // @help: Array#async
                               // @desc: returned (each, map, some, every) an iterator method
                               //        that handles asynchronous array divided into appropriate units.
//{@debug
    mm.allow("wait", wait, wait ? wait > 0 : true);
    mm.allow("unit", unit, unit ? unit > 0 : true);
//}@debug

    callback = callback || mm_nop;
    wait = ((wait || 0) / 1000) | 0;
    unit = unit || 0;

    if (!unit) { // auto detection
         unit = 50000; // TODO: bench and detection
    }

    this.map  = function(fn, that) { return _async_iter(this, fn, that, callback, wait, unit, "map" ); };
    this.each = function(fn, that) { return _async_iter(this, fn, that, callback, wait, unit, "each"); };
    this.some = function(fn, that) { return _async_iter(this, fn, that, callback, wait, unit, "some"); };
    this.every= function(fn, that) { return _async_iter(this, fn, that, callback, wait, unit, "every");};
    return this;
}

function _async_iter(ary,      // @arg Array:
                     fn,       // @arg Function: callback function
                     that,     // @arg Mix: callback.apply(fn_that)
                     callback, // @arg Function:
                     wait,     // @arg Integer:
                     unit,     // @arg Integer:
                     iter) {   // @arg String: iterator function name. "map", "each", "some" and "every"
                               // @ret Object: { halt }
                               // @innert:
    var i = 0, iz = ary.length, range, cmd = [], obj = {}, result;

    if (iter === "map") {
        result = Array(iz);
    }
    for (; i < iz; i += unit) {
        range = Math.min(iz, i + unit);
        switch (iter) {
        case "map":   obj["fn" + i] =  _each(ary, fn, that, i, range, true);  break;
        case "each":  obj["fn" + i] =  _each(ary, fn, that, i, range, false); break;
        case "some":  obj["fn" + i] = _every(ary, fn, that, i, range, true);  break;
        case "every": obj["fn" + i] = _every(ary, fn, that, i, range, false);
        }
        cmd.push("fn" + i, wait);
    }
    obj.end = function() {
        callback(result, false, false);
        return true; // String#stream spec (need return boolean)
    };
    obj.halt = function(action, error) {
        callback(result, error, true);
    };
    cmd.pop(); // remove last wait
    return (cmd.join(" > ") + " > end").stream(obj); // String#stream

    // --- internal ---
    function _each(ary, fn, that, i, iz, map) {
        return function() {
            for (var r; i < iz; ++i) {
                if (i in ary) {
                    r = fn.call(that, ary[i], i, ary);
                    map && (result[i] = r);
                }
            }
            return true; // -> next stream
        };
    }
    function _every(ary, fn, that, i, iz, some) {
        return function() {
            for (var r; i < iz; ++i) {
                if (i in ary) {
                    r = fn.call(that, ary[i], i, ary);
                    if (!r && !some || r && some) {
                        result = some ? true : false;
                        return false; // -> halt stream -> callback(result)
                    }
                }
            }
            result = some ? false : true;
            return true; // -> next stream
        };
    }
}

// --- Object ----------------------------------------------
function Object_collectOwnProperties(rv, obj) {
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        rv[key] = obj[key];
    }
    return rv;
}

function Object_has(data,   // @arg Object/Function:
                    find) { // @arg Object: { key: value, ... }
                            // @ret Boolean:
    var key, keys = Object.keys(find), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if (!(key in data) || !_Object_has( data[key], find[key] )) {
            return false;
        }
    }
    return true;
}

function _Object_has(data, find) {
    if (data.__CLASS__ !== find.__CLASS__) {
        return false;
    }
    switch (mm_type(data)) {
    case "list":    return Array.from(data).has(Array.from(find));
    case "array":   return data.has(find);
    case "regexp":  return data.source === find.source;
    case "string":  return data.has(find);
    case "object":  return Object_has(data, find);
    case "number":  return isNaN(data) && isNaN(find) ? true : data === find;
    }
    return data === find;
}

function Object_like(lval,   // @arg Mix: left value
                     rval) { // @arg Mix: right value
                             // @ret Boolean: true is like value and like structures
                             // @inner: Like and deep matching.
                             //         This function does not search inside
                             //         the prototype chain of the object.
    var ltype = mm_type(lval),
        rtype = mm_type(rval),
        alike = { string: 1, date: 1, list: 2, array: 2, object: 3, hash: 3 };

    if (ltype !== rtype) { // String <-> Date, List <-> Array, Object <-> Hash
        if (alike[ltype] &&
            alike[ltype] === alike[rtype]) {
            if (rtype === "string" || rtype === "list" || rtype === "hash") {
                return Object_like(lval, mm_cast(rval));
            }
            return Object_like(mm_cast(lval), rval);
        }
        return false;
    }
    switch (ltype) {
    case "list":    return "" + Array.from(lval).sort() ===
                           "" + Array.from(rval).sort();
    case "array":   return "" + lval.sort() === "" + rval.sort();
    case "regexp":  return      lval.source ===      rval.source;
    case "object":  if (Object.keys(lval).length !== Object.keys(rval).length) {
                        return false;
                    }
                    return Object_has(lval, rval);
    case "number":  return isNaN(lval) && isNaN(rval) ? true : lval === rval;
    }
    return (lval && lval.toJSON) ? lval.toJSON() === rval.toJSON()
                                 : lval === rval;
}

function Object_map(obj,  // @arg Object/Function:
                    fn) { // @arg Function: callback function
                          // @ret Array: [result, ...]
    var rv = [], key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        rv.push( fn(obj[key], key) );
    }
    return rv;
}

function Object_each(obj,  // @arg Object/Function:
                     fn) { // @arg Function: callback function
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        fn(obj[key], key); // fn(value, index)
    }
}

function Object_some(obj,  // @arg Object/Function:
                     fn) { // @arg Function: fn(value, key)
                           // @ret Boolean:
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if ( fn(obj[key], key) ) {
            return true;
        }
    }
    return false;
}

function Object_every(obj,  // @arg Object/Function:
                      fn) { // @arg Function: fn(value, key)
                            // @ret Boolean:
    var key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        if ( !fn(obj[key], key) ) {
            return false;
        }
    }
    return true;
}

function Object_filter(obj,     // @arg Object/Function:
                       fn,      // @arg Function: fn(value, key)
                       match) { // @arg Boolean(= false): true is Object_match
                                //                        false is Object_filter
                                // @ret Array/undefined:
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

function Object_clean(data,   // @arg Object/Function:
                      only) { // @arg String(= ""): typeof filter
                              // @ret DenseObject: new Object
                              // @desc: convert sparse object to dense object,
                              //        trim undefined, null and NaN value
    only = only || "";

    var rv = {}, key, value, keys = Object.keys(data), i = 0, iz = keys.length;

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

function Object_clear(obj) { // @arg Object/Function/Class/Hash:
                             // @ret Object/Function/Class/Hash:
    var keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) {
        delete obj[keys[i]];
    }
    return obj;
}

function Object_count(obj) { // @arg Object/Function/Array:
                             // @ret Object: { value: value-count, ... }
    var rv = {}, value, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        value = obj[keys[i]] + ""; // toString(value)
        rv[value] ? ++rv[value] : (rv[value] = 1);
    }
    return rv;
}

function Object_values(obj) { // @arg Object/Function/Array/Style/Node/Global:
                              // @ret Array: [value, ...]
    var rv = [], keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        rv.push( obj[keys[i]] );
    }
    return rv;
}

function Object_pack(obj,     // @arg Object:
                     glue,    // @arg String(= ":"): glue
                     joint) { // @arg String(= ";"): joint
                              // @ret String: "key:value;key:value;..."
                              // @desc: serialize hash key/values ({ key: valye, ... }) to "key:value;..."
    glue = glue || ":";

    var rv = [], key, keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        rv.push(key + glue + obj[key]);
    }
    return rv.join(joint || ";");
}

// --- url -------------------------------------------------
//{@url
function mm_url(url) { // @arg URLObject/URLString(= ""): "https://..."
                       //      URLObject: { protocol, host, pathname, search, fragment }
                       // @ret URLString/URLObject:
                       // @desc: get current URL, parse URL, build URL
                       // @help: mm.url
   return !url ? global.location.href
         : typeof url === "string" ? _url_parse(url)
                                   : _url_build(url);
}

function _url_build(obj) { // @arg URLObject/Object: need { protocol, host, pathname, search, fragment }
                           // @ret URLString: "{protocol}//{host}{pathname}?{search}#{fragment}"
                           // @inner: build URL
    return [obj.protocol,
            obj.protocol ? (obj.protocol === "file:" ? "///" : "//") : "",
            obj.host     || "", obj.pathname || "/",
            obj.search   || "", obj.fragment || ""].join("");
}

function _url_parse(url) { // @arg URLString: abs or rel,
                           //                   "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b&c=d#fragment"
                           // @ret URLObject: { href, protocol, scheme, secure, host,
                           //                   auth, hostname, port, pathname, dir, file,
                           //                   search, query, fragment, ok }
                           //     href     - String:  "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment"
                           //     protocol - String:  "http:"
                           //     scheme   - String:  "http:"
                           //     secure   - Boolean: false
                           //     host     - String:  "user:pass@example.com:8080". has auth
                           //     auth     - String:  "user:pass"
                           //     hostname - String:  "example.com"
                           //     port     - Number:  8080
                           //     pathname - String:  "/dir1/dir2/file.ext"
                           //     dir      - String:  "/dir1/dir2"
                           //     file     - String:  "file.ext"
                           //     search   - String:  "?a=b&c=d"
                           //     query    - URLQueryObject: { a: "b", c: "d" }
                           //     fragment - String:  "#fragment"
                           //     ok       - Boolean: true is valid url
                           // @inner: parse URL

    function _extends(obj) { // @arg URLObject:
                             // @ret URLObject:
        var ary = obj.pathname.split("/");

        obj.href       = obj.href     || "";
        obj.protocol   = obj.protocol || "";
        obj.scheme     = obj.protocol;        // [alias]
        obj.secure     = obj.secure   || false;
        obj.host       = obj.host     || "";
        obj.auth       = obj.auth     || "";
        obj.hostname   = obj.hostname || "";
        obj.port       = obj.port     || 0;
        obj.pathname   = obj.pathname || "";
        obj.file       = ary.pop();
        obj.dir        = ary.join("/") + "/";
        obj.search     = obj.search   || "";
        obj.query      = mm_url_parseQuery(obj.search);
        obj.fragment   = obj.fragment || "";
        obj.ok         = obj.ok       || true;
        return obj;
    }

    var m, ports = { "http:": 80, "https": 443, "ws:": 81, "wss:": 816 };

    m = RegExp.FILE.exec(url);
    if (m) {
        return _extends({
            href: url, protocol: m[1], pathname: m[2],
                       search:   m[3], fragment: m[4] });
    }
    m = RegExp.URL.exec(url);
    if (m) {
        return _extends({
            href: url, protocol: m[1],
                       secure:   m[1] === "https:" || m[1] === "wss:",
                       host:     m[2], auth:   m[3],
                       hostname: m[4], port:   m[5] ? +m[5] : (ports[m[1]] || 0),
                       pathname: m[6], search: m[7],
                       fragment: m[8] });
    }
    m = RegExp.PATH.exec(url);
    if (m) {
        return _extends({
            href: url, pathname: m[1], search: m[2], fragment: m[3] });
    }
    return _extends({ href: url, pathname: url, ok: false });
}

function mm_url_resolve(url) { // @arg URLString: relative URL or absolute URL
                               // @ret URLString: absolute URL
                               // @desc: convert relative URL to absolute URL
                               // @help: mm.url.resolve
    if (/^(https?|file|wss?):/.test(url)) { // is absolute url?
        return url;
    }
    var a = global.document.createElement("a");

    a.setAttribute("href", url);    // <a href="hoge.htm">
    return a.cloneNode(false).href; // -> "http://example.com/hoge.htm"
}

function mm_url_normalize(url) { // @arg URLString:
                                 // @ret URLString:
                                 // @help: mm.url.normalize
                                 // @desc: path normalize
    var rv = [], path, obj = _url_parse(url),
        dots = /^\.+$/,
        dirs = obj.dir.split("/"),
        i = 0, iz = dirs.length;

    // normalize("dir/.../a.file") -> "/dir/a.file"
    // normalize("../../../../a.file") -> "/a.file"
    for (; i < iz; ++i) {
        path = dirs[i];
        if (path === "..") {
            rv.pop();
        } else if (!dots.test(path)) {
            rv.push(path);
        }
    }
    // tidy slash "///" -> "/"
    obj.pathname = ("/" + rv.join("/") + "/").replace(/\/+/g, "/") + obj.file;
    return _url_build(obj); // rebuild
}

function mm_url_buildQuery(obj,     // @arg URLQueryObject: { key1: "a", key2: "b", key3: [0, 1] }
                           joint) { // @arg String(= "&"): joint string "&" or "&amp;" or ";"
                                    // @ret URLQueryString: "key1=a&key2=b&key3=0&key3=1"
                                    // @help: mm.url.buileQuery
                                    // @desc: build query string
    joint = joint || "&";

    return mm.map(obj, function(value, key) {
        key = global.encodeURIComponent(key);

        return Array.toArray(value).map(function(v) {
            return key + "=" + global.encodeURIComponent(v); // "key3=0;key3=1"
        }).join(joint);
    }).join(joint); // "key1=a;key2=b;key3=0;key3=1"
}

function mm_url_parseQuery(query) { // @arg URLString/URLQueryString: "key1=a;key2=b;key3=0;key3=1"
                                    // @ret URLQueryObject: { key1: "a", key2: "b", key3: ["0", "1"] }
                                    // @help: mm.url.parseQuery
                                    // @desc: parse query string
    function _parse(_, key, value) {
        var k = global.encodeURIComponent(key),
            v = global.encodeURIComponent(value);

        if (rv[k]) {
            if (Array.isArray(rv[k])) {
                rv[k].push(v);
            } else {
                rv[k] = [rv[k], v];
            }
        } else {
            rv[k] = v;
        }
        return "";
    }

    var rv = {};

    if (query.indexOf("?") >= 0) {
        query = query.split("?")[1].split("#")[0];
    }
    query.replace(/&amp;|&|;/g, ";"). // "&amp;" or "&" or ";" -> ";"
          replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parse);

    return rv;
}
//}@url

// --- env -------------------------------------------------
// http://code.google.com/p/monogram-js/wiki/UserAgentStrings
// http://googlewebmastercentral-ja.blogspot.com/2011/05/android.html
// http://blogs.msdn.com/b/ie/archive/2012/07/12/ie10-user-agent-string-update.aspx
function _detectEnv(rv) { // @inner:
    if (!rv.browser) {
        return rv;
    }
    var nav = global.navigator, ua = nav.userAgent;

    rv.ua       = ua;
    rv.lang     = (nav.language || nav.browserLanguage || "").split("-", 1)[0]; // "en-us" -> "en"
    rv.secure   = global.location.protocol === "https:";
//{@ie
    if (rv.ie) {
        rv.ie8  = !!document.querySelector;
        rv.ie9  = !!global.getComputedStyle;
        rv.ie10 = !!global.msSetImmediate;
    }
//}@ie
    rv.ipad     = /iPad/.test(ua);
    rv.chrome   = /Chrome/.test(ua);
    rv.webkit   = /WebKit/.test(ua);
    rv.safari   = rv.webkit && !rv.chrome;
    rv.mobile   = /mobile/i.test(ua);
    rv.ios      = /iPhone|iPad|iPod/.test(ua);
    rv.mac      = /Mac/.test(ua);
    rv.android  = /android/i.test(ua);
    rv.windows  = /windows/i.test(ua);
    rv.touch    = rv.ios || rv.android || (rv.ie && /touch/.test(ua));
    rv.retina   = (global.devicePixelRatio || 1) >= 2;
    return rv;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { mm: HashFactory };
}

_extendNativeObjects(mm_mix, mm_wiz);
_defineLibraryAPIs(mm_mix);
_defineHashPrototype(mm_wiz);

mm.help.add("http://code.google.com/p/monogram-js/wiki/",
            "Object,Array,String,Boolean,Number,Date,RegExp,Function".split(","));
mm.help.add("http://code.google.com/p/monogram-js/wiki/",
            "mm,Class,Hash,Await,Msg".split(","));

})(this.self || global);

