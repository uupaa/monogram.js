// logic.matrix2d.js

//{@matrix2d
(function(global) {

// --- header ----------------------------------------------
function Matrix2D() { // @help: Env
                      // @desc:
}
Matrix2D.name = "Matrix2D";
Matrix2D.identify  = identify;  // identify():Matrix2DArray - [1,0,0, 0,1,0, 0,0,1]
Matrix2D.scale     = scale;     // scale(x:Number, y:Number, m:Matrix2DArray):Matrix2DArray
Matrix2D.rotate    = rotate;    // rotate(angle:Number, m:Matrix2DArray):Matrix2DArray
Matrix2D.multiply  = multiply;  // multiply(ma:Matrix2DArray, mb:Matrix2DArray):Matrix2DArray
Matrix2D.translate = translate; // translate(x:Number, y:Number, m:Matrix2DArray):Matrix2DArray
Matrix2D.transform = transform; // transform(m11:Number, m12:Number, m21:Number,
                                //           m22:Number,  dx:Number,  dy:Number,
                                //           m:Matrix2DArray):Matrix2DArray
//
// Type:
//  Matrix2DArray = [m11, m12, m13,     [1, 0, 0,     [m[0], m[1], m[2],
//                   m21, m22, m23,      0, 1, 0,      m[3], m[4], m[5],
//                   m31, m32, m33]      x, y, 1]      m[6], m[7], m[8]]
//

// --- library scope vars ----------------------------------

// --- implement -------------------------------------------
function identify() { // @ret Matrix2DArray: [1,0,0, 0,1,0, 0,0,1]
                      // @help: Matrix2D.identify
                      // @desc: create 2D Matrix identify

    // [m11(x),  m12,     m13
    //  m21,     m22(y),  m23
    //  m31(dx), m32(dy), m33]
    return [1, 0, 0,
            0, 1, 0,
            0, 0, 1];
}

function multiply(ma,   // @arg Matrix2DArray: matrix A
                  mb) { // @arg Matrix2DArray: matrix B
                        // @ret Matrix2DArray: A x B
                        // @help: Matrix2D.multiply
                        // @desc: 2D Matrix multiply
    // [m11,     m12,     m13
    //  m21,     m22,     m23
    //  m31(dx), m32(dy), m33]
    return [ma[0] * mb[0] + ma[1] * mb[3] + ma[2] * mb[6],
            ma[0] * mb[1] + ma[1] * mb[4] + ma[2] * mb[7],
            0,
            ma[3] * mb[0] + ma[4] * mb[3] + ma[5] * mb[6],
            ma[3] * mb[1] + ma[4] * mb[4] + ma[5] * mb[7],
            0,
            ma[6] * mb[0] + ma[7] * mb[3] + ma[8] * mb[6],
            ma[6] * mb[1] + ma[7] * mb[4] + ma[8] * mb[7],
            ma[6] * mb[2] + ma[7] * mb[5] + ma[8] * mb[8]];
}

function scale(x,   // @arg Number: scale x
               y,   // @arg Number: scale y
               m) { // @arg Matrix2DArray: matrix
                    // @ret Matrix2DArray:
                    // @help: Matrix2D.scale
                    // @desc: 2D Matrix scaleing
    // [x, 0, 0,
    //  0, y, 0,
    //  0, 0, 1]
    return [x * m[0], x * m[1],    0,
            y * m[3], y * m[4],    0,
                m[6],     m[7], m[8]];
}

function rotate(angle, // @arg Number: radian
                m) {   // @arg Matrix2DArray: matrix
                       // @ret Matrix2DArray:
                       // @help: Matrix2D.rotate
                       // @desc: 2D Matrix multiply x rotate
    var c = Math.cos(angle),
        s = Math.sin(angle);

    // [ c, s, 0,
    //  -s, c, 0,
    //   0, 0, 1]
    return [ c * m[0] + s * m[3],  c * m[1] + s * m[4], 0,
            -s * m[0] + c * m[3], -s * m[1] + c * m[4], 0,
                            m[6],                 m[7], m[8]];
}

function transform(m11, // @arg Number:
                   m12, // @arg Number:
                   m21, // @arg Number:
                   m22, // @arg Number:
                   dx,  // @arg Number:
                   dy,  // @arg Number:
                   m) { // @arg Matrix2DArray: matrix
                        // @ret Matrix2DArray:
                        // @help: Matrix2D.transform
                        // @desc: 2D Matrix multiply x transform
    // [m11, m12, 0,
    //  m21, m22, 0,
    //   dx,  dy, 1]
    return [m11 * m[0] + m12 * m[3], m11 * m[1] + m12 * m[4], 0,
            m21 * m[0] + m22 * m[3], m21 * m[1] + m22 * m[4], 0,
             dx * m[0] +  dy * m[3] + m[6],
             dx * m[1] +  dy * m[4] + m[7],
             dx * m[2] +  dy * m[5] + m[8]];
}

function translate(x,   // @arg Number:
                   y,   // @arg Number:
                   m) { // @arg Matrix2DArray: matrix
                        // @ret Matrix2DArray:
                        // @help: Matrix2D.translate
                        // @desc: 2D Matrix multiply x translate
    // [1, 0, 0,
    //  0, 1, 0,
    //  x, y, 1]
    return [m[0], m[1], 0,
            m[3], m[4], 0,
            x * m[0] + y * m[3] + m[6],
            x * m[1] + y * m[4] + m[7],
            x * m[2] + y * m[5] + m[8]];
}

// --- build -----------------------------------------------

// --- export ----------------------------------------------
if (typeof module !== "undefined") { // is modular
    module.exports = { Matrix2D: Matrix2D };
}
global.Monogram || (global.Monogram = {});
global.Monogram.Matrix2D = Matrix2D;

})(this.self || global);
//}@matrix2d
