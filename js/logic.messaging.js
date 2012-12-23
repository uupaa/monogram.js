// logic.messaging.js: Messaging API

//{@msg
(function(global) {

// --- header ----------------------------------------------
function Msg() {
    Object.defineProperty &&
        Object.defineProperty(this, "ClassName", { value: "Msg" });

    this._init();
}

Msg.prototype = {
    _init:          Msg_init,
    bind:           Msg_bind,           // Msg#bind(...):this
    unbind:         Msg_unbind,         // Msg#unbind(...):this
    list:           Msg_list,           // Msg#list():ClassNameStringArray
    to:             Msg_to,             // Msg#to(...):WrapperedObject
    post:           Msg_post,           // Msg#post(msg:String, ...):this
    send:           Msg_send            // Msg#send(msg:String, ...):ResultArray
};

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function Msg_init() {
    this._deliverable = {}; // deliverable instance db { __CLASS_UID__: instance, ... }
    this._broadcast   = []; // broadcast address
    Object.defineProperty(this, "ClassName", { value: "Msg" });
}

function Msg_bind(ooo) { // @var_args Instance: register drain instance
                         // @ret this:
                         // @throw: Error("NOT_DELIVERABLE")
                         // @help: Msg#bind
                         // @desc: register the drain(destination of the message) instance
    Array.prototype.slice.call(arguments).forEach(function(instance) {
        if (instance &&
            instance.__CLASS_UID__ && typeof instance.msgbox === "function") {

            this._deliverable[instance.__CLASS_UID__] = instance; // overwrite
        } else {
            throw new Error("NOT_DELIVERABLE");
        }
    }, this);

    // update broadcast address
    this._broadcast = _values(this._deliverable);
    return this;
}

function Msg_unbind(ooo) { // @var_args Instance: drain instance. undefined is unbind all instance
                           // @ret this:
                           // @help: Msg#unbind
                           // @desc: unregister drain instance
    var args = arguments.length ? Array.prototype.slice.call(arguments)
                                : this._broadcast;

    args.forEach(function(instance) {
        if (instance.__CLASS_UID__) {
            delete this._deliverable[instance.__CLASS_UID__];
        }
    }, this);

    // update broadcast address
    this._broadcast = _values(this._deliverable);
    return this;
}

function Msg_list() { // @ret ClassNameStringArray: [className, ...]
                      // @help: Msg#list
                      // @desc: get registered instance list
    var rv = [], key;

    for (key in this._deliverable) {
        rv.push(this._deliverable[key].ClassName);
    }
    return rv;
}

function Msg_to(ooo) { // @var_args Instance: delivery to address.
                       //            undefined   is Broadcast
                       //            Instance    is Unicast
                       //            instance... is Multicast
                       // @ret WrapperedObject: { that, addr, deli, post, send }
                       // @help: Msg#to
                       // @desc: set destination address
    var deli = {}, i;

    for (i in this._deliverable) {
        deli[i] = this._deliverable[i];
    }
    return {
        that: this,
        addr: arguments.length ? Array.prototype.slice.call(arguments)
                               : this._broadcast.concat(), // shallow copy
        deli: deli,
        post: Msg_post,
        send: Msg_send
    };
}

function Msg_send(msg,   // @arg String: msg
                  ooo) { // @var_args Mix: msgbox args. msgbox(msg, arg, ...)
                         // @ret Array: [result, ...], "NOT_DELIVERABLE" is ERROR
                         // @help: Msg#send
                         // @desc: send a message synchronously
    var rv = [], instance,
        addr = (this.addr || this._broadcast).concat(), i = 0, iz = addr.length,
        args = Array.prototype.slice.call(arguments),
        deli = this.deli || this._deliverable;

    for (; i < iz; ++i) {
        instance = deli[ addr[i].__CLASS_UID__ ];

        if (instance && instance.msgbox) {
            rv[i] = instance.msgbox.apply(instance, args);
        } else {
            rv[i] = "NOT_DELIVERABLE";
            if (instance) {
                console.log(msg + " is not deliverable. " + instance.ClassName);
            }
        }
    }
    return rv;
}

function Msg_post(msg,   // @arg String: msg
                  ooo) { // @var_args Mix: msgbox args. msgbox(msg, arg, ...)
                         // @ret this:
                         // @help: Msg#post
                         // @desc: post a message asynchronously
    var addr = (this.addr || this._broadcast).concat(), // shallow copy
        args = Array.prototype.slice.call(arguments),
        deli = this.deli || this._deliverable;

    setTimeout(function() {
        var instance, i = 0, iz = addr.length;

        for (; i < iz; ++i) {
            instance = deli[ addr[i].__CLASS_UID__ ];

            if (instance && instance.msgbox) {
                instance.msgbox.apply(instance, args);
            } else {
                if (instance) {
                    console.log(msg + " is not deliverable. " + instance.ClassName);
                }
            }
        }
    }, 0);
    return this.that || this;
}

function _values(obj) { // @arg Object:
                        // @ret Array: [value, ...]
    var rv = [], keys = Object.keys(obj), i = 0, iz = keys.length;

    for (; i < iz; ++i) { // uupaa-looper
        rv.push( obj[keys[i]] );
    }
    return rv;
}

// --- build and export API --------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Monogram: { Msg: Msg } };
} else if (typeof mm !== "undefined") {
    global.Monogram || (global.Monogram = {});
    global.Monogram.Msg = Msg;
}

})(this.self || global);
//}@msg

