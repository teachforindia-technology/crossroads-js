const gulp = require('gulp')

gulp.task('lint', () => {
	const eslint = require('gulp-eslint')
	return gulp.src(['**/*.js','!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
})