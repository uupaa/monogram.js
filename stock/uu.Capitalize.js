// --- Capitalize ---

// Capitalize
function Capitalize(mix,           // @arg StringArray/String: ["pascal", "case"], ["camel", "case"],
                                   //                            ["snake", "case"], ["hy", "phe", "na", "tion"]
                    type,          // @arg String(= ""): capitalization type. "PascalCase", "camelCase",
                                   //                                     "snake_case", "hyphenation"
                    toLowerCase) { // @arg Boolean(= false): exec StringArray.toLowerCase()
                                   // @ret String: "PascalCase", "camelCase", "snake_case", "hy-phe-na-tion"
                                   // @help: Capitalize#mm.Capitalize
                                   // @desc: build capitalized string

//{@assert
    mm_allow(mix,         "StringArray/String");
    mm_allow(type,        TYPE_STRING);
    mm_allow(toLowerCase, TYPE_BOOLEAN | TYPE_UNDEFINED);
//}@assert

    // "pascalCase" -> ["pascal", "case"] -> "PascalCase"
    var ary = Array.isArray(mix) ? mix
                                 : _CapitalizedStringToStringArray(mix);

    if (toLowerCase) {
        ary = ary.map(function(v) {
            return v.toLowerCase();
        });
    }
    return _StringArrayToCapitalizedString(ary, type);
}

// Capitalize.toUpper1st
function Capitalize_toUpper1st(str) { // @arg String: "aaa"
                                      // @ret String: "Aaa"
                                      // @help: Capitalize#mm.Capitalize.toUpper1st
                                      // @desc: to upper first char
//{@assert
    mm_allow(str, TYPE_STRING);
//}@assert

    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Capitalize.toLower1st
function Capitalize_toLower1st(str) { // @arg String: "Aaa"
                                      // @ret String: "aaa"
                                      // @help: Capitalize#mm.Capitalize.toLower1st
                                      // @desc: to lower first char
//{@assert
    mm_allow(str, TYPE_STRING);
//}@assert

    return str.charAt(0).toLowerCase() + str.slice(1);
}

// Capitalize.toStringArray
function Capitalize_toStringArray(mix) { // @arg StringArray/String:
                                         // @ret StringArray:
                                         // @help: Capitalize#mm.Capitalize.toStringArray
                                         // @desc: convert String to StringArray
//{@assert
    mm_allow(mix, "StringArray/String");
//}@assert

    if (Array.isArray(mix)) { // ["pascal", "case"]
        return mix;
    }
    // "pascalCase" -> ["pascal", "case"]
    return _CapitalizedStringToStringArray(mix);
}

// inner - StringArrayToCapitalizedString
function _StringArrayToCapitalizedString(ary,    // @arg ArrayString: ["pascal", "case"], ["camel", "case"],
                                                 //                     ["snake", "case"], ["hy", "phe", "na", "tion"]
                                         type) { // @arg String: capitalization type. "PascalCase", "camelCase",
                                                 //                                     "snake_case", "hyphenation"
                                                 // @ret String: "PascalCase", "camelCase", "snake_case", "hy-phe-na-tion"
                                                 // @desc: build capitalized string
//{@assert
    mm_allow(ary,  "StringArray");
    mm_allow(type, TYPE_STRING);
    mm_allow(type.toLowerCase(), ["pascalcase", "camelcase", "snake_case", "hyphenation"]);
//}@assert

    switch (type.toLowerCase()) {
    case "pascalcase": return ary.map(Capitalize_toUpper1st).join("");
    case "camelcase":  return Capitalize_toLower1st(
                                    ary.map(Capitalize_toUpper1st).join(""));
    case "snake_case": return ary.join("_");
    case "hyphenation":return ary.join("-");
    }
    return "";
}

// inner - CapitalizedStringToStringArray
function _CapitalizedStringToStringArray(str) { // @arg String: "PascalCase", "camelCase",
                                                //                "snake_case", "hy-phe-na-tion"
                                                // @ret StringArray: ["pascal", "case"], ["camel", "case"],
                                                //                      ["snake", "case"],
                                                //                      ["hy", "phe", "na", "tion"]
                                                // @desc: split capitalized string

    function _splitPascalCase(src) {
        var rv = [], remain = "";

        src.replace(/^[a-z0-9]+/, function(m) {
            rv.push(m);
            return "";
        }).replace(/[A-Z][a-z0-9]*/g, function(m) {
            if (m.length === 1) {
                remain += m;
            } else if (m.length > 1) {
                remain && (rv.push(remain), remain = "");
                rv.push(m.toLowerCase());
            }
            return "";
        });
        remain && rv.push(remain);
        return rv;
    }

    str = str.trimChar("_", true).trimChar("-", true);

    return !str ? [""]
         : str.indexOf("_") >= 0 ? str.split("_") // snake_case        -> ["snake", "case"]
         : str.indexOf("-") >= 0 ? str.split("-") // hy-phe-na-tion    -> ["hy", "phe", "na", "tion"]
         : _splitPascalCase(str);                 // Pascal, camelCase -> ["pascal", "case"]
}
