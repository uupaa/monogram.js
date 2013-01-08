// logic.async.js: extend Async/Sync Array methods
// @need: Monogram.wiz (in mixin.js)
//        Monogram.Stream (in logic.stream.js)

//{@async
(function(global) {

// --- header ----------------------------------------------
global.Monogram.wiz(Array.prototype, {
    sync:   Array_sync, // [].sync():ModArray { each, map, some, every }
    async:  Array_async // [].async(callback:Function, wait:Integer = 0,
                        //          unit:Integer = 1000):ModArray { each, map, some, every }
});

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Array_sync() { // @ret ModArray: Array + { map, each, some, every }
                        // @help: Array#sync
                        // @desc: overwritten by the synchronization method
    this.map   = Array.prototype.map;
    this.each  = Array.prototype.each;
    this.some  = Array.prototype.some;
    this.every = Array.prototype.every;
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
/*
    mm.allow("wait", wait, wait ? wait > 0 : true);
    mm.allow("unit", unit, unit ? unit > 0 : true);
 */
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
    //return (cmd.join(" > ") + " > end").stream(obj); // String#stream
    return global.Monogram.Stream(cmd.join(" > ") + " > end", obj);

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

// --- build -----------------------------------------------

// --- export --------------------------------

})(this.self || global);
//}@async

