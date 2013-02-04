// logic.await.js: awaiting async/sync events

//{@await
(function(global) {

// --- header ----------------------------------------------
function Await(events, // @arg Integer: event count
               fn,     // @arg Await/Function: await.fn(err:Error, args:MixArray)
               tag) {  // @arg String(= ""): tag name
                       // @help: Await
    this._missable = 0;         // Integer: missable count
    this._events = events;      // Integer: event count
    this._pass  = 0;            // Integer: pass() called count
    this._miss  = 0;            // Integer: miss() called count
    this._state = "progress";   // String: "progress", "done", "error", "halt"
    this._args  = [];           // ExArray: #pass(arg), #miss(arg) collections
    this._tag   = tag || "";    // String: tag name
    this._fn    = fn;           // Await/Function: callback(err:Error, args:ExArray)

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
    pass:       Await_pass,     // Await#pass(value:Mix = undefined, key:String = ""):this
    miss:       Await_miss,     // Await#miss(value:Mix = undefined, key:String = ""):this
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

function Await_pass(value, // @arg Mix(= undefined): value
                    key) { // @arg String(= ""): key
                           // @ret this:
                           // @help: Await#pass
                           // @desc: pass a process
    ++this._pass;
    if (value !== void 0) {
        this._args.push(value);           // [].push(value)
        key && (this._args[key] = value); // { key: value }
    }
    return _judge(this);
}

function Await_miss(value, // @arg Mix(= undefined): value
                    key) { // @arg String(= ""): key
                           // @ret this:
                           // @help: Await#miss
                           // @desc: miss a process
    ++this._miss;
    if (value !== void 0) {
        this._args.push(value);           // [].push(value)
        key && (this._args[key] = value); // { key: value }
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
            if (that._fn.miss) {
                that._fn.miss();
            } else {
                that._fn(new TypeError(that._state), // err.message: "error" or "halt"
                         that._args);
                that._fn = null;
            }
            that._args = []; // free
            that._tag && (_progress[that._tag] = null);
            break;
        case "done":
            if (that._fn.pass) {
                that._fn.pass();
            } else {
                that._fn(null, that._args);
                that._fn = null;
            }
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

