const gulp = require('gulp')

const {tasks} = require('dry-roads')

gulp.task('dist', () => {
	const source = [
			'./crossroads.js',
			'./defaults.js',
		],
		destination = 'dist'
	tasks.buildDist({
		source,
		destination
	})
})

gulp.task('lint', () => {
	const source = ['**/*.js','!node_modules/**', '!dist/**']
	tasks.lint({source})
})

gulp.task('publish', ['lint', 'dist'])
