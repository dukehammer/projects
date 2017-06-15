var gulp = require('gulp'),
	webserver = require('gulp-webserver');

var file = require('yargs').argv.file;

console.log('file: ' + file);
console.log('src: ' + '.' + file.slice(file.lastIndexOf('/')) + '/');

gulp.task('webserver', function () {
	gulp.src('.' + file.slice(file.lastIndexOf('/')) + '/')
		.pipe(webserver({
			livereload: true,
			fallback: 'index.html',
			port:8080,
			directoryListing:false,
			open: true // '/' + argv.file + '.html'
		}));
});