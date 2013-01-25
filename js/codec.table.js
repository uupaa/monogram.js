// codec.table.js:

//{@converttable
(function(global) {

// --- header ----------------------------------------------
function ConvertTable() {
}
ConvertTable.Integer = {
    to: {
        HexString:  Integer2HexString,  // ConvertTable.Integer.to.HexString():Object - {     0 : "00" ..   255 : "ff"}
        ByteString: Integer2ByteString  // ConvertTable.HexString.to.Integer():Object - {   "00":   0  ..   "ff": 255 }
    }
};
ConvertTable.HexString = {
    to: {
        Integer:    HexString2Integer   // ConvertTable.Integer.to.ByteString():Object - {     0 :"\00" ..   255 :"\ff"}
    }
};
ConvertTable.ByteString = {
    to: {
        Integer:    ByteString2Integer  // ConvertTable.ByteString.to.Integer():Object - {  "\00":   0  ..  "\ff": 255 }
                                        //                                               {"\f780": 128  .."\f7ff": 255 }
    }
};

// --- library scope vars ----------------------------------
var _conv_db;

// --- implement -------------------------------------------
function Integer2HexString() {
    return _conv("integer", "hexstring");
}

function Integer2ByteString() {
    return _conv("integer", "bytestring");
}

function HexString2Integer() {
    return _conv("hexstring", "integer");
}

function ByteString2Integer() {
    return _conv("bytestring", "integer");
}

function _conv(from, // @arg CaseInsensitiveString: "Integer", "HexString", "ByteString"
               to) { // @arg CaseInsensitiveString: "Integer", "HexString", "ByteString"
                     // @ret Object:
                     // @help: mm.conv
                     // @desc: convert tables
//{@debug
//    mm.allow("from", from, ["integer", "hexstring", "bytestring"].has(from.toLowerCase()));
//    mm.allow("to",   to,   ["integer", "hexstring", "bytestring"].has(  to.toLowerCase()));
//}@debug

    var num = { "integer": 1, hexstring: 2, bytestring: 4 },
        code = (num[from.toLowerCase()]) << 4 |
               (num[  to.toLowerCase()]);

    _conv_db || _init();

    return _conv_db[code] || {};

    function _init() {
        _conv_db = { 0x12: {}, 0x21: {}, 0x14: {}, 0x41: {} };

        var i = 0, hex, bin;

        for (; i < 0x100; ++i) {
            hex = (i + 0x100).toString(16).slice(1);
            bin = String.fromCharCode(i);
            _conv_db[0x12][i]   = hex;    // {   255 :   "ff" }
            _conv_db[0x21][hex] = i;      // {   "ff":   255  }
            _conv_db[0x14][i]   = bin;    // {   255 : "\255" }
            _conv_db[0x41][bin] = i;      // { "\255":   255  }
        }
        // http://twitter.com/edvakf/statuses/15576483807
        for (i = 0x80; i < 0x100; ++i) { // [Webkit][Gecko]
            _conv_db[0x41][String.fromCharCode(0xf700 + i)] = i; // "\f780" -> 0x80
        }
    }
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { ConvertTable: ConvertTable };
}
global.Monogram || (global.Monogram = {});
global.Monogram.ConvertTable = ConvertTable;

})(this.self || global);
//}@converttable

