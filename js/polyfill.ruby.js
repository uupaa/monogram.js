// polyfill.ruby.js: extend ruby functions

//{@ruby
(function(global) {

// --- header ----------------------------------------------
function _extendRubyLikeMethods() {
    wiz(Array.prototype, {
        assoc:      Array_assoc,        // [].assoc(find:Mix):Array/undefined
        index:      Array_index,        // [].index(mix:Mix):Number/undefined
        uniq:       Array.prototype.unique,
        collect:    Array.prototype.map,
        delete_at:  Array_delete_at     // [].delete_at(index):Mix/undefined
    });
    wiz(String.prototype, {
        to_f:       function()          { return parseFloat(this); },
        to_i:       function(radix)     { return parseInt(this, radix || 10); },
        to_s:       String.prototype.toString,
        sub:        String_sub,         // "".sub(pattern:RegExp, replace:String/Function):String
        gsub:       String_gsub,        // "".gsub(pattern:RegExp, replace:String/Function):String
        scan:       String_scan,        // "".scan(pattern:RegExp):StringArray
        strip:      String.prototype.trim,
        upcase:     String.prototype.toUpperCase,
        downcase:   String.prototype.toLowerCase,
        swapcase:   String_swapcase,    // "".swapcase():String
        ljust:      String_ljust,       // "".ljust(width:Number, padding:String = " "):String
        rjust:      String_rjust,       // "".rjust(width:Number, padding:String = " "):String
        center:     String_center       // "".center(width:Number, padding:String = " "):String
    });
    wiz(Number.prototype, {
        to_s:       Number_to_s,        // 0..to_s(radix:Number):String
        upto:       Number_upto,        // 0..upto(max:Number, fn:Function)
        downto:     Number_upto,        // 9..downto(min:Number, fn:Function)
        step:       Number_step         // 0..step(limit:Number, step:Number, fn:Function)
    });
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Array_assoc(find) { // @arg Mix: find value
                             // @ret Array/undefined:
                             // @help: Array#assoc
    return this.match(function(v) {
        return v.typeArray && v[0] === find;
    });
}

function Array_index(mix) { // @arg Mix:
                            // @ret Number/undefined:
                            // @help: Array#index
    var rv = this.indexOf(mix);

    return rv < 0 ? void 0 : rv;
}

function Array_delete_at(index) { // @arg Integer:
                                  // @ret Mix/undefined:
                                  // @help: Array#delete_at
//{@debug
    mm.allow("index", index, "Integer");
//}@debug

    return index in this ? this.splice(index, 1) : void 0;
}

function String_sub(pattern,   // @arg RegExp:
                    replace) { // @arg String/Function:
                               // @ret String:
                               // @help: String#sub
//{@debug
    mm.allow("pattern", pattern, "RegExp");
    mm.allow("replace", replace, "String/Function");
//}@debug

    return this.replace(pattern, replace);
}

function String_gsub(pattern,   // @arg RegExp:
                     replace) { // @arg String/Function:
                                // @ret String:
                                // @help: String#sub
//{@debug
    mm.allow("pattern", pattern, "RegExp");
    mm.allow("replace", replace, "String/Function");
//}@debug

    return this.replace(pattern.flag("+g"), replace);
}

function String_scan(pattern) { // @arg RegExp:
                                // @ret StringArray: [matchedString, ...]
                                // @help: String#scan
//{@debug
    mm.allow("pattern", pattern, "RegExp");
//}@debug

    return this.match(pattern.flag("+g")) || [];
}

function String_swapcase() { // @ret String:
                             // @help: String#swapcase
    return this.replace(/(?:([A-Z])|([a-z]))/g, function(_, up, low) {
        return up ? up.low() : low.up();
    });
}

function String_ljust(width,     // @arg Integer:
                      padding) { // @arg String(= " "):
                                 // @help: String#ljust
//{@debug
    mm.allow("width",   width,   "Integer");
    mm.allow("padding", padding, "String/undefined");
//}@debug

    return this + (padding || " ").repeat(width - this.length);
}

function String_rjust(width,     // @arg Integer:
                      padding) { // @arg String(= " "):
                                 // @help: String#rjust
//{@debug
    mm.allow("width",   width,   "Integer");
    mm.allow("padding", padding, "String/undefined");
//}@debug

    return (padding || " ").repeat(width - this.length) + this;
}

function String_center(width,     // @arg Integer:
                       padding) { // @arg String(= " "):
                                  // @help: String#center
//{@debug
    mm.allow("width",   width,   "Integer");
    mm.allow("padding", padding, "String/undefined");
//}@debug

    padding = padding || " ";

    var num = width - this.length,
        lpad = (num / 2) | 0;

    return padding.repeat(lpad) + this + padding.repeat(num - lpad);
}

function Number_upto(max,  // @arg Integer:
                     fn) { // @arg Function: callback(num, index, array)
                           // @help: Number#upto
//{@debug
    mm.allow("max", max, "Integer");
    mm.allow("fn",  fn,  "Function");
//}@debug

    this.to(max).each(fn);
}

function Number_step(limit, // @arg Integer:
                     step,  // @arg Integer:
                     fn) {  // @arg Function: callback(num, index, array)
                            // @help: Number#step
//{@debug
    mm.allow("limit", limit, "Integer");
    mm.allow("step",  step,  "Integer");
    mm.allow("fn",    fn,    "Function");
//}@debug

    +this > limit ? this.to(limit, -step).each(fn)  // Ruby spec
                  : this.to(limit,  step).each(fn);
}

function Number_to_s(radix) { // @arg Integer: 2 - 36
                              // @help: Number#to_s
//{@debug
    mm.allow("radix", radix, "Integer/undefined");
//}@debug

    return this.toString(radix || 10);
}

// --- build -----------------------------------------------
function wiz(object, extend, override) {
    for (var key in extend) {
        if (override || !(key in object)) {
            Object.defineProperty(object, key, {
                configurable: true, writable: true, value: extend[key]
            });
        }
    }
}

// --- export ----------------------------------------------
_extendRubyLikeMethods();

})(this.self || global);
//}@ruby
