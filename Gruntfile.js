module.exports = function(grunt) {
grunt.loadNpmTasks('grunt-jsdoc');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');


grunt.initConfig({
	jsdoc : {
		dist : {
			src: ['./dest/Scene.js', "README.md"],
			options: {
				destination: 'doc',
				template: "node_modules/docdash"
			}
		}
	},
	concat : {
		dist : {
			src : [
				"./src/prefix.js",
				"./src/pre.js",
				"./src/Scene.js",
				"./src/constant.js",
				"./src/SceneItem.js",
				"./src/Frame.js",
				"./src/Curve.js",
				"./src/TimingFunction.js",
				"./src/PropertyObject.js",
				"./src/PropertyFunction.js",
				"./src/Util.js",
				"./src/Color.js",	
				"./src/CSSRole.js",	
				"./src/suffix.js",
			],
			dest : "./dest/Scene.js"
	    }
    },
    uglify: {
	    options: {
	    	mangle: false
	    },
	    my_target: {
	    	files: {
	        	'./dest/Scene.min.js': ['./dest/Scene.js']
	        }
	    }
	}
});


grunt.registerTask('default', ["concat", "uglify", "jsdoc"]);
grunt.registerTask('doc', ["jsdoc"]);

}