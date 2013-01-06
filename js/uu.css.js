(function(global, document, getComputedStyle) {

    //  [1][offset from LayoutParentNode] uu.css.box.rect(<div>)         -> { x: 100, y: 100, w: 100, h: 100, from: <?> }
    //  [2][offset from AncestorNode]     uu.css.box.rect(<div>, <html>) -> { x: 200, y: 200, w: 100, h: 100, from: <html> }
    //  uu.css.setPosition(node, "static");
    //  uu.css.setPosition(node, "absolute");
    //  uu.css.setPosition(node, "relative");

function _defineLibraryAPIs(mix) {
    uu.BORDER =     0x1;
    uu.MARGIN =     0x2;
    uu.PADDING =    0x4;
    uu.calc = {
        px:         uu_calc_px,         // uu.calc.px(node, value):Number
        edge:       uu_calc_edge,       // uu.calc.edge(node):Hash { b, m, p }
        offset:     uu_calc_offset,     // uu.calc.offset(node, from = null):{ x, y, from }
        boxSize:    uu_calc_boxSize,    // uu.calc.boxSize(node):Hash { w, h }
        boxRect:    uu_calc_boxRect,    // uu.calc.boxRect(node, from = null):Hash { x, y, w, h, from }
        vboxSize:   uu_calc_vboxSize,   // uu.calc.vboxSize(node):Hash { w, h }
        vboxRect:   uu_calc_vboxRect    // uu.calc.vboxRect(node, from = null):Hash { x, y, w, h, from }
    };
    uu.css.box = mix(uu_css_box, {      // uu.css.box
        attach:     uu_css_box_attach,  // uu.css.box.attach(node):Hash {}
        detach:     uu_css_box_detach   // uu.css.box.detach(node):Hash { x, y, offset, margin }
    });
}

// --- local vars ---
// none


// uu.calc.px - calc pixel value
function uu_calc_px(node,    // @arg Node: context
                    value) { // @arg Number/CSSUnitString: 12, "12", "12px",
                             //                            "12pt", "12em", "auto"
                             // @ret Number: pixel value
                             // @help: uu#uu.calc.px
                             // @desc: calc pixel value
    return isFinite(value)   ? +value                           // "12.1"   -> 12.1
         : /px$/.test(value) ? parseFloat(value) || 0           // "12.1px" -> 12.1
         : /pt$/.test(value) ? (parseFloat(value) * 4 / 3) | 0  // "12.1pt" -> 12.1 * 1.333 -> 16.12
         : /em$/.test(value) ? _calcEmByFontSize(node, value)   // "12.1em" -> 12.1 * 1em -> ??
         : _calcPixelByProperty(node, value, "left");           // "auto"   -> calc -> ??
}

// inner - calc by font-size
function _calcEmByFontSize(node,    // @arg Node:
                           value) { // @arg NumberString/CSSEmUnitString: "12", "12em"
                                    // @ret Number: pixel value
    var fontSize = getComputedStyle(node, 0).fontSize,
        bias = /pt$/.test(fontSize) ? 4 / 3 // "12pt"           -> *1.333
                                    : 1;    // "12px" and other -> *1

    return (parseFloat(value) * parseFloat(fontSize) * bias) | 0;
}

// inner - calc css unit to pixel
function _calcPixelByProperty(node,  // @arg Node:
                              value, // @arg CSSUnitString: "10em", "10pt", "10px", "auto"
                              by) {  // @arg String: by property, "left", "width", ...
                                     // @ret Number: pixel value
//{@ie
    function _ie678(node,  // @param Node:
                    value, // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                    by) {  // @param String: by property, "left", "width", ...
                           // @ret Number: pixel value
        var ns = node.style,
            nr = node.runtimeStyle,
            mem = [ns[by], nr[by]]; // keep !important value

        // overwrite
        nr[by] = node.currentStyle[by];
        ns[by] = value;

        // get pixel
        value = ns.pixelLeft;

        // restore
        ns[by] = mem[0];
        nr[by] = mem[1];

        return value || 0;
    }
    if (mm.env.ie8) {
        return _ie678(node, value, by);
    }
//}@ie

    var ns = node.style,
        mem = [ns.left, 0, 0]; // [left, position, display]

//{@webkit
    if (mm.env.webkit) {
        mem[1] = ns.getPropertyValue("position");
        mem[2] = ns.getPropertyValue("display");
        ns.setProperty("position", "absolute", "important");
        ns.setProperty("display",  "block",    "important");
    }
//}@webkit

    // effect style
    ns.setProperty(by, value, "important");

    value = parseInt(getComputedStyle(node).left); // get pixel

    // restore style
    ns.removeProperty(by);
    ns.setProperty(by, mem[0], ""); // remove !important

//{@webkit
    if (mm.env.webkit) {
        ns.removeProperty("position");
        ns.removeProperty("display");
        ns.setProperty("position", mem[1], "");
        ns.setProperty("display",  mem[2], "");
    }
//}@webkit
    return value || 0;
}

// uu.calc.edge
function uu_calc_edge(node,   // @arg Node:
                      menu) { // @arg Number(= uu.BORDER | uu.MARGIN | uu.PADDING): cook menu
                              // @ret Hash: { b, m, p }
                              //    b - EdgeHash: { top, left, right, bottom }
                              //    m - EdgeHash: { top, left, right, bottom }
                              //    p - EdgeHash: { top, left, right, bottom }
                              //    {b|m|p}.top    - Number: {border|margin|padding} top width
                              //    {b|m|p}.left   - Number: {border|margin|padding} left width
                              //    {b|m|p}.right  - Number: {border|margin|padding} right width
                              //    {b|m|p}.bottom - Number: {border|margin|padding} bottom width
                              // @help: uu#uu.calc.edge
                              // @desc: calc edge size(margin, padding, border)
//{@debug
    mm.allow("node", node, "Node");
    mm.allow("menu", menu, "Number/undefined");
//}@debug

    menu = menu || (uu.BORDER | uu.MARGIN | uu.PADDING);

    var db = {
            "0px": 0, "1px": 1, "2px": 2, "3px": 3, thin: 1, medium: 3, thick: 5
        },
        cs = getComputedStyle(node, 0), n, undef, auto = "auto",
        mt = cs.marginTop,
        ml = cs.marginLeft,
        mr = cs.marginRight,
        mb = cs.marginBottom,
        bt = cs.borderTopWidth,
        bl = cs.borderLeftWidth,
        br = cs.borderRightWidth,
        bb = cs.borderBottomWidth,
        pt = cs.paddingTop,
        pl = cs.paddingLeft,
        pr = cs.paddingRight,
        pb = cs.paddingBottom;

    if (menu & uu.MARGIN) {
        mt = ((n = db[mt]) === undef) ? uu_calc_px(node, mt) : n;
        ml = ((n = db[ml]) === undef) ? uu_calc_px(node, ml) : n;
        mr = ((n = db[mr]) === undef) ? uu_calc_px(node, mr) : n;
        mb = ((n = db[mb]) === undef) ? uu_calc_px(node, mb) : n;
    }
    if (menu & uu.BORDER) {
        // border: auto -> invalid value -> 0
        bt = ((n = db[bt]) === undef) ? bt === auto ? 0 : uu_calc_px(node, bt) : n;
        bl = ((n = db[bl]) === undef) ? bl === auto ? 0 : uu_calc_px(node, bl) : n;
        br = ((n = db[br]) === undef) ? br === auto ? 0 : uu_calc_px(node, br) : n;
        bb = ((n = db[bb]) === undef) ? bb === auto ? 0 : uu_calc_px(node, bb) : n;
    }
    if (menu & uu.PADDING) {
        // padding: auto -> invalid value -> 0
        pt = ((n = db[pt]) === undef) ? pt === auto ? 0 : uu_calc_px(node, pt) : n;
        pl = ((n = db[pl]) === undef) ? pl === auto ? 0 : uu_calc_px(node, pl) : n;
        pr = ((n = db[pr]) === undef) ? pr === auto ? 0 : uu_calc_px(node, pr) : n;
        pb = ((n = db[pb]) === undef) ? pb === auto ? 0 : uu_calc_px(node, pb) : n;
    }
    return {
        m: { top: mt, left: ml, right: mr, bottom: mb },
        b: { top: bt, left: bl, right: br, bottom: bb },
        p: { top: pt, left: pl, right: pr, bottom: pb }
    };
}

// uu.calc.offset
function uu_calc_offset(node,   // @arg Node: node has parentNode
                        from) { // @arg Node(= null): ancestor node or null
                                //                    null is detect layout-parent node
                                // @ret Hash: { x, y, from }
                                //   x - Number: total offset
                                //   y - Number: total offset
                                //   from - Node: AncestorNode or LayoutParentNode(detected)
                                // @help: uu#uu.calc.offset.from
                                // @desc: calc offset from AncestorNode or LayoutParentNode
                                //        `` 座標計算上の親ノードからのオフセット座標を計算します

    function _offsetFromAncestor(node,   // @arg Node:
                                 from) { // @arg Node:
                                         // @ret Hash: { x, y, from }
        var x = 0, y = 0;

        while (node && node !== from) { // body.offsetParent is null
            x   += node.offsetLeft || 0;
            y   += node.offsetTop  || 0;
            node = node.offsetParent;
        }
        return { x: x, y: y, from: node ? from : document.html };
    }

    function _offsetFromLayoutParent(node) { // @arg Node:
                                             // @ret Hash: { x, y, from }
        var x = 0, y = 0, cs, from;

        while (node) { // body.offsetParent is null
            x   += node.offsetLeft || 0;
            y   += node.offsetTop  || 0;
            node = node.offsetParent;
            if (node) {
                cs = getComputedStyle(node).position;
                if (cs === "relative" || cs === "absolute") {
                    from = node;
                    break;
                }
            }
        }
        return { x: x, y: y, from: from || document.body };
    }

    if (!node || !node.parentNode) {
        return { x: 0, y: 0, from: null };
    }
    if (from) {
        return _offsetFromAncestor(node, from);
    }

    var cs = getComputedStyle(node);

    if (cs.position === "relative" || cs.position === "absolute") {
        if (cs.left !== "auto" && cs.left !== "0px" && // [!GECKO] left: "auto"
            cs.top  !== "auto" && cs.top  !== "0px") { // [GECKO]  left: "0px"
            return { x: parseInt(cs.left),
                     y: parseInt(cs.top),
                     from: node.offsetParent };
        }
    }
    return _offsetFromLayoutParent(node);
}

// uu.calc.boxSize
function uu_calc_boxSize(node) { // @arg Node:
                                 // @ret Hash: { w, h }
//{@debug
    mm.allow("node", node, "Node");
//}@debug

    var cs = getComputedStyle(node);

    return { w: parseFloat(cs.width), h: parseFloat(cs.height) };
}

// uu.calc.boxRect
function uu_calc_boxRect(node,   // @arg Node: node has parentNode
                         from) { // @arg Node(= null): ancestor node or null
                                 //                    null is detect layout-parent node
                                 // @ret Hash: { x, y, w, h, from }
                                 //   x - Number: total offset
                                 //   y - Number: total offset
                                 //   w - Number: node.style.width (without padding, without border)
                                 //   h - Number: node.style.height (without padding, without border)
                                 //   from - Node: LayoutParentNode(detected)
                                 // @help: uu#uu.calc.boxRect
                                 // @desc: calc offset from AncestorNode or LayoutParentNode
                                 //        `` 座標計算上の親ノードからのオフセット座標と要素の大きさを計算します
    var rv = uu_calc_offset(node, from),
        r  = uu_calc_boxSize(node);

    rv.w = r.w;
    rv.h = r.h;
    return rv;
}

// uu.calc.vboxSize
function uu_calc_vboxSize(node) { // @arg Node:
                                  // @ret Hash: { w, h }
//{@debug
    mm.allow("node", node, "Node");
//}@debug
    // TODO: display: none の時に最新の各ブラウザが適切な値を返すかしらべる
    //       返さないようなら、 一時的に display: block にして、測定する

    var rect = node.getBoundingClientRect(), w = 0, h = 0;

    w = node.offsetWidth  || (rect.right - rect.left);
    h = node.offsetHeight || (rect.bottom - rect.top);

    return { w: w, h: h };
}

// uu.calc.vboxRect
function uu_calc_vboxRect(node,   // @arg Node: node has parentNode
                          from) { // @arg Node(= null): ancestor node or null
                                  //                    null is detect layout-parent node
                                  // @ret Hash: { x, y, w, h, from }
                                  //   x - Number: total offset
                                  //   y - Number: total offset
                                  //   w - Number: visual width (with padding, with border)
                                  //   h - Number: visual height (with padding, with border)
                                  //   from - Node: AncestorNode or LayoutParentNode(detected)
                                  // @help: uu#uu.calc.offset.from
                                  // @desc: calc offset from AncestorNode or LayoutParentNode
                                  //        `` 座標計算上の親ノードからのオフセット座標と要素の大きさを計算します
    var rv = uu_calc_offset(node, from),
        r  = uu_calc_vboxSize(node);

    rv.w = r.w;
    rv.h = r.h;
    return rv;
}

//
function uu_css_box() {
}

// uu.css.box.attach
function uu_css_box_attach(node) { // @arg Node:
                                   // @ret Hash: {}
                                   // @help: uu#uu.css.box.attach
                                   // @desc: position:absolute/relative -> position:static
    node.style.position = "static";
    return {};
}

// uu.css.box.detach
function uu_css_box_detach(node) { // @arg Node:
                                   // @ret Hash: { x, y, offset, margin }
                                   // @help: uu#uu.css.box.attach
                                   // @desc: position:static/relative -> position:absolute

    var offset = uu_calc_offset(node), // offset from LayoutParent
        margin = uu_calc_edge(node, uu.MARGIN).m,
        ns = node.style,
        x = offset.x - margin.left,
        y = offset.y - margin.top;

    ns.left = x + "px";
    ns.top  = y + "px";
    ns.position = "absolute";
    return { x: x, y: y, offset: offset, margin: margin };
}

_defineLibraryAPIs(mm.mix);

})(this, this.document, this.getComputedStyle);

// --- CSS BOX MODEL ---

// The width                       is node.style.width
// The clientWidth                 is node.style.width + padding.width
// The offsetWidth                 is node.style.width + padding.width + border.width
// The getBoundingClientRect.width is node.style.width + padding.width + border.width
//
//   [CSS2.1 box model] http://www.w3.org/TR/CSS2/box.html
//
//       B-------border--------+ -> border edge [CSS2.1 KEYWORD]
//       |                     |
//       |  P----padding----+  | -> padding edge [CSS2.1 KEYWORD]
//       |  |               |  |
//       |  |  C-content-+  |  | -> content edge [CSS2.1 KEYWORD]
//       |  |  |         |  |  |
//       |  |  |         |  |  |
//       |  |  +---------+  |  |
//       |  |               |  |
//       |  +---------------+  |
//       |                     |
//       +---------------------+
//
//       border  = event.offsetX/Y in WebKit
//                 event.layerX/Y  in Gecko
//       padding = event.offsetX/Y in IE6 ~ IE8
//       content = event.offsetX/Y in Opera

