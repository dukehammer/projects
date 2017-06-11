var gulp = require('gulp'),
	webserver = require('gulp-webserver');

var argv = require('yargs').argv;

console.info('file: ' + argv.file);

gulp.task('webserver', function () {
	gulp.src('.')
		.pipe(webserver({
			livereload: true,
			fallback: 'index.html',
			port:8080,
			directoryListing:false,
			open: true // '/' + argv.file + '.html'
		}));
});