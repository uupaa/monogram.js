// logic.await.js: awaiting async/sync events

//{@await
(function(global) {

// --- header ----------------------------------------------
function Await(events, // @arg Integer: event count
               fn,     // @arg Function: fn(err:Error, args:MixArray)
               tag) {  // @arg String(= ""): tag name
                       // @help: Await
    this._missable = 0;         // Integer: missable count
    this._events = events;      // Integer: event count
    this._pass  = 0;            // Integer: pass() called count
    this._miss  = 0;            // Integer: miss() called count
    this._state = "progress";   // String: "progress", "done", "error", "halt"
    this._args  = [];           // MixArray: pass(arg), miss(arg) collections
    this._tag   = tag || "";    // String: tag name
    this._fn    = fn;           // Function: callback(err:Error, args:MixArray)

    this._tag && (_progress[this._tag] = this);
    _judge(this); // events is 0 -> done
}

Await.name = "Await";
Await.dump = Await_dump;
Await.prototype = {
    constructor:Await,
    missable:   Await_missable, // Await#missable(count:Integer):this
    add:        Await_add,      // Await#add(count:Integer):this
    halt:       Await_halt,     // Await#halt():this
    pass:       Await_pass,     // Await#pass(value:Mix = undefined):this
    miss:       Await_miss,     // Await#miss(value:Mix = undefined):this
    getStatus:  Await_getStatus // Await#getStatus():Object
};

// --- library scope vars ----------------------------------
var _progress = {}; // [DEBUG] keep progress instances

// --- implement -------------------------------------------
function Await_dump(tag) { // @arg String(= ""): find tag. "" is all
    return tag ? JSON.stringify(_progress[tag], "", 4)
               : JSON.stringify(_progress, "", 4);
}

function Await_missable(count) { // @arg Integer: missable count
                                 // @ret this:
                                 // @help: Await#missable
                                 // @desc: set missable counts
//{@debug
    if (count < 0 || count >= this._events) {
        throw new Error("BAD_ARG");
    }
//}@debug
    this._missable = count;
    return this;
}

function Await_add(count) { // @arg Integer: event count
                            // @ret this:
                            // @help: Await#add
                            // @desc: add events
    if (this._state === "progress") {
        this._events += count;
    }
    return this;
}

function Await_pass(value) { // @arg Mix(= undefined): value
                             // @ret this:
                             // @help: Await#pass
                             // @desc: pass a process
    ++this._pass;
    if (value !== void 0) {
        this._args.push(value);
    }
    return _judge(this);
}

function Await_miss(value) { // @arg Mix(= undefined): value
                             // @ret this:
                             // @help: Await#miss
                             // @desc: miss a process
    ++this._miss;
    if (value !== void 0) {
        this._args.push(value);
    }
    return _judge(this);
}

function Await_halt() { // @ret this:
                        // @help: Await#halt
                        // @desc: end of await
    if (this._state === "progress") {
        this._state = "halt";
    }
    return _judge(this);
}

function _judge(that) { // @arg this:
                        // @ret this:
                        // @inner: judge state and callback function
    if (that._state === "progress") {
        that._state = that._miss > that._missable ? "error"
                    : that._pass + that._miss >= that._events ? "done"
                    : that._state;
    }
    if (that._fn) {
        switch (that._state) {
        case "progress": break;
        case "error":
        case "halt":
            that._fn(new TypeError(that._state), // err.message: "error" or "halt"
                     that._args);
            that._fn = null;
            that._args = []; // free
            that._tag && (_progress[that._tag] = null);
            break;
        case "done":
            that._fn(null, that._args);
            that._fn = null;
            that._args = []; // free
            that._tag && (_progress[that._tag] = null);
        }
    }
    return that;
}

function Await_getStatus() { // @ret Object: { missable, events, pass, miss, state }
                             //     missable - Integer:
                             //     events - Integer:
                             //     state - String: "progress", "done", "error", "halt"
                             //     pass - Integer:
                             //     miss - Integer:
                             // @help: Await#getStatus
    return {
        missable:   this._missable,
        events:     this._events,
        state:      this._state,
        pass:       this._pass,
        miss:       this._miss
    };
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Await: Await };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Await = Await;

})(this.self || global);
//}@await

// --- test ------------------------------------------------
/*
    if (this.require) {
        var Await = require("./logic.await").Await;
    } else {
        var Await = global.Monogram.Await;
    }

    function test1() { // await sync 4 events
        var await = new Await(4, callback);

        [1,2,3].forEach(function(value) {
            await.pass(value);
        });
        await.pass(4); // fire callback

        function callback(err, args) { // err = null, args = [1,2,3,4]
            if (err) {
                switch (err.message) {
                case "halt":  console.log("halt",  args.join()); break;
                case "error": console.log("error", args.join()); break;
                }
            } else {
                // err is null
                console.log(args.join()); // "1,2,3,4"
            }
        }
    }

    function test2() { // await async 4 events (missable 1)
        var await = new Await(4, callback).missable(1);

        setTimeout(function() { await.pass(1); }, Math.random() * 1000); // goo
        setTimeout(function() { await.pass(2); }, Math.random() * 1000); // goo
        setTimeout(function() { await.pass(3); }, Math.random() * 1000); // goo
        setTimeout(function() { await.miss(4); }, Math.random() * 1000); // boo?
        setTimeout(function() { await.miss(5); }, Math.random() * 1000); // boo?

        function callback(err, args) { // random result
            if (err) {
                console.log("boo!", args.join()); // eg: "boo! 4,1,5"
            } else {
                console.log("goo!", args.join()); // eg: "goo! 2,3,1,4"
            }
        }
    }

    function test3() { // debug
        function callback() {
        }

        var a = new Await(10, callback, "test3.await1");
        var b = new Await(10, callback, "test3.await2");
        var c = new Await(10, callback, "test3.await3");

        for (var i = 0; i < 30; ++i) {
            switch ((Math.random() * 3) | 0) {
            case 0: a.pass(); break;
            case 1: b.pass(); break;
            case 2: c.pass(); break;
            }
        }

        // -> Explore why the process is not completed.
        console.log( Await.dump() );
    }
 */

