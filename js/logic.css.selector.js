// logic.css.selector.js:

// - selector() function limits
// -- unsupported impossible rules ( ":root:first-child", etc ) in W3C Test Suite - css3_id27a
// -- unsupported impossible rules ( "* html"), "* :root"     ) in W3C Test Suite - css3_id27b
// -- unsupported case sensitivity ( ".cs P" )                  in W3C Test Suite - css3_id181
// -- unsupported ":not()", ":not(*)"                           in WebKit querySelectorAll()

//{@cssselector
(function(global, document) {

// --- header ----------------------------------------------
function CSSSelector(token,     // @arg CSSSelectorTokenObject:
                     context) { // @arg Node:
                                // @ret NodeArray:
    return _selector(token, context);
}
CSSSelector.name = "CSSSelector";

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
    _QUERY_COMB     = { ">": 1, "+": 2, "~": 3 },
    _QUERY_FORM     = /^(input|button|select|option|textarea)$/i,
    _QUERY_CASESENS = { title: 0, id: 0, name: 0, "class": 0, "for": 0 },
    _data_nodeid    = "data-nodeid",
    _nodeCount      = 0,
    _ie678          = false,
    _fixattrdb = { // [IE6][IE7]
//{@ie
        cellspacing:    "cellSpacing",
        colspan:        "colSpan",
        "for":          "htmlFor",      // node.getAttribute("htmlFor")
        "class":        "className",    // override node.getAttribute("className")
        frameborder:    "frameBorder",
        maxlength:      "maxLength",
        readonly:       "readOnly",
        rowspan:        "rowSpan",
        tabindex:       "tabIndex",
        usemap:         "useMap"
//}@ie
    };

// --- implement -------------------------------------------
function _selector(token,     // @arg Object: CSSSelectorTokenObject
                   context) { // @arg Node(= document): context
                              // @ret NodeArray: [node, ...]
                              // @desc: CSS3 Selectors Evaluator
    context = context || document;

    var doc = context.ownerDocument || document,
        xmldoc = false,
        ctx = [context], result = [], ary, node,
        lock, word, match, negate = 0, data = token.data,
        i = 0, iz = data.length, j, jz = 1, k, kz, r, ri,
        ident, nid, type, attr, ope, val, rex;

    if (doc.createElement("a").tagName !== doc.createElement("A").tagName) {
        xmldoc = true; // true is XMLDocument, false is HTMLDocument
    }

    if (doc.uniqueID && getComputedStyle === "undefined") { // [IE6][IE7][IE8]
        _ie678 = true;
    }

    for (; i < iz; ++i) {

        jz = ctx.length;
        if (!jz) {
            if (result.length < token.group - 1) {
                // skip to next group
                for (; i < iz; ++i) {
                    if (data[i] === _A_GROUP) {
                        break;
                    }
                }
            } else {
                break;
            }
        }

        r = [], ri = -1, j = type = 0;

        switch (data[i]) {
        case _A_QUICK_ID: // [ _A_QUICK_ID, true or false, "ID" or "CLASS" ]
            if (data[++i]) { // ID
                node = doc.getElementById(data[++i]);
                return node ? [node] : [];
            } // CLASS
            ary = context.getElementsByTagName("*");
            ident = " " + data[++i] + " ";
            for (jz = ary.length; j < jz; ++j) {
                node = ary[j];
                ((word = node.className) && ((" " + word + " ").indexOf(ident) >= 0))
                                         && (r[++ri] = node);
            }
            return r;
        case _A_QUICK_EFG: // [ _A_QUICK_EFG, ["E", "F"] or ["E", "F", "G"] ]
            ary = data[++i];
            return _sort_node(
                        _query_tag(ary[0], context).concat(
                            _query_tag(ary[1], context),
                            ary[2] ? _query_tag(ary[2], context) : [])).sort;
        case _A_COMBINATOR: // [ _A_COMBINATOR, ">", _A_TAG, "DIV" ]
            type = _QUERY_COMB[data[++i]];
            ++i;
        case _A_TAG: // [ _A_TAG, "DIV" ]
            ident = data[++i]; // "DIV" or "*"
            match = ident === "*";
            xmldoc || (ident = ident.toUpperCase()); // if HTMLDocument -> "div" -> "DIV"

            if (!type) { // TAG
                if (negate) {
                    for (; j < jz; ++j) {
                        node = ctx[j];
                        (node.tagName !== ident) && (r[++ri] = node);
                    }
                    ctx = r;
                    break;
                }
                for (lock = {}; j < jz; ++j) {
                    ary = ctx[j].getElementsByTagName(ident); // NodeList

                    for (k = 0, kz = ary.length; k < kz; ++k) {
                        node = ary[k];
                        if ((match && node.nodeType === Node.ELEMENT_NODE) ||
                            node.tagName === ident) {

                            nid = node[_data_nodeid] || (node[_data_nodeid] = ++_nodeCount);
                            lock[nid] || (r[++ri] = node, lock[nid] = 1);
                        }
                    }
                }
            } else { // >+~
                for (lock = {}; j < jz; ++j) {
                    node = ctx[j][type < 2 ? "firstChild" : "nextSibling"];
                    for (; node; node = node.nextSibling) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (_ie678 && !node.tagName.indexOf("/")) { // fix #25
                                continue;
                            }
                            if (match || node.tagName === ident) {
                                if (type > 2) {
                                    nid = node[_data_nodeid] || (node[_data_nodeid] = ++_nodeCount);
                                    if (lock[nid]) {
                                        break;
                                    }
                                    lock[nid] = 1;
                                }
                                r[++ri] = node;
                            }
                            if (type === 2) {
                                break;
                            }
                        }
                    }
                }
            }
            ctx = r;
            break;
        case _A_ID: // [ _A_ID, "ID" ]
            type = 1;
        case _A_CLASS: // [ _A_CLASS, "CLASS" ]
            ident = type ? data[++i] : (" " + data[++i] + " "); // "ID" or " CLASS "
            for (; j < jz; ++j) {
                node = ctx[j];
                if (type) { // ID
                    word  = xmldoc ? node.id : (node.id || node.name); // XHTML is id only, HTML is id or name
                    match = word && word === ident;
                } else {    // CLASS
                    word  = node.className;
                    match = word && ((" " + word + " ").indexOf(ident) >= 0);
                }
                (match ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_ATTR: // [ _A_ATTR, "ATTR" ]
            for (attr = data[++i]; j < jz; ++j) {
                node = ctx[j];
                // [IE6][IE7] node.hasAttribute() not impl
                match = node.hasAttribute
                      ? node.hasAttribute(attr)
                      : ((word = node.getAttributeNode(attr)) && word.specified); // [IE6][IE7]
                (match ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_ATTR_VALUE: // [ _A_ATTR_VALUE, "ATTR", "OPERATOR", "VALUE" ]
            attr = data[++i];
            ope  = data[++i];
            val  = _trimQuote(data[++i]); // '"quote"' -> "quote"
            attr = _fixattrdb[attr] || attr;
            switch (ope) {
            case 1: val = "^" + val + "$"; break;                 // [attr  = value]
            case 3: val = "^" + val;       break;                 // [attr ^= value]
            case 4: val =       val + "$"; break;                 // [attr $= value]
            case 5: val = "(?:^| )" + val + "(?:$| )"; break;     // [attr ~= value]
            case 6: val = "^" + val + "\\-|^" + val + "$"; break; // [attr |= value]
            case 7: negate = +!negate;                            // [attr != value]
            }
            rex = RegExp(val, attr in _QUERY_CASESENS ? "" : "i"); // ignore case

//{@ie67
            if (!node.hasAttribute) { // [IE6][IE7]
                // IE6 and IE7 getAttribute(attr) problem
                // http://twitter.com/uupaa/status/25501532102
                // http://twitter.com/uupaa/status/25502149299
                for (; j < jz; ++j) {
                    node = ctx[j];
                    switch (attr) {
                    case "href":     word = node.getAttribute(attr, 2); break;
                    case "checked":  word = node.checked  ? "checked"  : ""; break;
                    case "disabled": word = node.disabled ? "disabled" : ""; break;
                    default:         word = node.getAttribute(attr);
                    }
                    ((word && rex.test(word)) ^ negate) && (r[++ri] = node);
                }
            } else { // [IE8][IE9][Gecko][WebKit][Opera]
//}@ie67
                for (; j < jz; ++j) {
                    node = ctx[j];
                    word = node.getAttribute(attr);
                    ((word && rex.test(word)) ^ negate) && (r[++ri] = node);
                }
//{@ie67
            }
//}@ie67
            ope === 7 && (negate = +!negate); // restore
            ctx = r;
            break;
        case _A_PSEUDO: // [ _A_PSEUDO, 1~29 ]
            type = data[++i];
            ctx = (type < 4  ? _childFilter
                 : type < 10 ? _actionFilter
                 : type < 13 ? _formFilter
                             : _otherFilter)(ctx, j, jz, negate, type, xmldoc, doc);
            break;
        case _A_PSEUDO_NTH: // [ _A_PSEUDO_FUNC, 31~34, { a,b,k } ]
            type = data[++i];
            ctx = (type < 33 ? _nthFilter
                             : _nthTypeFilter)(ctx, j, jz, negate, type, data[++i], xmldoc);
            break;
        case _A_PSEUDO_FUNC: // [ _A_PSEUDO_FUNC, 31~99, arg ]
            type = data[++i];
            ctx = _otherFunctionFilter(ctx, j, jz, negate, type, data[++i]);
            break;
        case _A_PSEUDO_NOT: // [ _A_PSEUDO_NOT, _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ... ]
            negate = 2;
            break;
        case _A_GROUP:
            result.push(ctx);
            ctx = [context];
        }
        negate && --negate;
    }
    // --- mixin group ---
    iz = result.length;
    if (iz) {
        result.push(ctx);
        for (r = [], ri = -1, lock = {}, i = 0, ++iz; i < iz; ++i) {
            ctx = result[i];
            for (j = 0, jz = ctx.length; j < jz; ++j) {
                node = ctx[j];
                nid = node[_data_nodeid] || (node[_data_nodeid] = ++_nodeCount);
                lock[nid] || (r[++ri] = node, lock[nid] = 1);
            }
        }
        return _sort_node(r).sort; // to document order
    }
    return ctx;
}

// inner - 1:first-child  2:last-child  3:only-child
function _childFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, cn, found = 0;

    for (; j < jz; found = 0, ++j) {
        cn = node = ctx[j];
        if (ps & 1) { // first-child and only-child
            while (!found && (cn = cn.previousSibling)) {
                cn.nodeType === Node.ELEMENT_NODE && ++found;
            }
        }
        if (ps & 2) { // last-child and only-child
            cn = node;
            while (!found && (cn = cn.nextSibling)) {
                cn.nodeType === Node.ELEMENT_NODE && ++found;
            }
        }
        ((!found) ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 7:hover  8:focus  x:active
function _actionFilter(ctx, j, jz, negate, ps, xmldoc, doc) {
    var rv = [], ri = -1, node, ok, cs,
        selector = ps < 8 ? ":hover" : ":focus";

    // http://d.hatena.ne.jp/uupaa/20080928
    node = doc.createElement("style");
    node.id = "__temp_style__";
    doc.getElementsByTagName("head")[0].appendChild(node);

    if (_ie678) {
        node.styleSheet.addRule(selector, "ruby-align:center");
    } else {
        node.sheet.insertRule(selector + "{outline:0 solid #000}");
    }

    for (; j < jz; ++j) {
        node = ctx[j];
        if (_ie678) {
            // "ruby-align:center"
            ok = node.currentStyle.rubyAlign === "center";
        } else {
            // "outline:0 solid #000"
            cs = getComputedStyle(node);
            ok = (cs.outlineWidth + cs.outlineStyle) === "0pxsolid";
        }
        (ok ^ negate) && (rv[++ri] = node);
    }

    // remove style
    node = doc.getElementById("__temp_style__");
    if (node) {
        node.parentNode.removeChild(node);
    }
    return rv;
}

// inner - 10:enabled  11:disabled  12:checked
function _formFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, ok;

    for (; j < jz; ++j) {
        node = ctx[j];
        ok = (ps === 10) ? !node.disabled
           : (ps === 11) ? !!node.disabled : !!node.checked;
        _QUERY_FORM.test(node.tagName) ? ((ok ^ negate) && (rv[++ri] = node))
                                       : (negate && (rv[++ri] = node));
    }
    return rv;
}

// inner - 13:link  14:visited  15:empty  16:root  17:target  18:required  19:optional
function _otherFilter(ctx, j, jz, negate, ps, xmldoc, doc) {
    var rv = [], ri = -1, node, cn, ok = 0, found, word, rex /*, attr */;

    switch (ps) {
    case 13: rex = /^(?:a|area)$/i; break;
    case 14: jz = 0; break;
    case 16: negate || (jz = 0, rv = [doc.documentElement]); break;
    case 17: (word = location.hash.slice(1)) || (jz = 0); break;
/* TODO: test
    case 18: attr = "required"; break;
    case 19: attr = "optional";
 */
    }

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        switch (ps) {
        case 13: ok = rex.test(node.tagName) && !!node.href; break;
        case 15: found = 0;
                 for (cn = node.firstChild; !found && cn; cn = cn.nextSibling) {
                    cn.nodeType === Node.ELEMENT_NODE && ++found;
                 }
                 if ("textContent" in node) {
                    ok = !found && !node.textContent;
                 } else {
                    ok = !found && !node.innerText;
                 }
                 break;
        case 16: ok = node !== doc.documentElement; break;
        case 17: ok = xmldoc ? (node.id === word)
                             : ((node.id || node.name) === word); break;
/* TODO: test
        case 18:
        case 19:
                ok = node.hasAttribute
                   ? node.hasAttribute(attr)
                   : ((word = node.getAttributeNode(attr)) && word.specified); // [IE6][IE7]
                ps === 19 && (ok = !ok);
 */
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 31:nth-child  32:nth-last-child
function _nthFilter(ctx, j, jz, negate, ps, anb, xmldoc) {
    if (anb.all) {
        return negate ? [] : ctx;
    }

    var rv = [], ri = -1, nid, lock = {},
        parent, cn, idx, ok, a = anb.a, b = anb.b, k = anb.k,
        iter1 = (ps === 32) ? "lastChild" : "firstChild",
        iter2 = (ps === 32) ? "previousSibling" : "nextSibling",
        tag = ctx[0].tagName;

    xmldoc || (tag = tag.toUpperCase());

    for (; j < jz; ++j) {
        parent = ctx[j].parentNode;
        nid = parent[_data_nodeid] || (parent[_data_nodeid] = ++_nodeCount);
        if (!lock[nid]) {
            lock[nid] = 1;
            for (idx = 0, cn = parent[iter1]; cn; cn = cn[iter2]) {
                if (cn.nodeType === Node.ELEMENT_NODE) {
                    ++idx;
                    ok = k === 1 ? (idx === b)
                       : k === 2 ? (idx >=  b)
                       : k === 3 ? (!((idx - b) % a) && (idx - b) / a >= 0)
                                 : (idx <=  b);
                    (ok ^ negate) && cn.tagName === tag && (rv[++ri] = cn);
                }
            }
        }
    }
    return rv;
}

// inner - 33:nth-of-type  34:nth-last-of-type
function _nthTypeFilter(ctx, j, jz, negate, ps, anb) {
    (ps === 34) && ctx.reverse();

    var rv = [], ri = -1, node, tag, parent, parentnid, nid,
        idx, ok = 0, a = anb.a, b = anb.b, k = anb.k,
        tagdb = _createTagDB(ctx, 0, jz, ps === 34);

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        tag = node.tagName;
        parent = node.parentNode;
        parentnid = parent[_data_nodeid] || (parent[_data_nodeid] = ++_nodeCount);
              nid =   node[_data_nodeid] || (  node[_data_nodeid] = ++_nodeCount);

        if (tagdb[parentnid][nid].tag === tag) {
            idx = tagdb[parentnid][nid].pos;
            ok = k === 1 ? (idx === b)
               : k === 2 ? (idx >=  b)
               : k === 3 ? (!((idx - b) % a) && (idx - b) / a >= 0)
                         : (idx <=  b);
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    (ps === 34) && rv.reverse(); // to document order
    return rv;
}

// tagdb = { parent-nodeid: { child-nodeid: { tag: "DIV", pos: 1 }, ... },
//           parent-nodeid: { child-nodeid: { tag: "DIV", pos: 1 }, ... }, ... }
function _createTagDB(ctx, j, jz, reverse) { // @param NodeArray:
                                             // @return Hash: tagdb
    var rv = {}, node, parent, parentnid, cn, nid, tagcount, tag, pos,
        iter1 = reverse ? "lastChild" : "firstChild",
        iter2 = reverse ? "previousSibling" : "nextSibling";

    for (; j < jz; ++j) {
        node = ctx[j];
        parent = ctx[j].parentNode;
        parentnid = parent[_data_nodeid] || (parent[_data_nodeid] = ++_nodeCount);

        if (!rv[parentnid]) {
            rv[parentnid] = {};
            tagcount = {}; // { "DIV": count }
            for (cn = parent[iter1]; cn; cn = cn[iter2]) {
                if (cn.nodeType === Node.ELEMENT_NODE) {
                    tag = cn.tagName;
                    pos = tagcount[tag] ? ++tagcount[tag] : (tagcount[tag] = 1);

                    nid = cn[_data_nodeid] || (cn[_data_nodeid] = ++_nodeCount);
                    rv[parentnid][nid] = { tag: tag, pos: pos };
                }
            }
        }
    }
    return rv;
}

// inner - 35:lang  36:contains
function _otherFunctionFilter(ctx, j, jz, negate, ps, arg) {
    var rv = [], ri = -1, ok = 0, node,
        rex = ps === 35 ? RegExp("^(" + arg + "$|" + arg + "-)", "i") : 0;

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        switch (ps) {
        case 35: while (!node.getAttribute("lang") && (node = node.parentNode)) {}
                 ok = node && rex.test(node.getAttribute("lang")); break;
        case 36: if ("textContent" in node) {
                    ok = node.textContent.indexOf(arg) >= 0;
                 } else {
                    ok = node.innerText.indexOf(arg) >= 0;
                 }
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

function _sort_node(ary,       // @param NodeArray:
                    context) { // @hidden Node(= <body>): search context
                               // @return Hash: { sort, dup }
                               //   sort - Array: SortedNodeArray
                               //   dup  - Array: DuplicatedNodeArray
                               // @desc: sort by document order, detect duplicate

    //  [1][sort] _sort_node([<body>, <html>, <body>], document) -> { sort: [<html>, <body>], dup: [<body>] }

    var rv = [], ri = -1, i = 0, iz = ary.length, obj = { length: iz },
        idx, min = 0xfffffff, max = 0, node, dups = [], di = -1, allNodes;

    if (!_ie) {
        allNodes = _query_tag("*", context || document.body);
    }

    for (; i < iz; ++i) {
        node = ary[i];
        idx = _ie ? node.sourceIndex
                  : allNodes.indexOf(node);
        min > idx && (min = idx);
        max < idx && (max = idx);
        obj[idx] ? (dups[++di] = node) : (obj[idx] = node); // judge duplicate
    }
    for (i = min; i <= max; ++i) {
        (node = obj[i]) && (rv[++ri] = node);
    }
    return { sort: rv, dup: dups };
}

function _query_tag(selector,  // @arg String(= "*"): tag name, "*" is all
                    context) { // @arg Node(= <body>): query context
                               // @ret NodeArray: [Node, ...]
                               // @desc: as document.getElementsByTaName
    expr = expr || "*";
    if (!_ie678) {
        return Array.from((context || document.ownerDocument).getElementsByTagName(expr));
    }
//{@ie
    // [IE6][IE7][IE8]
    var rv = [], ri = -1, v, i = 0, skip = (expr === "*"),
        nodeList = (context || document.ownerDocument).getElementsByTagName(expr),
        iz = nodeList.length;

    // [IE] getElementsByTagName("*") has comment nodes
    for (; i < iz; ++i) {
        v = nodeList[i];
        if (!skip || v.nodeType === Node.ELEMENT_NODE) {
            rv[++ri] = v;
        }
    }
    return rv;
//}@ie
}

function _trimQuote(str) { // @arg String:
                           // @ret String: trimed string
                           // @desc: trim both spaces and strip single/double quotes.
                           //        does not remove the quotes that are not symmetric.
    str = str.trim();
    var m = /^["']/.exec(str);

    if (m) {
        m = RegExp(m[0] + "$").exec(str);
        if (m) {
            return str.trims(m[0]);
        }
    }
    return str;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { CSSSelector: CSSSelector };
}
global.Monogram || (global.Monogram = {});
global.Monogram.CSSSelector = CSSSelector;

})(this.self || global, this.document);
//}@cssselector

// --- test ------------------------------------------------
/*
    var Tokenizer = reuqire("./logic.css.selector").CSSSelectorTokenizer;
    var CSSSelector = reuqire("./logic.css.selector").CSSSelector;

    function test1() {
        var NodeArray = CSSSelector( Tokenizer("E>F>G") );
    }
 */

