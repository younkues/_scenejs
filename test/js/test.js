var scene = new Scene();
scene.load({
	"test1" : {
		0 : {"t1":"1px", transform:{"t2": "30deg"}, "c1":"rgba(0, 0, 0, 0)","c2":"#F4E2B2","c3":"HSL(44, 75%, 82.7%)", "t4":"1,2,3","t5":"1 2 3 4", border:"4px solid #000000"},
		1 : {"t1":"5px", transform:{"t2": "40deg"}, border:"10px solid #f50520"},
        2 : {"t1":"7px", transform:{"t2": "40deg"}, "c1":"rgba(40, 80, 120, 1)", border:"10px solid #f50520"},
        3.4 : {"t1":"8px", transform:{"t2": "40deg"}, "c1":"rgba(40, 80, 120, 1)", border:"10px solid #f50520"},
        4.4 : {"t1":"5px", transform:{"t2": "40deg"}, "c1":"rgba(40, 80, 120, 1)", border:"10px solid #f50520"},
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
	assert.deepEqual(item1.getProperty(0, "c1").value, [0, 0, 0, 0] , "Color Property Object array");
	assert.deepEqual(item1.getProperty(0, "c2").value, [244, 226, 178, 1] , "hex to rgba");
	assert.deepEqual(item1.getProperty(0, "c3").value, [244, 226, 178, 1] , "hsl to rgba");
});

QUnit.test( "Scene getNowFrame", function( assert ) {
    var item1 = scene.getItem("test1");
	var nf1 = item1.getNowFrame(0);
    assert.equal(item1.getNowFrame(-1).getProperty("t1"), undefined);
	assert.equal(item1.getNowFrame(0).getProperty("t1"), "1px");
    assert.equal(item1.getNowFrame(0.5).getProperty("t1"), "3px");
    assert.equal(item1.getNowFrame(1).getProperty("t1"), "5px");
    assert.equal(item1.getNowFrame(1.5).getProperty("t1"), "6px");
    assert.equal(item1.getNowFrame(3.4).getProperty("t1"), "8px");
    assert.equal(item1.getNowFrame(10).getProperty("t1"), "5px");
    
    
    assert.equal(item1.getNowFrame(1).getProperty("c1").toValue(), "rgba(20,40,60,0.5)");
	
});