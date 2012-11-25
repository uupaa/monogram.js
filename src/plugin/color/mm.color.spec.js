//{@spec
(function() {

'mm.color(mm.color()).toString()'.test('"rgba(0,0,0,1)"');
'mm.color(mm.color().array).toString()'.test('"rgba(0,0,0,1)"');
'mm.color({ r:0,g:0,b:0,a:1 }).toString()'.test('"rgba(0,0,0,1)"');
'mm.color({ h:0,s:0,l:0,a:1 }).toString()'.test('"rgba(0,0,0,1)"');
'mm.color({ h:0,s:0,v:0,a:1 }).toString()'.test('"rgba(0,0,0,1)"');
'mm.color("black").toString()'.test('"rgba(0,0,0,1)"');
'mm.color("#000").toString()'.test('"rgba(0,0,0,1)"');
'mm.color("#000000").toString()'.test('"rgba(0,0,0,1)"');
'mm.color("#ffffffff").toString()'.test('"rgba(255,255,255,1)"');
'mm.color("rgba(0,0,0,1)").toString()'.test('"rgba(0,0,0,1)"');
'mm.color("hsla(360,2%,2%,1)").toString()'.test('"rgba(5,5,5,1)"');
// [TODO]
//  'mm.color("hsva(360,2%,2%,1)").toString()'.test('"rgba(255,255,255,1)"');
'mm.color([255, 255, 255]).toString()'.test('"rgba(255,255,255,1)"');
'mm.color([255, 255, 255, 0.5]).toString()'.test('"rgba(255,255,255,0.5)"');
'mm.color(0xffeedd).toString()'.    test('"rgba(255,238,221,1)"');
'mm.color("white").floatArray()'.   test('[1,1,1,1]');
'mm.color("gray").floatArray()'.    test('[0.5,0.5,0.5,1]');
'mm.color("black").floatArray()'.   test('[0,0,0,1]');
'mm.color("red").floatArray()'.     test('[1,0,0,1]');
'mm.color("blue").floatArray()'.    test('[0,0,1,1]');
'mm.color("lime").floatArray(true)'.test('[0,1,0]');

"run".test("color.js");
})();
//}@spec
