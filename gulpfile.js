'use strict'

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const include = require('gulp-include');
const debug = require('gulp-debug');
const image = require('gulp-image');
const del = require('del');
const merge = require('merge-stream');


const config = {
    devUrl: 'relaxwecleanservices.local/php',
    src: './assets',
    dist: './dist',
};

// Concatinate and then uglify the js that are required in main.js
gulp.task('scripts', ['clean:scripts', 'uglify'], function() {
    return gulp.src([
            config.src + '/scripts/main.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(include({
            extensions: "js",
            hardFail: true,
            includePaths: ["node_modules", "assets/scripts"]
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.dist + '/scripts'))
        .pipe(browserSync.stream());
});

// Uglyfy js except for main.js
gulp.task('uglify', ['clean:scripts'], function() {
    return gulp.src([
            config.src + '/scripts/**/*',
            '!assets/scripts/main.js'
        ])
        .pipe(uglify())
        .pipe(gulp.dest(config.dist + '/scripts'))
        .pipe(browserSync.stream());
});

gulp.task('styles', ['clean:styles'], function() {
    var scssStream = gulp.src([config.src + '/sass/**/*.scss'])
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['./node_modules'],
        }).on('error', sass.logError))
        .pipe(concat('scss-files.scss'));

    var cssStream = gulp.src([config.src + '/css/**/*.css', './node_modules/flexslider/flexslider.css'])
        .pipe(concat('css-files.css'))

    var mergedStream = merge(scssStream, cssStream)
        .pipe(concat('main.css'))
        .pipe(cleanCSS({level: {1: {specialComments: 0}}}))
        .pipe(gulp.dest(config.dist + '/css'));
    return mergedStream;
});

gulp.task('images', ['clean:images'], function() {
    gulp.src(config.src + '/images/**/*')
        .pipe(image())
        .pipe(gulp.dest(config.dist + '/images'))
        .pipe(browserSync.stream());
});

gulp.task('fonts', ['clean:fonts'], function() {
    return gulp.src([
            config.src + '/fonts/**/*',
            './node_modules/bootstrap-sass/assets/fonts/bootstrap/*',
            './node_modules/font-awesome/fonts/fontawesome-webfont.*',
        ])
        .pipe(gulp.dest(config.dist + '/fonts'))
        .pipe(browserSync.stream());
});



// Clean
gulp.task('clean:styles', function() {
    return del(config.dist + '/css');
});

gulp.task('clean:scripts', function() {
    return del(config.dist + '/scripts');
});

gulp.task('clean:images', function() {
    return del(config.dist + '/images');
});

gulp.task('clean:fonts', function() {
    return del(config.dist + '/fonts');
});

gulp.task('build', ['scripts', 'uglify', 'styles', 'images']);

// compile fonts only if we run gulp
gulp.task('default', ['build', 'fonts']);


gulp.task('watch', ['build', 'fonts'], function() {
    browserSync.init({
        files: ['**/*.php', 'assets'],
        proxy: config.devUrl,
        snippetOptions: {
            whitelist: ['/wp-admin/admin-ajax.php'],
            blacklist: ['/wp-admin/**']
        }
    });

    gulp.watch(config.src + '/sass/**/*.scss', ['styles']);
    gulp.watch(config.src + '/css/**/*.css', ['styles']);
    gulp.watch(config.src + '/scripts/**/*.js', ['scripts']);
    gulp.watch(config.src + '/images/**/*', ['images']);
    gulp.watch(config.src + '/fonts/**/*', ['fonts']);
});