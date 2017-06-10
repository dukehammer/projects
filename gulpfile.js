var gulp = require('gulp'),
	webserver = require('gulp-webserver');

var argv = require('yargs').argv;

gulp.task('webserver', function () {
	gulp.src(argv.file)
		.pipe(webserver({
			livereload: true,
			fallback: '*.html',
			port:8080,
			directoryListing:false,
			open: '/' + argv.file + '.html'
		}));
});