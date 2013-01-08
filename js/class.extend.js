// class.extend.js: Class Extends
// @need: Object.defineProperty (in mixin.js)

//{@class
(function(global) {

// --- header ----------------------------------------------
Object.defineProperty(Function.prototype, "extend", {
    value: extend       // Function#extend(baseClass:Function)
});

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function extend(baseClass) {
    if (this.prototype.__proto__) {
        this.prototype.__proto__ = baseClass.prototype;
        return;
    }

    function mixin(to, from) {
        for (var key in from) { to[key] = from[key]; }
        return to;
    }

    var keep = mixin({}, this.prototype),
        VoidClass = function() {};

    VoidClass.prototype = baseClass.prototype;
    this.prototype = new VoidClass();

    mixin(this.prototype, keep);
    this.prototype.constructor = this;
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------

})(this.self || global);
//}@class

// --- test ------------------------------------------------
/*
    <script src="mixin.js"></script>
    <script src="class.extend.js"></script>
    <script>
    // --- header ----------------------------------------------

    // --- Class Fish ---
    function Fish(arg) {
        this.arg = arg;
    }
    Fish.name = "Fish";
    Fish.prototype.say = function() { return "fish"; };
    Fish.prototype.jump = function() { return "jump"; };

    // --- Class Ponyo extends Fish ---
    function Ponyo(arg) {
        Fish.call(this, arg);
    }
    Ponyo.extend(Fish);
    Ponyo.name = "Ponyo";
    Ponyo.prototype.say = function() { return "ponyo"; };

    // --- Class Human extends Ponyo ---
    function Human(arg) {
        Ponyo.call(this, arg);
    }
    Human.extend(Ponyo);
    Human.name = "Human";
    Human.prototype.say = function() { return "human"; };
    Human.prototype.jump = function() { return "i can fly"; };

    // --- implement -------------------------------------------
    var fish  = new Fish("Fish.arg");
    var ponyo = new Ponyo("Ponyo.arg");
    var human = new Human("Human.arg");

    // --- test ------------------------------------------------
    console.log(fish.constructor.name  === "Fish"  ? "ok" : "ng");
    console.log(ponyo.constructor.name === "Ponyo" ? "ok" : "ng");
    console.log(human.constructor.name === "Human" ? "ok" : "ng");

    console.log(fish.arg  === "Fish.arg"  ? "ok" : "ng");
    console.log(ponyo.arg === "Ponyo.arg" ? "ok" : "ng");
    console.log(human.arg === "Human.arg" ? "ok" : "ng");

    console.log(fish.say()  === "fish"  ? "ok" : "ng"); // fish#say impl
    console.log(ponyo.say() === "ponyo" ? "ok" : "ng"); // ponyo#say impl(override)
    console.log(human.say() === "human" ? "ok" : "ng"); // human#say impl(override)

    console.log(fish.jump()  === "jump"      ? "ok" : "ng"); // fish#jump impl
    console.log(ponyo.jump() === "jump"      ? "ok" : "ng"); // ponyo#jump not impl(call fish#jump)
    console.log(human.jump() === "i can fly" ? "ok" : "ng"); // human#jump impl(override)

    </script>
 */
