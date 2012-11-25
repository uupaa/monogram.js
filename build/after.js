var fs = require("fs");

function copy(from, to) { // @arg String:
    fs.createReadStream(from).pipe( fs.createWriteStream(to) );
}

/*
copy("../js/mm.js",
     "{copy to path}/js/lib/mm.js");
 */
