var scene2 = Scene.Timeline({
    0: {
        "right-femur": {
            transform: "rotate(30deg)"
        },
        "right-joint": {
            transform: {rotate:"-8deg"},
        },
        "left-femur": {
            transform: "rotate(-20deg)"
        },
        "left-joint": {
            transform: "rotate(0deg)"
        }
    },
    1: {
        "right-femur": {
            transform: "rotate(30deg)"
        },
        "right-joint": {
            transform: {rotate:"-0deg"},
        },
        "left-femur": {
            transform: "rotate(-15deg)"
        },
        "left-joint": {
            transform: "rotate(-4deg)"
        }                
    },
    2: {
        "right-femur": {
            transform: "rotate(-20deg)"
        },
        "right-joint": {
            transform: {rotate:"-4deg"},
        },
        "left-femur": {
            transform: "rotate(30deg)"
        },
        "left-joint": {
            transform: "rotate(0deg)"
        }                
    }
}).copyFrame(1, 3).copyFrame(0, 4)


QUnit.test( "Scene", function( assert ) {
	assert.equal(scene2.getItem("left-femur").getFrame(2).getTransform("rotate"), "30deg");
	assert.equal(scene2.getItem("left-femur").getFrame(3).getTransform("rotate"), scene2.getItem("left-femur").getFrame(1).getTransform("rotate"));
})