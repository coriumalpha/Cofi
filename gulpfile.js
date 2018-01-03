var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var gulpBundleFiles = require('gulp-bundle-files');
var bundles     = require('./bundle-options.json');

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'www/scss/*.scss'])
        .pipe(sass())
        .pipe(gulp.dest("www/css"))
        .pipe(browserSync.stream());
});

// Move the javascript files into our /src/js folder
gulp.task('js', function() {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js',
                     'node_modules/jquery/dist/jquery.min.js',
                     'node_modules/tether/dist/js/tether.min.js',
                     'node_modules/popper.js/dist/umd/popper.min.js'])
        .pipe(gulp.dest("www/js"))
        .pipe(browserSync.stream());
});

//Bundle js files into combined.js file
gulp.task('bundle', function() {
    gulpBundleFiles(bundles);
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./www"  
    });

    gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'www/scss/*.scss'], ['sass']);
    gulp.watch('dist/js/*.js', ['bundle']);
    gulp.watch("www/*.html").on('change', browserSync.reload);
});

gulp.task('default', ['js','serve', 'bundle']);
