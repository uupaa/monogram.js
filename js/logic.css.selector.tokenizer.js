// logic.css.selector.tokenizer.js

// - selector() function limits
// -- unsupported impossible rules ( ":root:first-child", etc ) in W3C Test Suite - css3_id27a
// -- unsupported impossible rules ( "* html"), "* :root"     ) in W3C Test Suite - css3_id27b
// -- unsupported case sensitivity ( ".cs P" )                  in W3C Test Suite - css3_id181
// -- unsupported ":not()", ":not(*)"                           in WebKit querySelectorAll()

//{@cssselector
(function(global) {

// --- header ----------------------------------------------
function CSSSelectorTokenizer(selector) { // @arg: CSSSelectorExpressionString
                                          // @ret: CSSSelectorTokenObject
    return _tokenizer(selector);
}

// --- library scope vars ----------------------------------
                          //  +-----------------+-----------------------------
                          //  | EXPRESSION      | RESULT
                          //  +-----------------+-----------------------------
var _A_TAG          = 1,  //  | E               | [ _A_TAG, "E" ]
    _A_COMBINATOR   = 2,  //  | E > F           | [ _A_COMBINATOR, ">", _A_TAG, "E" ]
    _A_ID           = 3,  //  | #ID             | [ _A_ID, "ID" ]
    _A_CLASS        = 4,  //  | .CLASS          | [ _A_CLASS, "CLASS" ]
    _A_ATTR         = 5,  //  | [ATTR]          | [ _A_ATTR, "ATTR" ]
    _A_ATTR_VALUE   = 6,  //  | [ATTR="VALUE"]  | [ _A_ATTR_VALUE, "ATTR", 1~7, "VALUE" ]
    _A_PSEUDO       = 7,  //  | :target         | [ _A_PSEUDO,      1~29 ]
    _A_PSEUDO_NTH   = 8,  //  | :nth-child(...) | [ _A_PSEUDO_FUNC, 31~34, { a,b,k } ]
    _A_PSEUDO_FUNC  = 9,  //  | :lang(...)      | [ _A_PSEUDO_FUNC, 35~99, arg ]
    _A_PSEUDO_NOT   = 10, //  | :not(...)       | [ _A_PSEUDO_NOT,  _A_ID or _A_CLASS or _ATTR or _A_PSEUDO or _A_PSEUDO_FUNC, ... ]
    _A_GROUP        = 11, //  | E,F             | [ _A_GROUP ]
    _A_QUICK_ID     = 12, //  | #ID             | [ _A_QUICK_ID,    true or false, "ID" or "CLASS" ]
    _A_QUICK_EFG    = 13, //  | E,F or E,F,G    | [ _A_QUICK_EFG,   ["E", "F"] or ["E", "F", "G"] ]
                          //  +-----------------+-----------------------------
    _TOKEN_COMB     = /^\s*(?:([>+~])\s*)?(\*|\w*)/, // "E > F"  "E + F"  "E ~ F"  "E"  "E F" "*"
    _TOKEN_ATTR     = /^\[\s*(?:([^~\^$*|=!\s]+)\s*([~\^$*|!]?\=)\s*((["'])?.*?\4)|([^\]\s]+))\s*\]/,
    _TOKEN_NTH      = /^(?:(even|odd)|(1n\+0|n\+0|n)|(\d+)|(?:(-?\d*)n([+\-]?\d*)))$/,
    _TOKEN_OPERATOR = { "=": 1, "*=": 2, "^=": 3, "$=": 4, "~=": 5, "|=": 6, "!=": 7 },
    _TOKEN_KIND     = { "#": 1, ".": 2, "[": 3, ":": 4 },
    _TOKEN_NTH_1    = { a: 0, b: 1, k: 1 }, // nth-child(1)
    _TOKEN_GROUP    = /^\s*,\s*/,
    _TOKEN_ERROR    = /^[>+~]|[>+~*]{2}|[>+~]$/,
    _TOKEN_IDENT    = /^[#\.]([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)/i, // #ID or .CLASS
    _TOKEN_PSEUDO   = { E: /^(\w+|\*)\s*\)/, END: /^\s*\)/, FUNC: /^\s*([\+\-\w]+)\s*\)/,
                        FIND: /^:([\w\-]+\(?)/, STR: /^\s*(["'])?(.*?)\1\)/ },
    _TOKEN_PSEUDO_LIST = {
        // pseudo
        "first-child":      1, "last-child":       2, "only-child":       3, // childFilter
        "first-of-type":    4, "last-of-type":     5, "only-of-type":     6, // nthTypeFilter
        hover:              7, focus:              8, active:             0, // actionFilter
        enabled:           10, disabled:          11, checked:           12, // formFilter
        link:              13, visited:           14,                        // otherFilter
        empty:             15, root:              16, target:            17, // otherFilter
//      required:          18, optional:          19,                        // otherFilter <input required>
        // pseudo functions
        "not(":            30,
        "nth-child(":      31, "nth-last-child(": 32,                        // nthFilter
        "nth-of-type(":    33, "nth-last-of-type(": 34,                      // nthTypeFilter
        "lang(":           35, "contains(":       36                         // otherFunctionFilter
    },
    _QUICK = {
        E:  /^\w+$/,
        ID: /^([#\.])([a-z_\-][\w\-]*)$/i,          // #ID or .CLASS
        EFG: /^(\w+)\s*,\s*(\w+)(?:\s*,\s*(\w+))?$/ // E,F[,G]
    };

// --- implement -------------------------------------------
function _tokenizer(expr) { // @arg CSSSelectorExpressionString: "E > F"
                            // @ret CSSSelectorTokenObject: { data, group, err, msg, expr }
                            //   data  - Array:   [_A_TOKEN, data, ...]
                            //   group - Number:  expression group count, from 1. query("E,F,G") -> group=3
                            //   err   - Boolean: true is error
                            //   msg   - String:  error message
                            //   expr  - String:  expression
                            // @desc: CSS3 Selectors Expression tokenizer
    expr = expr.trim();
    var rv = { data: [], group: 1, err: false, msg: "", expr: expr },
        data = rv.data, m, outer, inner;

    // --- QUICK PHASE ---
    (m = _QUICK.E.exec(expr))  ? data.push(_A_TAG, m[0]) :
    (m = _QUICK.ID.exec(expr)) ? data.push(_A_QUICK_ID, m[1] === "#", m[2]) :
    ((m = _QUICK.EFG.exec(expr)) && m[1] !== m[2] && m[1] !== m[3] && m[2] !== m[3]) // E !== F !== G
                               ? data.push(_A_QUICK_EFG, m[3] ? [m[1], m[2], m[3]]
                                                              : [m[1], m[2]]) :
    _TOKEN_ERROR.test(expr)    ? (rv.msg = expr) : 0;

    // --- GENERIC PHASE ---
    if (!data.length) {
        while (!rv.msg && expr && outer !== expr) { // outer loop
            m = _TOKEN_COMB.exec(outer = expr);
            if (m) {
                m[1] && data.push(_A_COMBINATOR, m[1]); // >+~
                        data.push(_A_TAG, m[2] || "*"); // E or "*"
                expr = expr.slice(m[0].length);
            }
            while (!rv.msg && expr && inner !== expr) { // inner loop
                expr = _innerLoop(inner = expr, rv);
            }
            m = _TOKEN_GROUP.exec(expr);
            if (m) {
                ++rv.group;
                data.push(_A_GROUP);
                expr = expr.slice(m[0].length);
            }
        }
        expr && (rv.msg = expr); // remain
    }
    rv.msg && (rv.err = true);
    return rv;
}

function _innerLoop(expr,  // @arg String: CSS3 Selector Expression
                    rv,    // @arg Object: { data, group, err, msg, expr }
                    not) { // @arg Boolean(= false): true is negate evaluation
                           // @ret String: remain expression
    var data = rv.data, m, num, mm, anb, a, b, c;

    switch (_TOKEN_KIND[expr.charAt(0)] || 0) {
    case 1: (m = _TOKEN_IDENT.exec(expr)) && data.push(_A_ID,    m[1]); break;
    case 2: (m = _TOKEN_IDENT.exec(expr)) && data.push(_A_CLASS, m[1]); break;
    case 3: m = _TOKEN_ATTR.exec(expr); // [1]ATTR, [2]OPERATOR, [3]"VALUE" [5]ATTR
            if (m) {
                m[5] ? data.push(_A_ATTR, m[5])
                     : data.push(_A_ATTR_VALUE,
                                    m[1], num = _TOKEN_OPERATOR[m[2]], m[3]);
                m[5] || num || (rv.msg = m[0]);
                // [FIX] Attribute multivalue selector. css3_id7b.html
                //
                //  <p title="hello world"></p> -> query('[title~="hello world"]') -> unmatch
                //            ~~~~~~~~~~~
                num === 5 && m[3].indexOf(" ") >= 0 && (rv.msg = m[0]);
            }
            break;
    case 4: m = _TOKEN_PSEUDO.FIND.exec(expr);
            if (m) {
                num = _TOKEN_PSEUDO_LIST[m[1]] || 0;
                if (!num) {
                    rv.msg || (rv.msg = m[0]);
                } else if (num < 30) {   // pseudo (30 is magic number)
                    // 4:first-of-type -> 33:nth-of-type(1)
                    // 5:last-of-type  -> 34:nth-last-of-type(1)
                    // 6:only-of-type  -> 33:nth-of-type(1) + 34:nth-last-of-type(1)
                    num === 4 ? data.push(_A_PSEUDO_NTH, 33, _TOKEN_NTH_1) :
                    num === 5 ? data.push(_A_PSEUDO_NTH, 34, _TOKEN_NTH_1) :
                    num === 6 ? data.push(_A_PSEUDO_NTH, 33, _TOKEN_NTH_1,
                                          _A_PSEUDO_NTH, 34, _TOKEN_NTH_1) :
                                data.push(_A_PSEUDO, num);
                } else if (num === 30) { // :not   (30 is magic number)
                    // ":not(:not(...))", ":not()", ":not(*)" -> ERROR
                    if (not || expr === ":not()" || expr === ":not(*)") {
                        rv.msg = ":not()";
                    } else {
                        data.push(_A_PSEUDO_NOT);
                        expr = expr.slice(m[0].length);
                        m = _TOKEN_PSEUDO.E.exec(expr);
                        if (m) {
                            data.push(_A_TAG, m[1].toUpperCase()); // "DIV"
                        } else {
                            expr = _innerLoop(expr, rv, true); // :not(simple selector)
                            m = _TOKEN_PSEUDO.END.exec(expr);
                            m || rv.msg || (rv.msg = ":not()");
                        }
                    }
                } else { // pseudo functions
                    data.push(num < 35 ? _A_PSEUDO_NTH : _A_PSEUDO_FUNC, num);
                    expr = expr.slice(m[0].length);
                    m = _TOKEN_PSEUDO.FUNC.exec(expr);
                    if (m) {
                        if (num < 35) { // pseudo nth-functions
                            mm = _TOKEN_NTH.exec(m[1]);
                            if (mm) {
                                if (mm[1]) { // :nth(even) or :nth(odd)
                                    anb = { a: 2, b: mm[1] === "odd" ? 1 : 0, k: 3 };
                                } else if (mm[2]) {
                                    anb = { a: 0, b: 0, k: 2, all: 1 }; // nth(1n+0), nth(n+0), nth(n)
                                } else if (mm[3]) {
                                    anb = { a: 0, b: parseInt(mm[3], 10), k: 1 }; // nth(1)
                                } else {
                                    a = (mm[4] === "-" ? -1 : mm[4] || 1) - 0;
                                    b = (mm[5] || 0) - 0;
                                    c = a < 2;
                                    anb = { a: c ? 0 : a, b: b, k: c ? a + 1 : 3 };
                                }
                            }
                            anb ? data.push(anb) // pseudo function arg
                                : rv.msg ? 0 : (rv.msg = m[0]);
                        } else { // :lang
                            m ? data.push(m[1]) // pseudo function arg
                              : rv.msg ? 0 : (rv.msg = m[0]);
                        }
                    } else { // :contains
                        m = _TOKEN_PSEUDO.STR.exec(expr);
                        m ? data.push(m[2]) // pseudo function arg
                          : rv.msg ? 0 : (rv.msg = m[0]);
                    }
                }
            }
    }
    m && (expr = expr.slice(m[0].length));
    return expr;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { CSSSelectorTokenizer: CSSSelectorTokenizer };
} else {
    global.CSSSelectorTokenizer = CSSSelectorTokenizer;
}

})(this.self || global);
//}@cssselector

