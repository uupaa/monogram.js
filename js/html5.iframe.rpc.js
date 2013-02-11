// html5.iframe.rpc.js: <body> <-> <iframe> remote procedure call

(function(global) {

// --- header ----------------------------------------------
function RPC() { }
RPC.name = "RPC";
RPC.post = post;              // post(to:Integer, msg:String, param:Mix = null, fn:Function = null):void
RPC.post.toServer = toServer; // toServer(msg:String, param:Mix = null, fn:Function = null):void
RPC.server = server;          // server(fn:Function):void
RPC.client = client;          // client(fn:Function):void
RPC.client.join = join;       // join(index:Integer, src:String, fn:Function):void
RPC.client.release = release; // release(index):void

// --- library scope vars ----------------------------------
var _uuid = 0,          // RPC id
    _client = {
        index: 0,       // client index
        parent: { origin: "", window: null },
        callbacks: {}   // { id: fn }
    },
    _server = {
        clientdb: {},   // { index: iframe, ... }
        callbacks: {}   // { id: fn }
    };

// --- implement -------------------------------------------
function client(fn) { // @aeg Function: callback. fn(event)
    // [1] post          -> client -> event.response -> server -> fn(event)
    // [2] post.toServer -> server -> event.response -> client -> fn(event)

    global.addEventListener("message", function(event) {
        event.stopPropagation();
        var data = event.data, id = data.id;

        _client.index || (_client.index = data.index || 0);

        if (_client.callbacks[id]) { // [2]
            _client.callbacks[id](event, data.msg, data.result);
            _client.callbacks[id] = null; // free
        } else { // [1]
            data.oneway || (event.response = response);
            fn(event, data.msg, data.result); // RPC.client(event, msg, result)
        }

        function response(result) { // @arg Mix(= null):
            if (!_client.parent.origin) { // at first time
                _client.parent = { origin: event.origin, window: event.source };
            }
            _client.parent.window.postMessage({
                id:     data.id,
                msg:    data.msg + ".response",
                index:  _client.index,
                result: result || null
            }, _client.parent.origin);
        }
    }, false);
}

function server(fn) { // @aeg Function: callback. fn(event)
    // [1] post          -> client -> event.response -> server -> fn(event)
    // [2] post.toServer -> server -> event.response -> client -> fn(event)

    global.addEventListener("message", function(event) { // @arg Event:
        event.stopPropagation();
        var data = event.data, id = data.id;

        if (_server.callbacks[id]) { // [1]
            _server.callbacks[id](event, data.msg, data.result);
            _server.callbacks[id] = null; // free
        } else { // [2]
            data.oneway || (event.response = response);
            fn(event, data.msg, data.result); // RPC.server(event, msg, result)
        }

        function response(result) { // @arg Mix(= null):
            _server.clientdb[data.index].contentWindow.postMessage({
                id:     data.id,
                msg:    data.msg + ".response",
                index:  data.index,
                result: result || null
            }, "*");
        }
    }, false);
}

function post(index, // @arg Integer: client index
              msg,   // @arg String:
              param, // @arg Mix(= null): { ... }
              fn) {  // @arg Function(= null): fn(event)
                     // @desc: post to client
    var id = location.host + "@" + (++_uuid);

    fn && (_server.callbacks[id] = fn); // register callback

    _server.clientdb[index].contentWindow.postMessage({
        id:     id,
        msg:    msg,
        index:  index,
        result: param || null,
        oneway: fn ? false : true
    }, "*");
}

function toServer(msg,   // @arg String:
                  param, // @arg Mix(= null):
                  fn) {  // @arg Function(= null): fn(event)
    var id = location.host + "@" + (++_uuid);

    fn && (_client.callbacks[id] = fn); // register callback

    _client.parent.window.postMessage({
        id:     id,
        msg:    msg,
        index:  _client.index,
        result: param || null,
        oneway: fn ? false : true
    }, _client.parent.origin);
}

function join(index, // @arg: Integer: client index
              src,   // @arg: String: <iframe src="...">
              fn) {  // @arg Function: fn(index:Integer)
    var iframe = document.createElement("iframe");

    iframe.style.display = "none";
    iframe.onload = function(event) {
        fn(index);
    };
    iframe.src = src;
    _server.clientdb[index] = document.body.appendChild(iframe);
}

function release(index) { // @arg Integer: client index
    var iframe = _server.clientdb[index];

    iframe.parentNode.removeChild(iframe);

    delete _server.clientdb[index];
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { RPC: RPC };
}
global.Monogram || (global.Monogram = {});
global.Monogram.RPC = RPC;

})(this.self || global);

