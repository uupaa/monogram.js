// html5.download.js:

(function(global) {

// --- header ----------------------------------------------
function Download() {
    this._task = ["ready", "ready"];
    this._primaryQueue   = [];  // [ info, ... ]
    this._secondaryQueue = [];  // [ info, ... ]
    this._timerID = 0;          // queue timer id
    this._interval = 0;         // interval timer delay
}
Download.name = "Download";
Download.nop = function() {};
Download.exec = exec;                   // exec(id:String, info:Object, fn:Function):void
Download.prototype.config = config;     // #config(maxConnection:Integer, interval:Integer):void
Download.prototype.addQueue = addQueue; // #addQueue(id:String, info:Object, fn:Function):void
Download.BINARY = [
    "application/x-shockwave-flash",
    "application/octet-stream",
    "application/pdf",
    "image/gif",
    "image/png",
    "image/jpg",
    "image/jpeg"
];

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function config(maxConnections, interval) {
    this._interval = interval;
    this._task = [];

    for (var i = 0; i < maxConnections; ++i) {
        this._task.push("ready");
    }
}

function exec(id,   // @arg String: asset id.
              info, // @arg Object: { url, type }
              fn) { // @arg Function: fn(err:Error, result:Object)
                    //        result - Object: { id, url, type, data }
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var result = { id: id, url: info.url, type: info.type, data: "" };

            switch (xhr.status) {
            case 200:
            case 201:
                result.data = xhr.responseText;
                fn(null, result); // { id, url, type, data }
                break;
            case 304:
            default:
                fn(new TypeError(xhr.status), result);
            }
        }
    };
    xhr.open("GET", info.url, true);

    if (Download.BINARY.indexOf(info.type || "") >= 0) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.withCredentials = true;
    xhr.send(null);
}

function addQueue(id,   // @arg String:
                  info, // @arg Object: { url, type, prime }
                  fn) { // @arg Function: fn(err:Error, result:Object)
                        //       result - { id, url, type, data }
    var that = this;
    var obj = { id: id, info: info, fn: fn || Download.nop };

    info.prime ? this._primaryQueue.push(obj);
               : this._secondaryQueue.push(obj);

    if (!this._timerID) {
        this._timerID = setInterval(function() {
            _tick(that);
        }, this._interval);
    }
}

function _tick(that) {
    if (!that._primaryQueue.length &&
        !that._secondaryQueue.length) { // empty -> stop interval

        if (that._timerID) {
            clearInterval(that._timerID);
            that._timerID = 0;
        }
        return;
    }
    that._task.forEach(function(state, index) {
        if (state === "ready") {
            var job = null;

            // fetch a job data from ordered queue.
            if (that._primaryQueue.length) {
                job = that._primaryQueue.shift();
            }
            if (!job || that._secondaryQueue.length) {
                job = that._secondaryQueue.shift();
            }
            if (job) {
                that._task[index] = "progress";

                Download.exec(job.id, job.info, function(err, result) {
                    job.fn(err, result);
                    that._task[index] = "ready";
                });
            }
        }
    });
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Download: Download };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Download = Download;

})(this.self || global);

