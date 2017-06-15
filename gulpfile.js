var gulp = require('gulp'),
	webserver = require('gulp-webserver');

// var argv = require('yargs').argv;
var file = require('yargs').argv.file;

console.log('file: ' + file);
console.log('src: ' + '.' + file.slice(file.lastIndexOf('/')) + '/' + 'index.html');

gulp.task('webserver', function () {
	gulp.src('.')
		.pipe(webserver({
			livereload: true,
			fallback: 'index.html',
			port: 8080,
			host: '0.0.0.0',
			directoryListing:false,
			open: '.' + file.slice(file.lastIndexOf('/')) + '/' + 'index.html' // true
		}));
});