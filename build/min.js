(function(global, document, modules) {

if (modules) {
    module.exports = {
        Min: Min
    };

    var fs = require("fs");
    var child_process = require("child_process");
}

function Min(config) {
    this.isWindows       = /^win/.test(global.process.platform);
    this.library         = config.library         || {};
    this.library.name    = config.library.name    || "unknown";
    this.library.version = config.library.version || "";
    this.library.license = config.library.license || "none";
    this.library.author  = config.library.author  || "";
    this.build           = config.build           || {};
    this.build.tool      = config.build.tool      || "google";
    this.build.tooldir   = config.build.tooldir   || ".";
    this.build.cutoff    =(config.build.cutoff    || "assert/debug").split("/");
    this.build.outdir    = config.build.outdir    || "./";
    this.build.src       = config.build.src       || [];
    this.before          = config.before          || {};
    this.before.enable   = config.before.enable   || false;
    this.before.script   = config.before.script   || "";
    this.after           = config.after           || {};
    this.after.enable    = config.after.enable    || false;
    this.after.script    = config.after.script    || "";

    this.init();

    // build file credit
    this.credit = at('/*!@@={version:"@@",license:"@@",author:"@@",' +
                     'date:"@@",tool:"@@",cutoff:"@@"}*/\n',
                    this.library.name, this.library.version,
                    this.library.license, this.library.author,
                    now(), this.build.tool, this.build.cutoff.join("/"));

    // build file path
    var path = this.build.outdir + this.library.name;

    if (this.library.version) {
        path += "-" + this.library.version;
    }
    this.catfood = path + ".js";     // dir/foobar-0.1.js
    this.infile  = path + ".in.js";  // dir/foobar-0.1.in.js
    this.minfile = path + ".min.js"; // dir/foobar-0.1.min.js
}

Min.prototype = {
    init: function() {
        switch (this.build.tool) {
        case "ms":
            // AjaxMin is Windows only
            this.isWindows || (this.build.tool = "google"); break;
        case "yahoo": break;
        case "google": break;
        default:
            throw new Error("UNKNOWN TOOL: " + this.build.tool);
        }
    },
    run: function() {
        if (this.before.enable) {
            this.exec(this.before.script);
        }

        var that = this,
            minifyParam = this.getMinifierCommandParam(),
            js; // concatenated source files

        // add credit to the first line
        js = this.credit +
             this.loadFiles(this.build.src).join(""); // concat files

        // normalize line feed
        js = js.replace(/(\r\n|\r|\n)/mg, "\n");

        js = this.injectSpecialCodeBlock(js);

        this.saveToFile(this.catfood, js);

        // ---
        js = this.trimCodeBlock(js);
        js = this.trimComment(js);
        js = this.trimSpace(js);
        js = this.lightWeight(js);

        this.saveToFile(this.infile, js);

        console.log("exec: " + minifyParam);

        if (this.isWindows) {
            var batfile = "__.bat";
            var stream = fs.createWriteStream(batfile);

            stream.write(minifyParam + "\n");
            stream.write("pause\n");
            stream.write("exit\n");
            stream.end();

            child_process.exec("start " + batfile, function(error) {
                if (error) {
                    console.log(error);
                    fs.unlinkSync(batfile);
                } else {
                    fs.unlinkSync(batfile);
                    if (that.after.enable) {
                        that.exec(that.after.script);
                    }
                }
            });
        } else {
            child_process.exec(minifycmd, function(error) {
                if (error) {
                    console.log(error);
                } else {
                    if (that.after.enable) {
                        that.exec(that.after.script);
                    }
                }
            });
        }
    },

    loadFiles: function(ary) { // @ret StringArray: [JavaScriptExpressionString, ...]
        return ary.map(function(fname) {
            return fs.readFileSync(fname, "UTF-8");
        });
    },

    copy: function(hash) { // @arg Hash: { source-file-path: target-file-path, ... }
        var read, write, src, tgt;

        for (src in hash) {
            read  = fs.createReadStream(src);
            write = fs.createWriteStream(hash[src]);

            read.pipe(write);
        }
    },

    exec: function(script) {
        child_process.exec(script, function(error) {
            if (error) {
                console.log(error);
            }
        });
    },

    // save to file
    saveToFile: function(fname, data) { // @arg JavaScriptExpressionString:
        fs.writeFileSync(fname, data, "UTF-8");
    },

    getMinifierCommandParam: function() { // @return String: minify command
        var rv = "";

        switch (this.build.tool) {
        case "google":  // http://code.google.com/p/closure-compiler/
            rv = at('java -jar @@/google/closure-compiler/compiler.jar --js @@ --js_output_file @@',
                    this.build.tooldir, this.infile, this.minfile);
            break;
        case "yahoo":   // http://developer.yahoo.com/yui/compressor/
            rv = at('java -jar @@/yahoo/yuicompressor/build/yuicompressor-2.4.2.jar -v --charset "utf-8" -o @@ @@',
                    this.build.tooldir, this.minfile, this.infile);
            break;
        case "ms":      // http://ajaxmin.codeplex.com/
            rv = at('@@\\ms\\AjaxMin\\AjaxMin.exe -warn:5 @@ -clobber:True -out @@',
                    this.build.tooldir, this.infile, this.minfile);
        }
        return rv;
    },

    injectSpecialCodeBlock: function(js) {
        js = js.replace(/(\/\/@add_profile)/, '$1\n(function(){console.log("add_profile");})();');

        return js;
    },

    // trim code block
    trimCodeBlock: function(js) { // @arg JavaScriptExpressionString:
                                  // @return JavaScriptExpressionString:

        this.build.cutoff.forEach(function(id) {
            if (id) {
                // trim:
                //
                // {@ident ... }@ident
                //
                var line  = RegExp("\\{@" + id + "\\b(?:[^\\n]*)\\}@" +
                                            id + "\\b", "g");

                // trim:
                //
                // {@ident
                //   ...
                // }@ident
                //
                var lines = RegExp("\\{@" + id + "\\b(?:[^\\n]*)\n(?:[\\S\\s]*?)?\\}@" +
                                            id + "\\b", "g");

                js = js.replace(line, " ").replace(lines, " ");
            }
        });
        return js;
    },

    // trim comments
    trimComment: function(js) { // @arg JavaScriptExpressionString:
                                // @return JavaScriptExpressionString:
        // trim comment line
        js = js.replace(/(^|\s)\/\/[^\n]*$/mg, "").     // "^//..." -> ""
                replace(/\/\/\s+[^\n]*$/mg, "").        // "// ..." -> ""
                replace(/\n\/\*(?:\s+)?\*\//g, "").     // "\n/*  */" -> ""
                replace(/\/\*(?:\s+)?\*\/\n/g, " ");    // "/*  */\n" -> " "

        // trim /* var_args */ comment
        js = js.replace(/\/\*\s*,?\s*var_args\s*\*\//g, ""); // "/*, var_args */" -> ""

        return js;
    },

    // trim spaces
    trimSpace: function(js) { // @arg JavaScriptExpressionString:
                              // @return JavaScriptExpressionString:

        // trim tail space
        js = js.replace(/\s+$/mg, "");

        // trim blank line
        js = js.replace(/\n(\s*\n)+/g, "\n");

        // { hash:     value }  ->  { hash: value }
        js = js.replace(/(\w+):\s+return/g, "$1: return"). // xxx: return
                replace(/(\w+):\s+false/g,  "$1: false").  // xxx: false
                replace(/(\w+):\s+true/g,   "$1: true").   // xxx: true
                replace(/(\w+):\s+(_\w+)/g, "$1: $2").     // xxx: _xxx
                replace(/(\w+):\s+\{\}/g,   "$1: {}").     // xxx: {}
                replace(/(\w+):\s+0/g,      "$1: 0");      // xxx: 0

        // "    " -> "\t" (4 spaces -> 1 tab)
        js = js.replace(/^[ ]{4,}/mg, function(all) {
                    return Array(((all.length / 4) | 0) + 1).join("\t") +
                                  (all.length % 4 ? " " : "");
                });

        // function(arg1,
        //          arg2,       ->  function(arg1, arg2, arg3)
        //          arg3)
        //                 or
        // function(//arg1,arg2,arg3
        //          arg1,
        //          arg2,       ->  function(arg1, arg2, arg3)
        //          arg3)
        js = js.replace(/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/g,
                        "($1, $2, $3, $4, $5, $6)").
                replace(/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/g,
                        "($1, $2, $3, $4, $5)").
                replace(/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+),\n\s+(\w+)\)/g,
                        "($1, $2, $3, $4)").
                replace(/\((?:\n\s+)?(\w+),\n\s+(\w+),\n\s+(\w+)\)/g,
                        "($1, $2, $3)").
                replace(/\((?:\n\s+)?(\w+),\n\s+(\w+)\)/g,
                        "($1, $2)");
        return js;
    },

    lightWeight: function(js) { // @arg JavaScriptExpressionString:
                                // @return JavaScriptExpressionString:
        // trim debugger; statement
        js = js.replace(/debugger;/g, "");

        // Node.* type alias
        js = js.replace(/Node.ELEMENT_NODE/g,            "1"). // Node.ELEMENT_NODE -> 1
                replace(/Node.TEXT_NODE/g,               "3").
                replace(/Node.CDATA_SECTION_NODE/g,      "4").
                replace(/Node.COMMENT_NODE/g,            "8").
                replace(/Node.DOCUMENT_NODE/g,           "9").
                replace(/Node.DOCUMENT_FRAGMENT_NODE/g, "11");

        return js;
    }
};

// --- unility ---
function now(format) { // @arg String(= "Y-M-D h:m:s"): format string

    function zz(num) {
        return num < 10 ? "0" + num : num;
    }

    format = format || "Y-M-DTh:m:s";

    var d = new Date;

    return format.replace(/Y/g, d.getUTCFullYear()).
                  replace(/M/g, zz(d.getUTCMonth() + 1)).
                  replace(/D/g, zz(d.getUTCDate())).
                  replace(/h/g, zz(d.getUTCHours())).
                  replace(/m/g, zz(d.getUTCMinutes())).
                  replace(/s/g, zz(d.getUTCSeconds()));
}

function at(format /*, var_args */) {
    var i = 1, args = arguments;

    return format.replace(/@@/g, function() {
        return args[i++];
    });
}

})(this.self || global, this.document, typeof module !== "undefined");

