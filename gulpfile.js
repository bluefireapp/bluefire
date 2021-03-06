var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
var prefix = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload');
var path = require('path');
var onError = function (err) {
    console.log(err);
    this.emit('end')
  };

gulp.task('less', function() {


    return gulp.src('app/less/main.less')  // only compile the entry file
        .pipe(plumber()).on('error', function (err) {
                console.log(err)
                this.emit('end');
         
        })
        .pipe(less()).on('error', function (err) {
                console.log(err)
                this.emit('end');
         
        })
        .pipe(prefix("last 8 version", "> 1%", "ie 8", "ie 7"), {cascade:true})
        .pipe(gulp.dest('app/dist/'))
        .pipe(livereload()).on('error', function (err) {
                console.log(err)
                this.emit('end');
         
        });


});

gulp.task('watch', function() {
    gulp.watch('app/less/**', ['less']);  // Watch all the .less files, then run the less task
});

gulp.task('default', ['watch']); // Default will run the 'entry' watch task
