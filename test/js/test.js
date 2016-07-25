var scene = new Scene();
QUnit.test( "Scene Basic Test", function( assert ) {
	scene.load({
		"test1" : {
			0 : {"t1":"1px", transform:{"t2": "30deg"}, "t3":"rgba(0, 0, 0, 0)"},
			1 : {"t1":"5px", transform:{"t2": "40deg"}, "t3":"rgba(0, 0, 0, 0)"},
		},
		"test2" : {
			0 : {"t1":"1px", transform:{"t2": "30deg"}, "t3":"rgba(0, 0, 0, 0)"},
			1 : {"t1":"5px", transform:{"t2": "40deg"}, "t3":"rgba(0, 0, 0, 0)"},
		},
	});
	
	assert.equal(scene.getItem("test1").getProperty(0, "t1"), "1px", "getProperty value test1");
	assert.equal(scene.getItem("test1").getProperty(1, "t1"), "5px", "getProperty value test2");
	assert.equal(scene.getItem("test1").getProperty(1, "t3").type, "color", "Color Property Object");
});