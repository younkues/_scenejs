var scene = new Scene();
test( "Scene Basic Test", function( assert ) {
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
});