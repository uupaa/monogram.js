// logic.json.query.js: json query
// @need: mm.js

//{@jsonquery
(function() {

// --- header ----------------------------------------------
function _defineLibraryAPIs() {
    JSON.query = JSON_query;
}

/*
    json = {
        lv1_a: {
            lv2_a: {}
        },
        lv1_b: {
            lv2_a: {}
        }
    }
    JSON.query(json, /^lv1_a$/) -> [ { depth: 1, object: lv1_a, path: "/lv1_a" } ]
    JSON.query(json, /^lv2_a$/) -> [ { depth: 2, object: lv2_a, path: "/lv1_a/lv2_a" },
                                     { depth: 2, object: lv2_a, path: "/lv1_b/lv2_a" }]
 */
// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function JSON_query(json,       // @arg Object:
                    selector,   // @arg RegExp(= ""): /^key$/
                    maxDepth) { // @arg Integer(= 0): max depth
                                // @ret ObjectArray: [ { object, path, depth }, ...]
                                //      object - Object: matched Object
                                //      path - String: matched Object path. "a.b.c.d"
                                //      depth - Integer: matchd Object depth. from 0
                                // @desc: find object
    selector = selector || /^\w+$/;
    maxDepth = maxDepth || 0;
    var rv = [];

    return _recursiveFind(json, "", 0);

    function _recursiveFind(obj, path, depth) {
        for (var key in obj) {
            if (selector.test(key)) {
                rv.push( { object: obj[key], path: path + "/" + key, depth: depth + 1 } );
            }
            if (mm.type(obj[key]) === "object") {
                if (maxDepth < depth + 1) {
                    _recursiveFind(obj[key], path + "/" + key, depth + 1);
                }
            }
        }
        return rv;
    }
}

// --- export ----------------------------------------------
_defineLibraryAPIs();

})();
//}@jsonquery

