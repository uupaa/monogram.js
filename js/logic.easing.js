// Math.easing.js: easing function API
//
// This code block base idea from Robert Penner's easing equations.
//      (c) 2001 Robert Penner, all rights reserved.
//      http://www.robertpenner.com/easing_terms_of_use.html

//{@easing
(function() {

// --- header ----------------------------------------------

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
var fn,
    easing = {
        linear: "(c*t/d+b)", // linear(t, b, c, d,  q1, q1, q3, q4)
                             //     t:Number - current time (from 0)
                             //     b:Number - beginning value
                             //     c:Number - change in value(delta value), (end - begin)
                             //     d:Number - duration(unit: ms)
                             // q1~q4:Number - tmp arg
    // --- Quad ---
        inquad: "(q1=t/d,c*q1*q1+b)",
       outquad: "(q1=t/d,-c*q1*(q1-2)+b)",
     inoutquad: "(q1=t/(d*0.5),q1<1?c*0.5*q1*q1+b:-c*0.5*((--q1)*(q1-2)-1)+b)",
    // --- Cubic ---
       incubic: "(q1=t/d,c*q1*q1*q1+b)",
      outcubic: "(q1=t/d-1,c*(q1*q1*q1+1)+b)",
    inoutcubic: "(q1=t/(d*0.5),q1<1?c*0.5*q1*q1*q1+b:c*0.5*((q1-=2)*q1*q1+2)+b)",
    outincubic: "(q1=t*2,q2=c*0.5,t<d*0.5?(q3=q1/d-1,q2*(q3*q3*q3+1)+b)" +
                                        ":(q3=(q1-d)/d,q2*q3*q3*q3+b+q2))",
    // --- Quart ---
       inquart: "(q1=t/d,c*q1*q1*q1*q1+b)",
      outquart: "(q1=t/d-1,-c*(q1*q1*q1*q1-1)+b)",
    inoutquart: "(q1=t/(d*0.5),q1<1?c*0.5*q1*q1*q1*q1+b" +
                                  ":-c*0.5*((q1-=2)*q1*q1*q1-2)+b)",
    outinquart: "(q1=t*2,q2=c*0.5,t<d*0.5?(q3=q1/d-1,-q2*(q3*q3*q3*q3-1)+b)" +
                                        ":(q4=q1-d,q3=q4/d,q2*q3*q3*q3*q3+b+q2))",
    // --- Back ---
        inback: "(q1=t/d,q2=1.70158,c*q1*q1*((q2+1)*q1-q2)+b)",
       outback: "(q1=t/d-1,q2=1.70158,c*(q1*q1*((q2+1)*q1+q2)+1)+b)",
     inoutback: "(q1=t/(d*0.5),q2=1.525,q3=1.70158," +
                    "q1<1?(c*0.5*(q1*q1*(((q3*=q2)+1)*q1-q3))+b)" +
                        ":(c*0.5*((q1-=2)*q1*(((q3*=q2)+1)*q1+q3)+2)+b))",
     outinback: "(q1=t*2,q2=c*0.5," +
                    "t<d*0.5?(q3=q1/d-1,q4=1.70158,q2*(q3*q3*((q4+1)*q3+q4)+1)+b)" +
                           ":(q3=(q1-d)/d,q4=1.70158,q2*q3*q3*((q4+1)*q3-q4)+b+q2))",
    // --- Bounce ---
      inbounce: "(q1=(d-t)/d,q2=7.5625,q3=2.75,c-(q1<(1/q3)?(c*(q2*q1*q1)+0)" +
                ":(q1<(2/q3))?(c*(q2*(q1-=(1.5/q3))*q1+.75)+0):q1<(2.5/q3)" +
                "?(c*(q2*(q1-=(2.25/q3))*q1+.9375)+0)" +
                ":(c*(q2*(q1-=(2.625/q3))*q1+.984375)+0))+b)",
     outbounce: "(q1=t/d,q2=7.5625,q3=2.75,q1<(1/q3)?(c*(q2*q1*q1)+b)" +
                ":(q1<(2/q3))?(c*(q2*(q1-=(1.5/q3))*q1+.75)+b):q1<(2.5/q3)" +
                "?(c*(q2*(q1-=(2.25/q3))*q1+.9375)+b)" +
                ":(c*(q2*(q1-=(2.625/q3))*q1+.984375)+b))"
};

// --- export --------------------------------
for (fn in easing) {
    Math[fn] = new Function("t,b,c,d,q1,q2,q3,q4", "return " + easing[fn]);
    Math[fn].src = easing[fn];
}

})();
//}@easing

