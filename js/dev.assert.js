// dev.assert.js:

//{@assert
(function(global) {

// --- header ----------------------------------------------

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { UID: UID };
}
global.Monogram || (global.Monogram = {});
global.Monogram.UID = UID;

})(this.self || global);
//}@assert


