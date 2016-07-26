var scene = new Scene();
scene.load({
	"test1" : {
		0 : {"t1":"1px", transform:{"t2": "30deg"}, "c1":"rgba(0, 0, 0, 0)","c2":"#F4E2B2","c3":"HSL(44, 75%, 82.7%)", "t4":"1,2,3","t5":"1 2 3 4"},
		1 : {"t1":"5px", transform:{"t2": "40deg"}, "c1":"rgba(0, 0, 0, 0)"},
	},
	"test2" : {
		0 : {"t1":"1px", transform:{"t2": "30deg"}, "c1":"rgba(0, 0, 0, 0)"},
		1 : {"t1":"5px", transform:{"t2": "40deg"}, "c1":"rgba(0, 0, 0, 0)"},
	},
});
QUnit.test( "Scene Basic Test", function( assert ) {
	var item1 = scene.getItem("test1");
	assert.equal(item1.getProperty(0, "t1"), "1px", "getProperty value test1");
	assert.equal(item1.getProperty(1, "t1"), "5px", "getProperty value test2");
	assert.equal(item1.getProperty(1, "t1"), "5px", "getProperty value test2");
	assert.equal(item1.getTransform(0,"t2"),"30deg", "get Transform");	
	
	

	assert.deepEqual(item1.getProperty(0, "t4").value, ["1","2","3"], "string to Array");
	assert.deepEqual(item1.getProperty(0, "t5").value, ["1","2","3", "4"], "string to Array 2");
	assert.equal(item1.getProperty(0, "t5").separator, " ", "string to Array separator");
});
QUnit.test( "Scene Color Test", function( assert ) {
	var item1 = scene.getItem("test1");
	console.log(item1.getProperty(0, "c3"));
	assert.equal(item1.getProperty(1, "c1").type, "color", "Color Property Object type");
	assert.deepEqual(item1.getProperty(0, "c1").value, [0, 0, 0, 0] , "Color Property Object array");
	assert.deepEqual(item1.getProperty(0, "c2").value, [244, 226, 178, 1] , "hex to rgba");
	assert.deepEqual(item1.getProperty(0, "c3").value, [244, 226, 178, 1] , "hsl to rgba");

});
QUnit.test( "Scene Util dot Test", function( assert ) {

});