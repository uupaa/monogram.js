// logic.uid.js:

//{@uid
(function(global) {

// --- header ----------------------------------------------
function UID() { // @ret Integer:
    return create();
}
UID.name = "UID";           // fn.constructor.name -> "UID"
UID.create = create;        // (group:String = ""):Integer
UID.prototype.constructor = UID;

// --- library scope vars ----------------------------------
var _uids = {};

// --- implement -------------------------------------------
function create(group) { // @arg String(= ""): uid group name.
                         // @ret Integer: unique number, at 1 to 0x1fffffffffffff
                         // @help: UID.create
                         // @desc: create unique id
    group = group || "";
    _uids[group] || (_uids[group] = 0);

    // IEEE754 fraction size. 0x1fffffffffffff = Math.pow(2, 53) - 1
    if (++_uids[group] >= 0x1fffffffffffff) { // overflow?
          _uids[group] = 1; // reset
    }
    return _uids[group];
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { UID: UID };
}
global.Monogram || (global.Monogram = {});
global.Monogram.UID = UID;

})(this.self || global);
//}@uid

/*
    var UID = require("./logic.uid").UID;

    console.log( UID.create() );
    console.log( UID.create() );
    console.log( UID.create() );
    console.log( UID.create() );
 */


