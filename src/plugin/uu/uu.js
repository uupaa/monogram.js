// document.hidden

var uu; // @global Function: uupaa.js library namespace

uu || (function(global,     // @arg Global: window or global
                document) { // @arg Document:

function _defineLibraryAPIs(mix) {

    uu = mix(uu_factory, {              // uu("E>F>G", ...):NodeArray
                                        // uu(["E>F>G", contextNode], ...):NodeArray
                                        // uu(node):mmm
                                        // uu([node, ...]):mmm
        // --- environment / information ---
        docs:       "http://code.google.com/p/mofmof-js/wiki/", // uu.docs
        // --- node builder ---
        node:       uu_node,            // uu.node(node, args):node
        head:       function(/* ... */) { return uu_node(document.head, arguments); },
        body:       function(/* ... */) { return uu_node(document.body, arguments); },
        text:       function(text)      { return document.createTextNode(text); },
        // --- css-selector ---
        query:      uu_query,           // uu.query("E>F>G"):NodeArray
                                        // uu.query(["E>F>G", contextNode]):NodeArray
        // --- node, attr / css ---
        attr:   mix(uu_attr, {          // uu.attr(node, key = undef, value = undef):String/Hash/Node
            set:    uu_attr_set         // uu.attr.set(node, hash):Node
        }),
        css:    mix(uu_css, {           // uu.css(node, key = undef, value = undef):String/Hash/Node
            set:    uu_css_set          // uu.css.set(node, hash):Node
        }),
        style:  mix(uu_style, {
            create: uu_style_create,    // uu.style.create(id, rules):Node
            add:    uu_style_add        // uu.style.add(id, rules):Node
        }),
        // --- utility ---
        uid:        uu_uid,             // uu.uid(node):Number
        dump:       uu_dump,            // uu.dump(node = <html>, space = 4, depth = 5):String
        vendor:     uu_vendor,          // uu.vendor("user-select"):Hash { base, prefixed }
        // --- boot loader ---
        boot:       mm.env.ie8 ? uu_boot_ie678 : uu_boot,
                                        // uu.boot(fn_that)
        main:       uu_main,            // uu.main(fn_that)
        // --- url dispatcher ---
        page:       uu_page             // uu.page(path = location.href, ...)
    });
    // generate uu.div(), uu.p(), uu.img(), ... functions
    HTML_TAGS.split(",").each(function(tag) {
        uu[tag] = function(/* ... */) { // @var_args Mix:
            return uu_node(document.createElement(tag), arguments);
        };
    });
}

function _polyfillAndExtend(wiz, HTMLElement, HTMLDocument) {
    wiz(document, {
        html:       document.documentElement,                   // document.html
        head:       document.getElementsByTagName("head")[0]    // document.head
    });
    var extras = {
        on:         HTMLElement_on,     // node#on(type, fn):this
        one:        HTMLElement_one,    // node#one(type, fn):this
        off:        HTMLElement_off,    // node#off(type = "", fn = null):this
        add:        HTMLElement_add,    // node#add(node):this
        cut:        HTMLElement_cut,    // node#cut():this
        top:        HTMLElement_top,    // node#top(node):this
        has:        HTMLElement_has,    // node#has(node:Node/CSSQueryString):Boolean
        find:       HTMLElement_find,   // node#find(query:CSSQueryString, from = 0, to = length):NodeArray++
                                        // node#find("div").cut()   -> cut all
                                        // node#find("div").clear() -> clear all children
        clear:      HTMLElement_clear,  // node#clear():this
        path:       HTMLElement_path,   // node#path():CSSQueryString
        addClass:   HTMLElement_addClass,     // node#addClass("class"):this
        hasClass:   HTMLElement_hasClass,     // node#hasClass("class"):Boolean
        toggleClass: HTMLElement_toggleClass, // node#toggleClass("class"):Boolean
        removeClass: HTMLElement_removeClass  // node#removeClass("class"):this
    };
    wiz(HTMLElement.prototype,  extras);
    wiz(HTMLDocument.prototype, extras);

    global.NodeList && wiz(NodeList.prototype, {
        toArray:    Array.prototype.slice
    });
//{@gecko
//{@ie [IE9]
    global.HTMLCollection && wiz(HTMLCollection.prototype, {
        toArray:    function(from, to) { return Array.from(this).slice(from, to); }
    });
//}@ie
//}@gecko

//{@ie
    var extras_ie8 = {
        addEventListener: function(type, fn, capture) {
            function _handleEvent(ev) {
                ev.target = ev.srcElement;
                ev.mouse  = ev.button || 0;
                ev.target || (ev.currentTarget = node);

                switch (ev.type){
                case "contextmenu": ev.mouse = 2; break;
                case "mousedown":
                case "mouseup":
                    ev.mouse = (ev.button & 1) ? 0 : (ev.button & 2) ? 2 : 1;
                    break;
                case "mouseover":
                case "mouseout":
                    ev.relatedTarget = ev.target === ev.fromElement
                                     ? ev.toElement : ev.fromElement;
                }
                ev.pageX = ev.clientX + (owner.scrollLeft || 0);
                ev.pageY = ev.clientY + (owner.scrollTop  || 0);
                isfn ? fn(ev)
                     : fn.handleEvent.call(fn, ev);
            }

            var node = this,
                isfn = typeof fn === "function",
                owner = (node.ownerDocument || document).documentElement;

            if (type === "DOMContentLoaded") {
                return isfn ? uu_boot_ie678(fn)
                            : uu_boot_ie678([fn.handleEvent, fn]);
            }
            this.attachEvent("on" + type, _handleEvent);
        },
        removeEventListener: function(type, fn, capture) {
            this.detachEvent("on" + type, fn);
        }
    };
    if (mm.env.ie8) {
        wiz(global,            extras_ie8);
        wiz(document,          extras_ie8);
        wiz(Element.prototype, extras_ie8);
    }
//}@ie
}

var HTML_TAGS = // HTML tags, exclude <html><head><body>
        "a,b,br,button,dd,div,dl,dt,form,h1,h2,h3,h4,h5,h6,hr,i,img," +
        "iframe,input,li,ol,option,p,pre,select,span,table,tbody,tr," +
        "td,th,thead,tfoot,textarea,u,ul," +
        "abbr,article,aside,audio,canvas,datalist," +
        "details,eventsource,figure,footer,header,hgroup," +
        "mark,menu,meter,nav,output,progress,section,time,video",
    FIX_ATTR = { // fix attribute name
        w:          "width",
        h:          "height",
        htmlFor:    "for",
        className:  "class"
    },
    FIX_STYLE = { // fix style property name
        // rect: left(x), top(y), width(w), height(h)
        x:          "left",
        y:          "top",
        w:          "width",
        h:          "height",
        // border(b), margin(m), padding(p), outline(o)
        b:          "border",
        m:          "margin",
        p:          "padding",
        // color(c), background-color(bc), background-position-x(bpx)
        c:          "color",
        bc:         "backgroundColor",
        bpx:        "backgroundPositionX",
        bpy:        "backgroundPositionY",
        // opacity(o)
        o:          "opacity",
        // font: font-size(fs), font-weight(fw)
        fs:         "fontSize",
        fw:         "fontWeight",
        // matrix: rotate(r), scale-x/y(sx/sy), translate-x/y(tx/ty)
        r:          "rotate",
        sx:         "scaleX",       // transform.scaleX
        sy:         "scaleY",       // transform.scaleY
        tx:         "translateX",   // transform.translateX
        ty:         "translateY",   // transform.translateY
        mb_x:       mm.env.mobile ? "translateX" : "left",
        mb_y:       mm.env.mobile ? "translateY" : "top"
    },
    NUMBER_SETTER = function(node, prop, value) { node.style[prop] = value; },
    STYLE_POLYFILL = {
        zIndex:     NUMBER_SETTER,
        opacity:    NUMBER_SETTER,
        lineHeight: NUMBER_SETTER,
        fontWeight: NUMBER_SETTER,
        userSelect: function(node, prop, value) { _userSelect(value !== "none"); }
    },
    VENDOR_PREFIX = mm.env.webkit ? "Webkit" :
                    mm.env.gecko  ? "Moz" :
                    mm.env.ie     ? "ms" :
                    mm.env.opera  ? "O" : "";
//    _dispatch_db = {}; // { readyEventType: [[low order], [mid order], [high order]], ... }

// --- implement ---
// uu - factory
function uu_factory(mix           // @arg CSSQueryString/CSSQueryStringAndContextArray/Node/NodeArray: css-selector
                    /*, ... */) { // @var_args Mix:
                                  // @ret NodeArray:
                                  // @help: uu#uu.factory
                                  // @desc: css-selector or wrap object

    // 1. uu(node, uu.p())           -> node.add(uu.p()) -> [node]
    // 2. uu("E>F>#G")               -> mm.cast(document.query("E>F>G")) -> [<node id="G">]
    // 3. uu("E>F>#G", uu.p())       -> mm.cast(document.query("E>F>G")) -> [<node id="G">]
    // 4. uu(["E>F>#G", node])       -> mm.cast(node.query("E>F>G"))     -> [<node id="G">]
    // 5. uu([node1, node2], uu.p()) -> node1.add(uu.p()), node2.add(uu.p()) -> [node1, node2]

//{@debug
    mm.allow("mix", mix, "String/Array/Node");
//}@debug

    var rv, i, iz, args,
        isary = Array.isArray(mix),
        query = isary ? mix[0] : mix,
        ctx =  (isary ? mix[1] : null) || document;

    rv = mix.nodeType ? [mix]
       : typeof query === "string" ? ctx.find(query)
       : mix;

    if (arguments.length >= 2) {
        args = Array.prototype.slice.call(arguments, 1);
        for (i = 0, iz = rv.length; i < iz; ++i) {
            uu_node.call({ clone: !!i }, rv[i], args);
        }
    }
    return rv;
}

// uu.query
function uu_query(query) { // @arg CSSQueryString/CSSQueryStringAndContextNodeArray: "E>F>G" or ["E>F>G", context]
                           // @ret NodeArray: [node, ...]
                           // @help: uu#uu.query
                           // @desc: query node
//{@debug
    mm.allow("query", query, "String/Array");
//}@debug

    return Array.isArray(query) ? query[1].find(query[0])
                                : document.find(query);
}

// uu.node - node builder
function uu_node(node,   // @arg Node:
                 args) { // @arg Arguments/MixArray(= undefined): [Node/String/Hash, ...]
                         // @this: { clone }
                         //     this.clone - Boolean: true is apply cloneNode(true)
                         // @ret Node:
                         // @help: uu#uu.node
                         // @desc: node builder

    //  [1][Node]            uu.div(uu.p())                           -> <div><p></p></div>
    //  [2][TextNode]        uu.div(uu.text("hello"))                 -> <div>hello</div>
    //  [3][TextNode]        uu.div("::hello")                        -> <div>hello</div>
    //  [4][TextNode atmark] uu.div("::format @@ @@", "hello", "world") -> <div>format hello world</div>
    //  [5][attr]            uu.div("id:a;class:hello")               -> <div id="a" class="hello"></div>
    //  [6][attr]            uu.div({id:"a","class":"hello"})         -> <div id="a" class="hello"></div>
    //  [7][attr atmark]     uu.div("id:@@", "a")                     -> <div id="a"></div>
    //  [8][css]             uu.div("", "color:red;float:left")       -> <div style="color:red;float:left"></div>
    //  [9][css]             uu.div("", {color:"red",float:"left"})   -> <div style="color:red;float:left"></div>
    //  [10][css atmark]     uu.div("", "color:@@", "red")            -> <div style="color:red"></div>
    //  [11][complex]        uu.div("id:@@", "a", {color:"red"}, "::@@ @@", "hello", "world")
    //                                                                -> <div id="a" style="color:red">hello world</div>

//{@debug
    mm.allow("node", node, "Node");
    mm.allow("args", args, "List/Array");
//}@debug

    if (!args || !args.length) {
        return node;
    }

    args = Array.from(args);

    var token, isstr, match, prop = 0,
        i = 0, iz = args.length,
        at = /@@/g;

    for (; i < iz; ++i) {
        token = args[i];

        if (token.nodeType) { // node -> appendChild(node)
            this.clone ? node.appendChild(token.cloneNode(true))
                       : node.appendChild(token);
        } else {
            isstr = typeof token === "string";
            if (isstr) {
                if (token.indexOf("@@") >= 0) { // "width:@@px".at(100) -> "width:100px"
                    match = token.match(at).length;
                    token = args.slice(i + 1, i + match + 1).at(args[i]); // Array#at(format)
                    i += match;
                }
                if (token.indexOf("::") === 0) { // uu.div("::text") -> uu.div(uu.text("text"))
                    node.appendChild(document.createTextNode(token.slice(2)));
                    continue;
                }
            }
            switch (++prop) {
            case 1: token && uu_attr_set(node, isstr ? token.unpack()
                                                     : token);
                    break;
            case 2: token && uu_css_set( node, isstr ? token.unpack()
                                                     : token);
                    break;
            default:
                throw new Error(token);
            }
        }
    }
    return node;
}

// uu.uid
function uu_uid(node) { // @arg Node:
                        // @ret Number: node unique id
                        // @help: uu#uid
                        // @desc: create node unique id

    var mark = "data-uuuid", // node["data-uuuid"]
        rv = node[mark];

    if (!rv) {
        node[mark] = rv = mm.uid("uu_uid");
    }
    return rv;
}

// uu.dump
function uu_dump(node,    // @arg Node(= <html>):
                 space,   // @arg String(= 4):
                 depth) { // @arg Number(= 5): max depth, 0 is infinity
                          // @ret String:
                          // @desc: Dump Node Tree
//{@debug
    mm.allow("node",  node,  "Node/String/undefined");
    mm.allow("space", space, "Number/undefined");
    mm.allow("depth", depth, "Number/undefined");
//}@debug
    typeof node === "string" && (node = document.querySelector(node));

    node  = (!node || node === document) ? document.documentElement : node;
    space = space === void 0 ? 4 : space;
    depth = depth || 5;

    return '"<' + node.nodeName.toLowerCase() + '>":' +
           (space ? " "  : "") + _uu_dump(node, space, depth, 1);
}

// inner - mm.dump impl
function _uu_dump(mix,    // @arg Node: parentNode
                  space,  // @arg Number: space
                  depth,  // @arg Number: max depth
                  nest) { // @arg Number: nest count from 1
                          // @ret String:

    function _dumpArray(mix) {
        if (!mix.length) {
            return "[]";
        }
        var ary = [], i = 0, iz = mix.length;

        for (; i < iz; ++i) {
            ary.push(indent + _uu_dump(mix[i], space, depth, nest + 1));
        }
        return "[" + lf + ary.join("," + lf) +
                     lf + " ".repeat(space * (nest - 1)) + "]";
    }

    function _dumpHash(mix) {
        var ary = [], key,
            keys = Object.keys(mix).sort(), i = 0, iz = keys.length,
            name = mix.__CLASS__ ? "mm." + mix.__CLASS__ + sp
                 : mix.nickname  ? mix.nickname("anonymous") + sp : "";

        if (!iz) {
            return name + "{}";
        }
        for (; i < iz; ++i) {
            key = keys[i];
            ary.push(indent + '"' + key + '":' + sp +
                     _uu_dump(mix[key], space, depth, nest + 1));
        }
        return name + "{" + lf + ary.join("," + lf) +
                            lf + " ".repeat(space * (nest - 1)) + "}";
    }

    function _dumpNode(node) {
        var ary = [],
            attr = uu_attr(node), key, text;

        // add query path
        if (!/html|head|body|title|meta|script|link|style/i.test(node.nodeName)) {
            ary.push(indent + '"query":' + sp + '"' + uu.path(node) + '"');
        }
        // add attribute
        for (key in attr) {
            ary.push(indent + '"' + key + '":' + sp + '"' + attr[key] + '"');
        }
        // node tree
        for (node = node.firstChild; node; node = node.nextSibling) {
            switch (node.nodeType) {
            case 1: // ELEMENT_NODE
                ary.push(indent + '"<' + node.nodeName.toLowerCase() + '>":' + sp +
                         _uu_dump(node, space, depth, nest + 1));
                break;
            case 3: // TEXT_NODE
                text = (node.textContent || "").replace(/(?:\r\n|\r|\n)/g, " ").
                                                trim().overflow(30);
                text && ary.push(indent + '"text":' + sp + '"' + text + '"');
            }
        }
        return name + "{" + lf + ary.join("," + lf) +
                            lf + " ".repeat(space * (nest - 1)) + "}";
    }

    if (depth && nest > depth) {
        return "...";
    }

    var lf = space ? "\n" : "", // line feed
        sp = space ? " "  : "", // a space
        indent = " ".repeat(space * nest);

    switch (mm.type(mix)) {
    case "null":      return "null";
    case "undefined": return "undefined";
    case "global":    return "global";
    case "boolean":
    case "number":    return "" + mix;
    case "date":      return mix.toJSON();
    case "regexp":    return "/" + mix.source + "/";
    case "node":      return _dumpNode(mix);
    case "list":
    case "array":     return _dumpArray(mix);
    case "style":
    case "attr":      return _dumpHash(mm.cast(mix));
    case "object":
    case "function":  return _dumpHash(mix);
    case "string":    return '"' + mix + '"';
    }
    return "";
}

// uu.vendor
function uu_vendor(sample) { // @arg String: "user-select" or "userSelect"
                             // @ret Hash: { base, prefixed }
                             //     return.base - String: "userSelect"
                             //     return.prefixed - String: "WebkitUserSelect"
                             // @help: uu#uu.vendor
                             // @desc: convert vendornized string
//{@debug
    mm.allow("sample", sample, "String");
//}@debug

    var rv = "", ary = sample.split("-"), i = 1, iz = ary.length;

    for (rv = ary[0]; i < iz; ++i) {
        rv += ary[i].up(0);
    }
    return { base: rv, prefixed: VENDOR_PREFIX + rv.up(0) };
}

// uu.attr - attribute accessor
function uu_attr(node,    // @arg Node/CSSQueryString:
                 key,     // @arg String/Hash(= undefined): "key"
                 value) { // @arg String(= undefined): "value"
                          // @ret String/Hash/Node:
                          // @help: uu#uu.attr
                          // @desc: node attribute accessor, complex argeuments

    //  [1][get items]  uu.attr(node)                   -> { key: "value", ... }
    //  [2][get item]   uu.attr(node, key)              -> "value"
    //  [3][set item]   uu.attr(node, key, "value")     -> node
    //  [4][mix items]  uu.attr(node, { key: "value" }) -> node
//{@debug
    mm.allow("node",  node,  "Node/String");
    mm.allow("key",   key,   "String/Hash/undefined");
    mm.allow("value", value, "String/undefined");
//}@debug

    typeof node === "string" && (node = document.querySelector(node));

    switch (mm.complex(key, value)) {
    case 1: return mm.cast(node.attributes || []); // <document> has not attributes
    case 2: return (node.getAttribute( FIX_ATTR[key] || key ) || "") + "";
    case 3: key = mm.pair(key, value);
    }
    return uu_attr_set(node, key);
}

// uu.attr.set
function uu_attr_set(node,   // @arg Node/CSSQueryString:
                     hash) { // @arg Hash: { key: value, ... }
                             // @ret Node:
                             // @help: uu#uu.attr.set
                             // @desc: setAttribute
//{@debug
    mm.allow("node", node, "Node/String");
    mm.allow("hash", hash, "Hash");
//}@debug

    typeof node === "string" && (node = document.querySelector(node));

    for (var attr in hash) {
        switch (attr) {
        case "checked":
        case "disabled": node[attr] = !!hash[attr]; // node.disabled = true / false
            break;
        default:
            node.setAttribute( FIX_ATTR[attr] || attr, hash[attr]);
        }
    }
    return node;
}

// uu.css - css and StyleSheet accessor
function uu_css(node,    // @arg Node/CSSQueryString:
                key,     // @arg String/Hash(= void): CSS Property Keyword or "px"
                value) { // @arg String(= void): value
                         // @ret Hash/String/Node:
                         // @help: uu#uu.css
                         // @desc: css style accessor, complex argeuments

    //  [1][get computed items] uu.css(node)              -> { key: value, ... }
    //  [2][mix items]          uu.css(node, { key: value, ... }) -> node
    //  [3][get item]           uu.css(node, key)         -> value
    //  [4][set item]           uu.css(node, key, value)  -> node
    //  [5][create <style>]     uu.css("E{...}", node-id) ->

//{@debug
    mm.allow("node",  node,  "Node/String");
    mm.allow("key",   key,   "String/Hash/undefined");
    mm.allow("value", value, "String/undefined");
//}@debug

    typeof node === "string" && (node = document.querySelector(node));

    // 1: uu.css(), 2: uu.css(key), 3: uu.css(key, value), 4: uu.css({key:value, ...})
    switch (mm.complex(key, value)) {
    case 1: return mm.cast(global.getComputedStyle(node));
    case 2: return global.getComputedStyle(node)[ FIX_STYLE[key] || key ] || "";
    case 3: return uu_css_set(node, mm.pair(key, value));
    }
    return uu_css_set(node, key);
}

// uu.css.set
function uu_css_set(node,   // @arg Node/CSSQueryString:
                    hash) { // @arg Hash: { key: value, ... }
                            // @ret Node:
                            // @help: uu#uu.css.set
                            // @desc: set css properties
//{@debug
    mm.allow("node", node, "Node/String");
    mm.allow("hash", hash, "Hash");
//}@debug

    typeof node === "string" && (node = document.querySelector(node));

    var prop, value, vend, polyfill, isnum = /\d$/;

    for (prop in hash) {
        value = hash[prop] + "";
        prop = FIX_STYLE[prop] || prop; // either "text-align" or "textAlign"

        polyfill = STYLE_POLYFILL[prop];

        if (polyfill) {
            polyfill(node, prop, value);
        } else {
            isnum.test(value) && (value += "px"); // "10" -> "10px"
            if (node.style[prop] !== void 0) {
                node.style[prop] = value + "";
            } else {
                vend = VENDOR_PREFIX + prop.up(0);
                if (node.style[vend] !== void 0) {
                    node.style[vend] = value + "";
                }
            }
        }
    }
    return node;
}

// uu.style
function uu_style() {
}

// uu.style.create
function uu_style_create(id,      // @arg String: node id
                         rules) { // @arg CSSRuleString: "E { prop: value } E { ... }"
                                  // @ret Node: <style id="arguments.id">
                                  // @help: uu#uu.style.create
                                  // @desc: add <style> rules
//{@debug
    mm.allow("id",    id,    "String");
    mm.allow("rules", rules, "String");
//}@debug

    var rv;

    if (id) {
        rv = document.querySelector("#" + id);
    }
    if (!rv) {
        if ("textContent" in document.documentElement) { // modern browser
            rv = document.createElement("style");
            rv.id = id;
            rv.textContent = rules;
            document.head.appendChild(rv);
//{@ie
        } else if (document.createStyleSheet) { // IE
            rv = document.createStyleSheet();
            rv.id = id;
            rv.cssText = rules;
//}@ie
        }
    }
    return rv;
}

// uu.style.add
function uu_style_add(id,      // @arg String: node id
                      rules) { // @arg CSSRuleString: "E { prop: value } E { ... }"
                               // @ret Node: <style id="arguments.id">
                               // @help: uu#uu.style.add
                               // @desc: add <style> rules
    mm.deny("id", "TODO: NOT IMPL", "string");
}

// inner - set userSelect
function _userSelect(on) { // @arg Boolean(= false): true is on, false is off
    var body = document.body,
        vend = uu_vendor("user-select");

    if (body.style[vend.base] !== void 0) {
        body.style[vend.base] = on ? "" : "none";
    } else if (body.style[vend.mod] !== void 0) {
               body.style[vend.mod] = on ? "" : "none";
//{@ie
//{@opera
    } else { // if ie or opera
        body.unselectable  = on ? "" : "on";
        body.onselectstart = on ? "" : mm.pao(false);
//}@opera
//}@ie
    }
}

//{@ie
function uu_boot_ie678(fn_that) {
    function _callback() {
        var fn   = fn_that[0] || fn_that,
            that = fn_that[1] || null;

        fn.call(that);
    }

    // DOMContentLoaded for IE. http://d.hatena.ne.jp/uupaa/20100410/1270882150
    function _IE_DOMContentLoaded(){
        try {
            (new Image()).doScroll(); // [!] throws
            _callback();
        } catch (err) {
            setTimeout(_IE_DOMContentLoaded, 64); // delay after 64ms
        }
    }

    _IE_DOMContentLoaded();
}
//}@ie

// uu.boot
function uu_boot(fn_that) { // @arg Function/FunctionAndThatArray: fn or [fn, that]
                            // @help: uu#uu.boot
                            // @desc: boot loader (DOMContentLoaded event handler)
    function _callback() {
        var fn   = fn_that[0] || fn_that,
            that = fn_that[1] || null;

        fn.call(that);
    }
    if (document.readyState === "complete") {
        _callback();
    } else {
        document.addEventListener("DOMContentLoaded", _callback, false);
    }
}

// uu.main
function uu_main(fn_that) { // @arg Function/FunctionAndThatArray: fn or [fn, that]
                            // @help: uu#uu.main
                            // @desc: window.onload event handler
    var fn   = fn_that[0] || fn_that,
        that = fn_that[1] || null;

    if (document.readyState === "complete") {
        fn.call(that);
    } else {
        global.addEventListener("load", function() {
            fn.call(that);
        }, false);
    }
}

// uu.page - url dispatcher
function uu_page(path          // @param String(= location.href):
                 /*, ... */) { // @param PatternAndFunctionArray:
                               //          [<pattern, callback>, ..., missMatch]
                               //          pattern - PatternString/RegExp:
                               //          callback - Function: callback
                               //          missMatch - Function: miss matched callback
                               // @help: uu#uu.ready
                               // @see: http://code.google.com/p/x3-js/wiki/x3#x3.ready
                               // @desc: url dispatcher
    // uu.page("", "#a$",   function() { mm.log("page a"); },
    //             "b.htm", function() { mm.log("page b"); },
    //                      function() { mm.log("other page"); });
    path = path || location + "";

    var ary = [].slice.call(arguments).slice(1), pattern, callback;

    while ((pattern = ary.shift()) && (callback = ary.shift())) {
        if (path.indexOf(pattern) >= 0 || RegExp(pattern).test(path)) {
            return callback();
        }
    }
    pattern(); // miss match
};

// HTMLElement.prototype.on
function HTMLElement_on(type, // @arg String: event type
                        fn) { // @arg Function: callback
                              // @ret Node: this
                              // @desc: node.addEventListener alias
    // remove the existing event data
    this.__EVENT__ = _eventWalker(this.__EVENT__ || [], function(t, f) {
        return type === t && fn === f;
    });
    this.__EVENT__.push(type, fn);
    this.addEventListener(type, fn, false);

    return this;
}

// HTMLElement.prototype.one
function HTMLElement_one(type, // @arg String: event type
                         fn) { // @arg Function: callback
                               // @ret Node: this
                               // @desc: one time event handler
    // remove the existing event data
    var that = this;

    this.__EVENT__ = _eventWalker(this.__EVENT__ || [], function(t, f) {
        return type === t && fn === f;
    });
    this.__EVENT__.push(type, fn);
    this.addEventListener(type, function(ev) {
        fn.handleEvent ? fn.handleEvent(ev)
                       : fn.call(that, ev);
        that.removeEventListener(type, fn, false);
    }, false);

    return this;
}

// HTMLElement.prototype.off
function HTMLElement_off(type, // @arg String(= ""): event type
                         fn) { // @arg Function(= null): callback
                               // @ret Node: this
                               // @desc: node.removeEventListener alias
    // [1] node.off()            -> remove all events
    // [2] node.off("click")     -> remove all click events
    // [3] node.off("",      fn) -> remove all fn events
    // [4] node.off("click", fn) -> remove a event
    var that = this;

    this.__EVENT__ = _eventWalker(this.__EVENT__ || [], function(t, f) {
        var match = type && fn ? type === t && fn === f
                  : type       ? type === t
                  : fn         ? fn   === f
                  : true;

        if (match) {
            that.removeEventListener(t, f, false);
        }
        return match;
    });

    return this;
}

// inner - HTMLElement_on, HTMLElement_off helper
function _eventWalker(ary,  // @arg Array: [<type, fn>, <type, fn>, ...]
                      fn) { // @arg Function: callback(type, fn)
                            // @ret Array: [<type, fn>, <type, fn>, ...]
    var rv = [], i = 0, iz = ary.length;

    for (; i < iz; i += 2) {
        if (!fn(ary[i], ary[i + 1])) { // false is add pair, true is remove pair
            rv.push(ary[i], ary[i + 1]);
        }
    }
    return rv;
}

// HTMLElement.prototype.add
function HTMLElement_add(node) { // @arg Node: child node
                                 // @ret this:
                                 // @desc: appendChild
    node && this.appendChild(node);
    return this;
}

// HTMLElement.prototype.cut
function HTMLElement_cut() { // @ret this:
                             // @desc: to cut a parent-child connection
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }
    return this;
}

// HTMLElement.prototype.top
function HTMLElement_top(node) { // @ret this:
                                 // @desc: insert to top
    node && this.insertBefore(node, this.firstChild);
    return this;
}

// HTMLElement.prototype.has
function HTMLElement_has(node) { // @arg Node/CSSQueryString:
                                 // @ret Boolean:
                                 // @desc: has node
//{@debug
    mm.allow("node", node, "Node/String");
//}@debug

    if (node.nodeType) {
        while (node = node.parentNode) {
            if (this === node) {
                return true;
            }
        }
        return false;
    }
    return !!this.querySelector(node);
}

// HTMLElement.prototype.find
function HTMLElement_find(query, // @arg CSSQueryString:
                          from,  // @arg Number(= 0):
                          to) {  // @arg Number(= length):
                                 // @ret NodeArray:
                                 // @desc: find nodes
    var rv;

    if (mm.env.ie8) {
        rv = Array.from(this.querySelectorAll(query)).slice(from, to);
    } else {
        rv = this.querySelectorAll(query).toArray(from, to); // return NodeArray
    }
    rv.cut = NodeArray_cut;
    rv.clear = NodeArray_clear;
    return rv;
}

function NodeArray_cut() { // @ret NodeArray:
    return NodeArray_each(this, "cut");
}

function NodeArray_clear() { // @ret NodeArray:
    return NodeArray_each(this, "clear");
}

// inner -
function NodeArray_each(ary,      // @arg NodeArray:
                        method) { // @arg String:
                                  // @ret NodeArray:
    var i = ary.length;

    while (i--) {
        ary[i][method]();
    }
    return ary;
}

// HTMLElement.prototype.clear
function HTMLElement_clear() { // @ret this:
                               // @desc: clear all children
    while (this.lastChild) {
        this.removeChild(this.lastChild);
    }
    return this;
}

// HTMLElement.prototype.path
function HTMLElement_path() { // @ret CSSQueryString: "body>div:nth-child(5)"
                              // @help: HTMLElement#path
                              // @desc: get CSSQueryString
    var rv = [], curt = this, feat, index,
        roots = /^(?:html|head|body)$/i;

    while (curt && curt.nodeType === 1) { // 1 = Node.ELEMENT_NODE
        feat = "";

        if (roots.test(curt.nodeName)) {
            rv.push(curt.nodeName);
            break;
        }
        if (curt.className) {
            feat = "." + curt.className;
        }
        if (curt.id) {
            feat += "#" + curt.id;
        } else if (curt.parentNode &&
                   curt.parentNode.children.length > 1) {
            index = Array.from(curt.parentNode.children).indexOf(curt);
            feat += ":nth-child(" + (index + 1) + ")";
        }
        rv.push(curt.nodeName + feat);
        curt = curt.parentNode;
    }
    return rv.reverse().join(">").toLowerCase();
}

// HTMLElement#addClass
function HTMLElement_addClass(name) { // @arg ClassNameString:
                                      // @ret Node: this
    name = name.trim();
    this.hasClass(name) || (this.className += " " + name);
    return this;
}

// HTMLElement#removeClass
function HTMLElement_removeClass(name) { // @arg ClassNameString:
                                         // @ret Node: this
    name = name.trim();
    this.className = (" " + this.className + " ").replace(" " + name + " ", "").trim();
    return this;
}

// HTMLElement#toggleClass
function HTMLElement_toggleClass(name) { // @arg ClassNameString:
                                         // @ret Boolean: true is removed, false is added
    name = name.trim();
    var rv = this.hasClass(name);

    rv ? this.removeClass(name) : this.addClass(name);
    return !rv;
}

// HTMLElement#hasClass
function HTMLElement_hasClass(name) { // @arg ClassNameString:
                                      // @ret Boolean: ture is has
    name = name.trim();
    return (" " + this.className + " ").indexOf(" " + name + " ") >= 0;
}

// inner - prebuild camelized hash - http://handsout.jp/slide/1894
//          { width: "width", "text-align": "TextAlign", ... }
function _prebuildCamelizedStyleDB() {
    var DECAMELIZE = /([a-z])([A-Z])/g,
        NEXT_TOKEN = /-[a-z]/g,
        key, value, prefixed,
        htmlNode = document.documentElement,
        props = mm.env.webkit ? global.getComputedStyle(htmlNode, 0)
                              : htmlNode.style;

    if (mm.env.webkit) {
        for (key in props) {
            if (typeof props[key] === "string") {
                key = value = props.item(key); // key = "-webkit-...", "z-index"

                if (key.indexOf("-") >= 0) {
                    value = key.replace(NEXT_TOKEN, function(m) {
                        return m[1].toUpperCase();
                    });
                }
                FIX_STYLE[key]   = value; // { "z-index": "zIndex" }
                FIX_STYLE[value] = value; // {   zIndex : "zIndex" }
            }
        }
    } else {
        for (key in props) {
            if (typeof props[key] === "string") {
                prefixed = ((mm.env.gecko && !key.indexOf("Moz")) ? "-moz" + key.slice(3) :
                            (mm.env.ie    && !key.indexOf("ms"))  ? "-ms"  + key.slice(2) :
                            (mm.env.opera && !key.indexOf("O"))   ? "-o"   + key.slice(1) : key);

                value = prefixed.replace(DECAMELIZE, function(_, chr, Chr) {
                            return chr + "-" + Chr.toLowerCase();
                        });
                FIX_STYLE[value] = key;   // { "z-index": "zIndex" }
                FIX_STYLE[key]   = key;   // {   zIndex : "zIndex" }
            }
        }
    }
}

// --- build and export api ---
if (typeof module !== "undefined") { // is modular
    module.exports = { uu: uu_factory };
}
_defineLibraryAPIs(mm.mix);
_polyfillAndExtend(mm.wiz, global.HTMLElement  || global.Element,   // [IE8]
                           global.HTMLDocument || global.Document); // [IE8]

// setup boot loader
uu.boot(function() {
    _prebuildCamelizedStyleDB();
    global.boot && global.boot();
    global.main && uu_main(global.main);
});

})(this.self || global, this.document);
