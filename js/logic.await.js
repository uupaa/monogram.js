// logic.await.js: awaiting async/sync events

/*
    require("logic.await");

    // --- await 4 events ---
    var await = new Await(callback, 4);

    [1,2,3].forEach(function(value) {
        await.pass(value);
    });
    await.pass(4);

    function callback(err, args) {
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

    // --- await 4 events (missable 1) ---
    var await = new Await(callback, 4).missable(1);

    setTimeout(function() { await.pass(1); }, Math.random() * 1000); // goo
    setTimeout(function() { await.pass(2); }, Math.random() * 1000); // goo
    setTimeout(function() { await.pass(3); }, Math.random() * 1000); // goo
    setTimeout(function() { await.miss(4); }, Math.random() * 1000); // boo?
    setTimeout(function() { await.miss(5); }, Math.random() * 1000); // boo?

    function callback(err, args) {
        if (err) {
            console.log("boo!", args.join()); // eg: "boo! 4,1,5"
        } else {
            console.log("goo!", args.join()); // eg: "goo! 2,3,1,4"
        }
    }
 */

//{@await
(function(global) {

// --- header ----------------------------------------------
function Await(fn,       // @arg Function: fn(err:Error, args:MixArray)
               events) { // @arg Integer: event count
                         // @help: Await
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "Await" });

    this._missable = 0;         // Integer: missable count
    this._events = events;      // Integer: event count
    this._pass  = 0;            // Integer: pass() called count
    this._miss  = 0;            // Integer: miss() called count
    this._state = "progress";   // String: "progress", "done", "error", "halt"
    this._args  = [];           // MixArray: pass(arg), miss(arg) collections
    this._fn    = fn;           // Function: callback(err:Error, args:MixArray)
}

Await.prototype = {
    missable:   Await_missable,     // Await#missable(count:Integer):this
    add:        Await_add,          // Await#add(count:Integer):this
    halt:       Await_halt,         // Await#halt():this
    pass:       Await_pass,         // Await#pass(value:Mix = undefined):this
    miss:       Await_miss,         // Await#miss(value:Mix = undefined):this
    getStatus:  Await_getStatus     // Await#getStatus():Object
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
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
    this._args.push(value);
    return _judge(this);
}

function Await_miss(value) { // @arg Mix(= undefined): value
                             // @ret this:
                             // @help: Await#miss
                             // @desc: miss a process
    ++this._miss;
    this._args.push(value);
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
            break;
        case "done":
            that._fn(null, that._args);
            that._fn = null;
            that._args = []; // free
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

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Await: Await };
} else {
    global.Await = Await;
}

})(this.self || global);
//}@await

