var scene = new Scene();
scene.load({
	"test1" : {
		0 : {"t1":"1px", transform:{"t2": "30deg"}, "c1":"rgba(0, 0, 0, 0)","c2":"#F4E2B2","c3":"HSL(44, 75%, 82.7%)", "t4":"1,2,3","t5":"1 2 3 4", border:"4px solid #000000"},
		1 : {"t1":"5px", transform:{"t2": "40deg"}, "c1":"rgba(40, 80, 120, 1)", border:"10px solid #f50520"},
	},
	"test2" : {
		0 : {"t1":"1px", transform:{"t2": "30deg"}, "c1":"rgba(0, 0, 0, 0)"},
		1 : {"t1":"5px", transform:{"t2": "40deg"}, "c1":"rgba(0, 0, 0, 0)"},
	},
});
QUnit.test( "Scene.Util.splitUnit", function( assert ) {
	assert.deepEqual(Scene.Util.splitUnit("10px"), {value:10, unit:"px"});
	assert.deepEqual(Scene.Util.splitUnit("-10px"), {value:-10, unit:"px"});
	assert.deepEqual(Scene.Util.splitUnit("1.25em"), {value:1.25, unit:"em"});	
	assert.deepEqual(Scene.Util.splitUnit("1.2345712222223e-8deg"), {value:1.2345712222223e-8, unit:"deg"});		
	assert.deepEqual(Scene.Util.splitUnit("1.2345"), {value:1.2345, unit:""});		
});
QUnit.test( "Scene.Util.toColorObject", function( assert ) {
	var a = Scene.Util.toColorObject("#abc");
	assert.deepEqual(a.value, [170, 187, 204, 1]);
	assert.deepEqual(a.type, "color");
	assert.deepEqual(a.model, "rgba");
	
	var b = Scene.Util.toColorObject("hsl(240, 50%, 10%)");
	assert.deepEqual(b.value, [13, 13, 38, 1]);
	assert.deepEqual(b.type, "color");
	assert.deepEqual(b.model, "rgba");
	
	var c = Scene.Util.toColorObject("hsla(240, 50%, 10%, 0.5)");
	assert.deepEqual(c.value, [13, 13, 38, 0.5]);
	assert.deepEqual(c.type, "color");
	assert.deepEqual(c.model, "rgba");
	
	var d = Scene.Util.toColorObject("#aabbccaa");
	assert.deepEqual(d.value, [170, 187, 204, 170/255]);
});

QUnit.test( "Scene.Util.toBracketObject", function( assert ) {
	assert.deepEqual(Scene.Util.toBracketObject("#abc"), "#abc");
	assert.deepEqual(Scene.Util.toBracketObject("a(a,b,c)").value, ["a","b","c"]);
	var a = Scene.Util.toBracketObject("a(a(a,b,c))");
	assert.equal(a.model, "a", "inner & inner");
	assert.deepEqual(a.value[0].value, ["a","b","c"]);
});


QUnit.test( "Scene Util Color Test", function( assert ) {

	var color = Scene.Util.stringToObject("linear-gradient(360deg, rgb(0,0,0) 0%, #1fc8db 51%, #2cb5e8 75%)")
	assert.equal(color.model, "linear-gradient");
	assert.equal(color.value[0], "360deg");
	assert.equal(color.value[1].value[0].model, "rgba");
	assert.deepEqual(color.value[1].value[0].value, [0, 0, 0, 1]);
	assert.equal(color.value[1].value[1], "0%");
	assert.equal(color.value[2].value[1], "51%");
	assert.equal(color.value[3].value[1], "75%");


	var color = Scene.Util.stringToObject("10px solid #000")
	assert.equal(color.value[0], "10px");
	assert.equal(color.value[1], "solid");
	assert.deepEqual(color.value[2].value, [0, 0, 0, 1]);



	var color = Scene.Util.stringToObject("10px   solid rgb(0, 0, 0)")
	assert.equal(color.value[0], "10px");
	assert.equal(color.value[1], "solid");
	assert.deepEqual(color.value[2].value, [0, 0, 0, 1]);

	var color = Scene.Util.stringToObject("rgba(20, 40, 50, 0.5) solid rgb(0, 0, 0)")
	assert.deepEqual(color.value[0].value, [20, 40, 50, 0.5]);
	assert.equal(color.value[1], "solid");
	assert.deepEqual(color.value[2].value, [0, 0, 0, 1]);

});
QUnit.test( "Scene Util dot Test", function( assert ) {
	var item1 = scene.getItem("test1");
	var nf1 = item1.getNowFrame(0.5);
	var c1 = nf1.getProperty("c1");
	var t1 = nf1.getTransform("t2");
	var p1 = nf1.getProperty("t1");
	var border = nf1.getProperty("border");
	
	assert.deepEqual(c1.value, {"0":20, "1":40, "2":60, "3":0.5}, "dot color array");
	assert.equal(p1, "3px", "property value + unit");
	assert.equal(t1, "35deg", "transform value + unit");
	assert.equal(border.value[0], "7px", "border property double seperator 1");
	assert.equal(border.value[1], "solid", "border property double seperator 2");
	assert.deepEqual(border.value[2].value, {"0":122,"1":2,"2":16,"3":1}, "border property double seperator 3");
	
});