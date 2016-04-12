var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('combine-js', function () {
	return gulp.src([
	"constant.js",
	"pre.js",
	"Scene.js",
	"SceneItem.js",
	"Frame.js",
	"Curve.js",
	"TimingFunction.js",
	"PropertyObject.js",
	"PropertyFunction.js",
	"Util.js",
	"Color.js",	
])
	.pipe(concat('Scene.all.js'))
	.pipe(gulp.dest('./'));
});
gulp.task('default', ['combine-js']);