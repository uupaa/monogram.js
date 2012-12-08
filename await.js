// await.js: extend Await methods

//{@await
(function(global) { // @arg Global: window or global

// --- header ----------------------------------------------
function _extendNativeObjects() {
    wiz(Function.prototype, {
        await:      Function_await      // fn#await(waits:Integer, tick:Function = undefined):Await
    });
}

function Await(fn, waits, tick) {
    this.init(fn, waits, tick);
}

Await.prototype = {
    init:           Await_init,         // Await#init(fn:Function, waits:Integer, tick:Function = null):this
    missable:       Await_missable,     // Await#missable(count:Integer):this
    pass:           Await_pass,         // Await#pass(value:Mix = undefined):this
    miss:           Await_miss,         // Await#miss(value:Mix = undefined):this
    isError:        Await_isError,      // Await#isError():Boolean
    isCompleted:    Await_isCompleted   // Await#isCompleted():Boolean
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Function_await(waits,  // @arg Integer: wait count
                        tick) { // @arg Function(= undefined): tickCallback(err, args)
                                // @ret AwaitInstance:
                                // @this: callback(err:Error, args:Array)
                                //      err - Error:
                                //      args - Array: pass(arg) and miss(arg) args collections
                                // @help: Await#await
                                // @desc: create Await instance
    if (!waits) {
        return this(null, []);
    }
    return new Await(this, waits, tick);
}

function Await_init(fn,     // @arg Function: callback(err, args)
                    waits,  // @arg Integer: wait count
                    tick) { // @arg Function(= null): tick callback(err, args)
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
    if (globa.mm) { // monogram.js
        Object.defineProperty(this, "__CLASS__",     { value: "await" });
        Object.defineProperty(this, "__CLASS_UID__", { value: mm.uid("mm.class") });
    }
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
        db.state = db.miss > db.missable ? 400         // ng
                 : db.pass + db.miss >= db.waits ? 200 // ok
                 : db.state;
    }
    var err = db.state === 400 ? new TypeError("miss") : null;

    // tick callback
    db.tick && db.tick(err, db.args);

    if (db.state > 100) { // change state?
        if (db.fn) {
            db.fn(err, db.args); // end callback
            db.fn = db.tick = null;
            db.args = []; // gc
        }
    }
}

function Await_isError() { // @ret Boolean:
                           // @help: Await#isError
    return this._db.state === 400;
}

function Await_isCompleted() { // @ret Boolean:
                               // @help: Await#isCompleted
    return this._db.state === 200;
}

function wiz(object, extend, override) {
    for (var key in extend) {
        (override || !(key in object)) && Object.defineProperty(object, key, {
            configurable: true, writable: true, value: extend[key]
        });
    }
}

// --- export --------------------------------
_extendNativeObjects();

(function(){}).help.add("http://code.google.com/p/mofmof-js/wiki/", ["Await"]);

})(this.self || global);
//}@await
