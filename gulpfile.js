gulp.src('public/src/js/*.js')
	.pipe(stripDebug())
	.pipe(uglify())
	.pipe(concat('script.js'))
	.pipe(gulp.dest('public/dist/js'));