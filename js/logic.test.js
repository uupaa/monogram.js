// logic.test.js
// @need: mm.js

//{@test
(function() {

// --- header --------------------------------
function _extendNativeObjects() {
    mm.wiz(Array.prototype, {
        test:   mm.mix(Array_test, {    // [ test case, ... ].test(label:String = "", arg = undefined):void
            tick:   null                // Array#.test.tick({ok,msg,name,pass,miss}) - Tick Callback Function
        })
    });
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
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
                                       logg: mm.logg(label || "") });

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
                                       mm.dump(lval, 0) + ", " +
                                       mm.dump(rval, 0) );
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

// --- export --------------------------------
_extendNativeObjects();

})();
//}@test

