
mm("Event", {
    init: function(type, fn, that, once, listener) {
        this.type = type;
        this.fn   = fn;
        this.that = that;
        this.once = once;
        this.listener = listener;
    },
    fire: function(args) {
        this.fn.apply(this.that || this.listener, args);
        if (this.once) {
            this.fn.remove(this.type, this.listener, this.that);
        }
    }
});

mm("Listener", {
    init: function() {
        this._event = {}; // { type: [fn, ...] }
    },

    add: function(type, fn) {
debugger;
        type in this._event || (this._event[type] = []);
        this._event[type].push(new mm.Event(type, fn, this, false, this));
    },

    remove: function(type, fn) {
debugger;
        var that = this;

        mm.each(this._event, function(eventArray, eventType) {
            if (type === eventType) {
                var pos = eventArray.indexOf(fn);

                if (pos >= 0) {
                    that._event[type].splice(pos, 1);
                }
            }
        });
    },

    fire: function(type /* var_args ... */) {
debugger;
        var args = [].slice.call(arguments, 1);

        mm.each(this._event, function(eventArray, eventType) {
            if (eventType === type) {
                eventArray.forEach(function(event) {
                    event.fire(args);
                });
            }
        });

        mm.eachIfKey(type, this._event, function(value) {
            value.forEach(function(eventObj) {
                eventObj.fire(args);
            });
        });
        mm.value(
    }
});



var lis = new mm.Listener();

lis.add("hoge", function(a, b, c) {
    debugger;
    alert("onhoge");
});
lis.add("huga", function(a, b, c) {
    debugger;
    alert("onhuga");
});


debugger;
lis.fire("hoge", 1, 2, 3);

