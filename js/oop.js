// oop.js: Interface and Class
// @need: Monogram.UID (in logic.uid.js)

//
//  TypeScript interface:
//      interface Point { x: number; y: number; }
//
//  Monogram.js interface:
//      Interface("Point", { x: "number", y: "number" });
//
//
//{@oop
(function(global) {

// --- header ----------------------------------------------
function Interface(name,   // @arg String:
                   spec) { // @arg Object: { key: typeString, ... }
                           // @help: Interface
    InterfaceFactory(name, spec);
}
Interface.name = "Interface";
Interface.has = Interface_has;          // Interface.has(name):Boolean
Interface.getSpec = Interface_getSpec;  // Interface.getSpec(name:String):Object

function Class(specs,      // @arg String: "Class:Traits:Interface:BaseClass"
               properties, // @arg Object(= undefined): prototype method and literals
               statics) {  // @arg Object(= undefined): static method and literals
                           // @ret Function: initializer
                           // @help: Class
    ClassFactory(specs, properties, statics);
}
Class.name = "Class";
Class.has = Class_has;                  // Class.has(name):Boolean
Class.getSpec = Class_getSpec;          // Class.getSpec(name:String):Object

// --- library scope vars ----------------------------------
var _interface_db = {},
    _class_db = {};

// --- implement -------------------------------------------
function InterfaceFactory(name,   // @arg String:
                          spec) { // @arg Object: { key: typeString, ... }
                                  // @help: Interface
    if (name in _interface_db) {
        throw new TypeError("ALREADY_EXISTS: " + name);
    }
    _interface_db[name] = spec;
}

function Interface_has(name) { // @arg String: interface name
                               // @ret Boolean:
    return name in _interface_db;
}

function Interface_getSpec(name) { // @arg String: interface name
                                   // @ret Object: spec
    return _interface_db[name];
}

function ClassFactory(specs,      // @arg String: "Class:Traits:Interface:BaseClass"
                      properties, // @arg Object(= undefined): prototype method and literals
                      statics) {  // @arg Object(= undefined): static method and literals
                                  // @ret Function: initializer
                                  // @help: Class
/*
//{@debug
    mm.allow("specs",      specs,      "String"); // "Class:Singleton:Interface:Base"
    mm.allow("properties", properties, "Object/undefined");
    mm.allow("statics",    statics,    "Object/undefined");
//}@debug
 */

    properties = properties || {};

    var InheritBaseClass,
        spec = _parseClassSpec(specs); // { klass: String, traits: StringArray,
                                       //   base: String, interfaces: StringArray }
    // --- validate class ---
    if (_class_db[spec.klass]) { // already?
        return _class_db[spec.klass];
    }
    // --- validate interface ---
    spec.interfaces.forEach(function(name) {
        Type.allow("properties", properties, name);
    });

    // --- class definition ---
    _class_db[spec.klass] = spec.traits.has("Singleton") ? SingletonClass
                                                         : GenericClass;

    if (spec.base) { // Class extend BaseClass
        InheritBaseClass = function() {};
        InheritBaseClass.prototype = _class_db[spec.base].prototype;
        _class_db[spec.klass].prototype = new InheritBaseClass();

        mixin(_class_db[spec.klass].prototype, properties, true); // override mixin prototype.methods
        _class_db[spec.klass].name = spec.klass;
        _class_db[spec.klass].prototype.constructor = _class_db[spec.klass];
        _class_db[spec.klass].prototype.__BASE__ = mixin({}, _class_db[spec.base].prototype);
    } else {
        mixin(_class_db[spec.klass].prototype, properties); // mixin prototype.methods
        _class_db[spec.klass].name = spec.klass;
        _class_db[spec.klass].prototype.constructor = _class_db[spec.klass];
        _class_db[spec.klass].prototype.__BASE__ = null;
    }
    _class_db[spec.klass].prototype.callSuper = _callSuperMethod;

    statics && mixin(_class_db[spec.klass], statics);

    if (spec.traits.has("Singleton") && !spec.traits.has("SelfInit")) {
        _class_db["i" + spec.klass] = new _class_db[spec.klass];
    }
    return _class_db[spec.klass];

    function SingletonClass(ooo) { // @var_args Mix: constructor arguments
        if (!SingletonClass.__INSTANCE__) {
             SingletonClass.__INSTANCE__ = this; // keep self instance

            _factory(this, arguments);
        }
        return SingletonClass.__INSTANCE__;
    }

    function GenericClass(ooo) { // @var_args Mix: constructor arguments
        _factory(this, arguments);
    }

    function _factory(that, args) { // @lookup: className, properties,
        Object.defineProperty(that, "__CLASS_UID__", {
            value: Monogram.UID.create("Class")
        });

        var obj = that, stack = [];

        // --- constructor chain --- (Base#init -> Class#init)
        while (obj = obj.__BASE__) {
            obj.init && stack.push(obj);
        }
        while (obj = stack.pop()) {
            obj.init.apply(that, args);
        }

        // [!] call Class#init(args, ...)
        properties.init && properties.init.apply(that, args);

        that.gc = function() {
            // [!] call Class#gc
            properties.gc && properties.gc.call(that);

            // --- gc chain --- (Class#gc -> Base#gc)
            obj = that;
            while (obj = obj.__BASE__) {
                obj.gc && obj.gc.call(that);
            }

            if (spec.traits.has("Singleton")) {
                delete SingletonClass.__INSTANCE__;
                delete _class_db["i" + spec.klass];
            }
            Hash.clear(that); // destroy them all
            that.gc = function GCSentinel() {
//              mm_log("GC_BAD_CALL");
            };
        };
    }
}

function Class_has(name) { // @arg String: class name
                           // @ret Boolean:
    return name in _class_db;
}

function Class_getSpec(name) { // @arg String: class name
                               // @ret Object: spec
    return _class_db[name];
}

function _callSuperMethod(name,  // @arg String: method name
                          ooo) { // @var_args Mix: args
                                 // @ret Mix/undefined:
                                 // @inner: this.callSuper("method", args, ...)
/*
//{@debug
    mm.allow("name", name, "String");
//}@debug
 */
    var obj = this,
        args = Array.prototype.slice.call(arguments, 1);

    while (obj = obj.__BASE__) {
        if (typeof obj[name] === "function") {
            return obj[name].apply(this, args);
        }
    }
    args.unshift(name);
    return this.trap.apply(this, args); // call trap(method, ...)
}

function _parseClassSpec(ident) { // @arg StringArray: "Class:Trait:Base"
                                  // @ret Object: { klass, traits, base, interfaces }
                                  //        klass - String: "Class"
                                  //        traits - StringArray: ["Singleton", "SelfInit"]
                                  //        base - String: "BaseClass"
                                  //        interfaces - StringArray: ["Interface", ...]
                                  // @throw: TypeError("CLASS_NAME_NOT_FOUND"),
                                  //         TypeError("CLASS_NAME_MULTIPLE_INHERITANCE: ..."),
                                  //         TypeError("TRAITS_OR_CLASS_NAME_NOT_FOUND: ...")
                                  // @inner: parse traits and base class string
    var TRAITS = ["Singleton", "SelfInit"],
        ary = ident.split(":"), name,
        rv = { klass: "", traits: [], base: "", interfaces: [] };

    rv.klass = ary.shift(); // "Class:Base" -> "Class"
    if (!rv.klass) {
        throw new TypeError("CLASS_NAME_NOT_FOUND");
    }
    while (name = ary.shift()) {
        if (name in _interface_db) {
            rv.interfaces.push(name);
        } else if (TRAITS.has(name)) {
            rv.traits.push(name);
        } else if (_class_db[name]) { // already Class
            if (rv.base) {
                throw new TypeError("CLASS_NAME_MULTIPLE_INHERITANCE: " + name);
            }
            rv.base = name;
        } else {
            throw new TypeError("TRAITS_OR_CLASS_NAME_NOT_FOUND: " + name);
        }
    }
    return rv;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Interface: Interface, Class: Class };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Interface = Interface;
global.Monogram.Class = Class;

})(this.self || global);
//}@oop

// --- test ------------------------------------------------
