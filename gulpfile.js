'use strict';
// Generated on 2014-03-04 using generator-gulp-webapp 0.0.4

var gulp    = require('gulp');
var wiredep = require('wiredep').stream;

var aws = {
    "key": "AKIAISM3LPVRAGN67KRA",
    "secret": "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",
    "bucket": "waynecheah",
    "region": "ap-southeast-1",
    "distributionId": "EYZMQQ64L1R3R"
};

// Load plugins
var $ = require('gulp-load-plugins')();


// Scripts
gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        //.pipe($.jshint('.jshintrc'))
        //.pipe($.jshint.reporter('default'))
        .pipe($.size());
});

// HTML
gulp.task('html', function () {
    return gulp.src('app/*.html')
      .pipe($.useref())
      .pipe($.htmlmin({ collapseWhitespace: true , removeComments: true, collapseBooleanAttributes: true, removeRedundantAttributes: true, removeOptionalTags: true }))
      .pipe(gulp.dest('dist'))
      .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Revisioning
gulp.task('rev', function () {
    return gulp.src('dist/**')
        .pipe($.revAll({ ignore: ['_s3/*', '.DS_Store', 'empty', '404.html', 'index.html'] }))
//        .pipe(gulp.dest('dist/_s3'));
        .pipe($.gzip())
        .pipe($.s3(aws, {
            gzippedOnly: true,
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' },
            uploadPath: '/_v2/'
        }))
        .pipe($.cloudfront(aws));
});

// Clean
gulp.task('clean', function () {
    return gulp.src('dist', { read: false }).pipe($.rimraf());
});

// Bundle
gulp.task('bundle', ['scripts'], $.bundle('./app/*.html'));

// Copy
gulp.task('copy', function(){
    gulp.src('./app/fonts/**', { base:'./app' })
      .pipe(gulp.dest('dist'));

    return gulp.src(['./app/.htaccess', './app/*.ico', './app/*.txt'])
      .pipe(gulp.dest('dist'));
});

// Build
gulp.task('build', ['html', 'bundle', 'images', 'copy'], function(){
    gulp.start('rev');
});

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', $.connect.server({
    root: ['app'],
    port: 9000,
    livereload: true
}));

// Inject Bower components
gulp.task('wiredep', function () {
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/bower_components/'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/'
        }))
        .pipe(gulp.dest('app'));
});

// Watch
gulp.task('watch', ['connect'], function () {
    // Watch for changes in `app` folder
    gulp.watch([
        'app/*.html',
        
        'app/scripts/**/*.js',
        'app/images/**/*'
    ], function(event) {
        return gulp.src(event.path)
            .pipe($.connect.reload());
    });
    

    // Watch .js files
    gulp.watch('app/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('app/images/**/*', ['images']);

    // Watch bower files
    gulp.watch('app/bower_components/*', ['wiredep']);
});
