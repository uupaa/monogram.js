// dev.pollution.js: pollution detection API
// @need: Array#xor (in extend.function.js)

//{@perf
(function(global) { // @arg Global: window or global

// --- header ----------------------------------------------
function _defineLibraryAPIs() {
    mm.pollution = mm_pollution; // mm.pollution():StringArray
}

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function mm_pollution() { // @ret StringArray: [key, ...]
                          // @help: mm.pollution
                          // @desc: detect global object pollution
    if (mm_pollution._keys) {
        return mm_pollution._keys.xor( Object.keys(global) ); // Array#xor
    }
    mm_pollution._keys = Object.keys(global);
    return [];
}

// --- export --------------------------------
_defineLibraryAPIs();

})(this.self || global);
//}@perf

