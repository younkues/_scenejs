var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('combine-js', function () {
	return gulp.src([
	"./src/constant.js",
	"./src/pre.js",
	"./src/Scene.js",
	"./src/SceneItem.js",
	"./src/Frame.js",
	"./src/Curve.js",
	"./src/TimingFunction.js",
	"./src/PropertyObject.js",
	"./src/PropertyFunction.js",
	"./src/Util.js",
	"./src/Color.js",	
])
	.pipe(concat('Scene.all.js'))
	.pipe(gulp.dest('./'));
});
gulp.task('default', ['combine-js']);