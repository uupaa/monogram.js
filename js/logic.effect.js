// logic.effect.js: Mass effect API
// @need: mm.js, Math.Easing.js

//{@fx
(function(global) {

// --- header ----------------------------------------------
function _defineLibraryAPIs(mix) {
    mm.fx = mix(mm_fx, {
        spec:       mm_fx_spec,         // mm.fx.spec(a:Number/NumberArray, b:Number/NumberArray,
                                        //            time:Number = 200, delay:Number = 0, easing:Function = Math.inoutcubic, freeze:Boolean = false):Object
        defs:       mm_fx_defs,         // mm.fx.defs(time:Number = 200, delay:Number = 0, easing:Function = Math.inoutcubic, freeze:Boolean = false):Object
        kill:       mm_fx_kill,         // mm.fx.kill(uid)
        tick:       mm_fx_tick          // mm.fx.tick(fn):Hash { type, tid }
    });
}

// --- library scope vars ----------------------------------
// http://d.hatena.ne.jp/uupaa/20110622
// http://uupaa.hatenablog.com/entry/2012/02/01/083607
var _frame = global.requestAnimationFrame    ||
             global.oRequestAnimationFrame   ||
             global.msRequestAnimationFrame  ||
             global.mozRequestAnimationFrame ||
             global.webkitRequestAnimationFrame, // -> cancelRequestAnimationFrame
    _immediate = global.setImmediate       ||
                 global.oSetImmediate      ||
                 global.msSetImmediate     ||
                 global.mozSetImmediate    ||
                 global.webkitSetImmediate, // -> clearImmediate
    _mm_fx_db = [], // uid db
    _mm_fx_kill_db = []; // kill uid db

// --- implement -------------------------------------------
function mm_fx_spec(a,        // @arg Number/NumberArray: point A. begin point
                    b,        // @arg Number/NumberArray: point B. end point
                    time,     // @arg Number(= 200): duration time (msec value)
                    delay,    // @arg Number(= 0): delay time (msec value)
                    easing,   // @arg Function(= Math.inoutcubic): easing function
                    freeze) { // @arg Boolean(= false): true is freeze
                              // @ret Object: { a, b, time, delay, easing, freeze }
                              // @help: mm.fx.spec
                              // @desc: build mm.fx spec param
//{@debug
    mm.allow("a", a, "Number/Array");
    mm.allow("b", b, "Number/Array");
//}@debug

    var rv = mm_fx_defs(time, delay, easing, freeze);

    rv.a = a;
    rv.b = b;
    return rv;
}

function mm_fx_defs(time,     // @arg Number(= 200): duration time (msec value)
                    delay,    // @arg Number(= 0): delay time (msec value)
                    easing,   // @arg Function(= Math.inoutcubic): easing function
                    freeze) { // @arg Boolean(= false): true is freeze
                              // @ret Object: { time, delay, easing, freeze }
                              // @help: mm.fx.defs
                              // @desc: build mm.fx default spec
//{@debug
    mm.allow("time",   time,   "Number/undefined");
    mm.allow("delay",  delay,  "Number/undefined");
    mm.allow("easing", easing, "Function/undefined");
    mm.allow("freeze", freeze, "Boolean/undefined");
//}@debug

    return { time: time || 200,
             delay: delay || 0,
             easing: easing || Math.inoutcubic,
             freeze: freeze || false };
}

function mm_fx(spec,   // @arg Hash: mm.fx.spec() result { a, b, time, delay, easing, freeze }
               tick,   // @arg Function: tick(step, spec, result, elapsed)
                       //   tick.step - Number: 0 is setup, 1 is tick, 2 is teardown
                       //   tick.spec - Object: mm.fx spec
                       //   tick.result - Object: result value { key: value, ... }
                       //   tick.elapsed - Number: elapsed time
               defs) { // @arg Object(= null): mm.fx.defs() result { time, delay, easing, freeze }
                       // @ret Number: fx uid, killingTicket for killing animation
                       // @help: mm.fx
                       // @desc: easing, mass effect

    function _kill() { // @lookup: fxuid, fxdb
        var i = 0, iz = fxdb.length,
            index = _mm_fx_kill_db.indexOf(fxuid) + 1;

        if (index) {
            _mm_fx_kill_db.splice(index - 1, 1);
        }
        for (i = 0; i < iz; ++i) {
            if (fxdb[i].state !== COMPLETED) {
                fxdb[i].state = FREEZE;
            }
        }
    }

    function _tick() { // @lookup: spec, fxuid, past, fxdb, tick, state
        var now = Date.now(),
            curt,
            spec,
            result = {},
            updateState = false,
            i = 0, iz = fxdb.length, j, jz, remain = iz;

        if (_mm_fx_kill_db.length &&
            _mm_fx_kill_db.indexOf(fxuid) >= 0) {
            _kill();
        }
        for (; i < iz; ++i) {
            curt = null;
            spec = fxdb[i];

            switch (spec.state) {
            case COMPLETED:
                --remain;
                break;
            case WAIT:
                spec.past || (spec.past = now);

                if (now >= spec.past + spec.delay) { // delay end?
                    spec.state = RUNNING; // WAIT -> RUNNING
                    curt = spec.a.concat(); // Array#copy
                    updateState = true;
                }
                break;
            case RUNNING:
                updateState = true;
                if (now >= spec.past + spec.delay + spec.time) { // timeout?
                    spec.state = COMPLETED; // RUNNING -> COMPLETED
                    curt = spec.b.concat(); // Array#copy
                    --remain;
                } else {
                    for (curt = [], j = 0, jz = spec.a.length; j < jz; ++j) {
                        curt.push(
                            spec.easing(now - spec.past - spec.delay, // current time
                                        spec.a[j],                    // begin
                                        spec.b[j] - spec.a[j],        // delta
                                        spec.time));                  // duration
                    }
                    spec.c = curt.concat(); // Array#copy
                }
                break;
            case FREEZE:
                updateState = true;
                spec.state = COMPLETED; // FREEZE -> COMPLETED
                curt = (spec.freeze ? spec.c : spec.b).concat(); // Array#copy
                --remain;
            }

            if (curt !== null) {
                if (spec.isArray) {
                    result[spec.key] = [];
                    for (j = 0, jz = spec.a.length; j < jz; ++j) {
                        result[spec.key].push(curt[j]);
                    }
                } else {
                    result[spec.key] = curt[0];
                }
            }
        }
        if (updateState) {
            if (tick(1, spec, result, now - spec.past) === false) {
                // tick() -> false
                //      false is killing animation `` アニメーションの強制終了
                _kill();
            }
        }
        if (remain > 0) {
            _frame ? _frame(_tick)
                   : setTimeout(_tick, 4);
        } else {
            _mm_fx_db.remove(fxuid); // Array#remove
            tick(2, spec, {}, 0); // teardown
        }
    }

    function _buildMassEffectDB(spec) { // @lookup:
        var rv = [], key, value,
            df = mm.arg(defs, { time: 200, delay: 0,
                                easing: Math.inoutcubic, freeze: false });

        for (key in spec) {
            value = spec[key];
            if (value.a !== void 0 && value.b !== void 0) {
                rv.push({
                    key:    key,                    // "x", "y"
                    a:      Array.isArray(value.a) ? value.a : [value.a], // point A
                    b:      Array.isArray(value.b) ? value.b : [value.b], // point B
                    c:      Array.isArray(value.a) ? value.a : [value.a], // Current value
                    time:   value.time   || df.time,
                    delay:  value.delay  || df.delay,
                    easing: value.easing || df.easing,
                    freeze: value.freeze || df.freeze,
                    isArray:Array.isArray(value.a),
                    state:  WAIT,
                    past:   0
                });
            }
        }
        return rv;
    }

    var WAIT = 0, RUNNING = 1, FREEZE = 2, COMPLETED = 4,
        fxuid = mm.uid("mm.fx"),
        fxdb = _buildMassEffectDB(spec);

    _mm_fx_db.push(fxuid);

    tick(0, spec, {}, 0); // setup
//    _frame(_tick);
    return fxuid;
}

function mm_fx_kill(uid) { // @arg Number: mm.fx() result id
                           // @help: mm.fx.kill
                           // @desc: killing animation
//{@debug
    mm.allow("uid", uid, "Number");
//}@debug

    if (_mm_fx_kill_db.indexOf(uid) < 0) {
        _mm_fx_kill_db.push(uid);
    }
}

function mm_fx_tick(tick) { // @arg Function: callback
                            // @ret Object: { tid, type }
                            //          tid - Number: timer id
                            //          type - Number: 0 is setTimeout
                            //                         1 is requestAnimationFrame
                            //                         2 is setImmediate
                            // @help: mm.fx.tick
                            // @desc: timer api wrapper
//{@debug
    mm.allow("tick", tick, "Function");
//}@debug

    return _frame     ? { type: 1, tid: _frame(tick) } :
           _immediate ? { type: 2, tid: _immediate(tick) }
                      : { type: 0, tid: setTimeout(tick, 4) }
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
_defineLibraryAPIs(mm.mix);

})(this.self || global);

//}@fx

