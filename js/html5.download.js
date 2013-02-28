// Download.js:

(function(global) {

// --- header ----------------------------------------------
function Download(maxConnections) { // @arg Integer: maxConnections
    this._task = (new Array(maxConnections + 1).join("r")).split(""); // ["r", ...]
    this._queue = []; // [ info, ... ]
    this._pos = 0;    // [ primary queue /pos/ secondary queue ]
}
Download.name = "Download";
Download.nop = function() {};
Download.exec = exec;                   // exec(id:String, info:Object, fn:Function):void
Download.prototype.addQueue = addQueue; // #addQueue(id:String, base:String, info:Object, fn:Function):void
Download.BINARY = [
    "application/x-shockwave-flash",
    "application/octet-stream",
    "application/pdf",
    "image/gif",
    "image/png",
    "image/jpeg",
    "audio/x-wav"
];

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function exec(id,   // @arg String: asset id.
              info, // @arg Object: { url, type }
              fn) { // @arg Function: fn(err:Error, result:Object)
                    //        result - Object: { id, url, type, data, isBinary }
    var xhr = new XMLHttpRequest();
    var isBinary = Download.BINARY.indexOf(info.type) >= 0;

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var result = { id: id, url: info.url, type: info.type, data: "" };

            switch (xhr.status) {
            case 200:
            case 201:
                result.data = xhr.responseText;
                result.isBinary = isBinary;
                fn(null, result); // { id, url, type, data }
                break;
            case 304:
            default:
                fn(new TypeError(xhr.status), result);
            }
        }
    };
    xhr.open("GET", info.url, true);

    if (isBinary) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.withCredentials = true;
    xhr.send(null);
}

function addQueue(id,   // @arg String:
                  base, // @arg String: base die
                  info, // @arg Object: { url, type, prime }
                  fn) { // @arg Function: fn(err:Error, result:Object)
                        //       result - { id, url, type, data }
    var that = this;
    var obj = {
            id:   id,
            info: { url: base + info.url, type: info.type, prime: info.prime },
            fn:   fn || Download.nop
        };

    if (info.prime) {
        // inject
        this._queue.splice(this._pos, 0, obj)
        ++this._pos;
    } else {
        this._queue.push(obj);
    }
    _tick(this);
}

function _tick(that) {
    if (that._task.indexOf("r") >= 0) {
        that._task.forEach(function(state, index) {
            if (state === "r") { // ready
                var job = null;

                // fetch a job data from ordered queue.
                if (that._queue.length) {
                    job = that._queue.shift();
                    --that._pos;
                }
                if (job) {
                    that._task[index] = "p"; // progress

                    Download.exec(job.id, job.info, function(err, result) {
                        job.fn(err, result);
                        that._task[index] = "r"; // ready
                        _tick(that);
                    });
                }
            }
        });
    }
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Download: Download };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Download = Download;

})(this.self || global);


