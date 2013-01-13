// logic.cast.js: Cast
// @need: Monogram.Type (in logic.type.js)

//{@cast
(function(global) {

// --- header ----------------------------------------------
function Cast(mix) { // @arg Attr/Hash/List/FakeArray/Style/DateString/Mix:
                     // @ret Object/Array/Date/Mix:
                     // @help: Cast
                     // @desc: remove the characteristic
    switch (Monogram.Type(mix)) {
    case "Attr":    return Cast_attr(mix);        // Cast(Attr) -> Object
    case "Hash":    return mix.valueOf();         // Cast(Hash) -> Object
    case "List":    return Array.from(mix);       // Cast(List) -> Array
    case "Style":   return Cast_style(mix);       // Cast(Style) -> Object
    case "String":  return Date.from(mix) || mix; // Cast(DateString) -> Date/String
    }
    return mix;
}
Cast.name = "Cast";
Cast.attr = Cast_attr;   // Cast.attr(mix:NamedNodeMap):Object
Cast.style = Cast_style; // Cast.style(mix:CSSStyleDeclaration):Object

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Cast_attr(mix) { // @arg Attr: NamedNodeMap
                              // @ret Object:
                              // @inner:
    var rv = {}, i = 0, attr;

    for (; attr = mix[i++]; ) {
        rv[attr.name] = attr.value;
    }
    return rv;
}

function Cast_style(mix) { // @arg Style: CSSStyleDeclaration
                           // @ret Object:
                           // @inner:
    var rv = {}, key, value, i = 0, iz = mix.length;

    if (iz) { // [Firefox][WebKit][IE]
        for (; i < iz; ++i) {
            key = mix.item(i);
            value = mix[key];
            if (value && typeof value === "string") { // skip methods
                rv[key] = value;
            }
        }
    } else {
//{@opera
        for (key in mix) {
            value = mix[key];
            if (value && typeof value === "string") {
                rv[key] = value;
            }
        }
//}@opera
    }
    return rv;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Cast: Cast };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Cast = Cast;

})(this.self || global);
//}@cast

// --- text ------------------------------------------------
/*
<!DOCTYPE html><html><head><meta charset="utf-8">
<script src="../js/mixin.js"></script>
<script>
Monogram.require("../js/logic.type.js");
Monogram.require("../js/logic.cast.js");

var Type = Monogram.Type;
var Cast = Monogram.Cast;

window.onload = function() {
    console.log( Cast("
};

</script></head><body></body></html>
 */

