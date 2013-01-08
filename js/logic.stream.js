// logic.stream.js:

//{@stream
(function(global) {

// --- header ----------------------------------------------
function Stream(command, // @arg String: command string. "fn1 > delay > fn2 + fn3"
                methods, // @arg Object/Array: { key: fn, ... }
                delay) { // @arg String/Integer: base delay. ms
                         // @ret this: { halt: function }
                         // @throw: TypeError("FUNCTION_NOT_FOUND: ...")
                         //         TypeError("NEED_BOOLEAN_RESULT_VALUE: ...")
                         // @desc: create stream
                         // @help: Stream
    var commands = "",
        plan = []; // plan: [ [ "fn1" ], [ delay ], [ "fn2", "fn3" ] ]

    commands = command.split(/\s*>+\s*/).join(delay ? ">" + delay + ">"
                                                    : ">");
    plan = _streamTokenizer(commands);

    methods.__cancel__ = false;
    methods.__halt__ = function(action, error) {
        methods.__halt__ = mm.nop;
        methods.__cancel__ = true;
        methods.halt && methods.halt(action || "user", error || false);
    };
    plan.length && _nextStream(methods, plan);

    return { halt: methods.__halt__ }; // provide halt method
}
Stream.name = "Stream";

global.Monogram.wiz(String.prototype, {
    stream: String_stream   // "".stream(methods:Object/Array,
                            //           delay:String/Integer = 0):Object
});
global.Monogram.wiz(Array.prototype, {
    stream: Array_stream    // [].stream(delay:String/Integer = 0):Object
});

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Array_stream(delay) { // @arg String/Integer(= 0): base delay. 1 / "1" / "1s" / "1000ms"
                               // @this - FunctionArray
                               // @ret Object: { uid: number, halt: function }
                               // @help: Array#stream
                               // @desc: create Stream

    var names = _enumNicknames(this); // { array, object }

    return Stream(names.array.join(" > "), names.object, delay);
}

function String_stream(methods, // @arg Object: { key: fn, ... }
                       delay) { // @arg String/Integer(= 0): base delay. 1 / "1" / "1s" / "1000ms"
                                // @ret Object: { halt: function }
                                // @this: command string. "fn1 > delay > fn2 + fn3"
                                //            fn - FunctionNameString:
                                // @throw: TypeError("FUNCTION_NOT_FOUND: ...")
                                //         TypeError("NEED_BOOLEAN_RESULT_VALUE: ...")
                                // @desc: create stream
                                // @help: String#stream
    return Stream(this + "", methods, delay);
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

    group && group.forEach(function(action) { // @param String: command string. "fn1"
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
                global.Monogram.log(mm.env.chrome ? O_o.stack.replace(/at eval [\s\S]+$/m, "")
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

/*
 Stream("fn1 > fn2 + fn3", { ... })
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

function _streamTokenizer(command) { // @arg String: command string. "a>b+c>d>foo"
                                     // @ret ArrayArrayString:
                                     //         exec plan. [ ["a"], ["b", "c"], ["d"], ["foo"] ]
                                     //                      ~~~~~  ~~~~~~~~~~  ~~~~~  ~~~~~~~
                                     //                      group   group       group  group
                                     //                         ________^_________
                                     //                         parallel execution
                                     // @inner: stream DSL tokenizer
    var plan = [], remain = [];

    command.match(/([\w\-\u00C0-\uFFEE]+|[/+>])/g).forEach(function(token) {
/*
        token === "+" ? 0 :
        token === ">" ? (remain.length && plan.push(remain.shifts())) // Array#shifts
                      : remain.push(token);
 */
        if (token === "+") {
            ;
        } else if (token === ">") {
            if (remain.length) {
                plan.push( remain.concat() );
                remain.length = 0;
            }
        } else {
            remain.push(token);
        }
    });
    remain.length && plan.push( remain.concat() );
    return plan;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Stream: Stream };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Stream = Stream;

})(this.self || global);
//}@stream

