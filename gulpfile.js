var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('combine-js', function () {
	return gulp.src([
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
])
	.pipe(concat('Scene.js'))
	.pipe(gulp.dest('./'));
});
gulp.task('default', ['combine-js']);