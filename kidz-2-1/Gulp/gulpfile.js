'use strict';

var gulp         = require('gulp');
var sass         = require('gulp-sass');
var gutil        = require('gulp-util');
var jshint       = require('gulp-jshint');
var clean        = require('gulp-clean');
var sourcemaps   = require('gulp-sourcemaps');
var stylish      = require('jshint-stylish');
var plumber      = require('gulp-plumber');
var imagemin     = require('gulp-imagemin');
var fileinclude  = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
var gulpif       = require('gulp-if');
var rtlcss       = require('gulp-rtlcss');
var rename       = require("gulp-rename");
var argv         = require('minimist')(process.argv.slice(2));
var browserSync  = require('browser-sync').create();

var path         = {
    html         : 'src/*.html',
    htminc       : 'src/_inc/**/*.htm',
    incdir       : 'src/_inc/',
    plugins      : 'src/assets/plugins/**/*.*',
    js           : 'src/assets/js/*.*',
    scss         : 'src/assets/scss/**/*.scss',
    img          : 'src/assets/img/**/*.+(png|jpg|gif)'
};

var destination  = (argv.pub) ? 'build/publish/' : 'build/development/';

var assets       = destination + 'assets/';

var sourcemap    = (argv.pub) ? false : true;

var port         = (argv.pub) ? 8000 : 8080;


/* =====================================================
    CLEAN
    ===================================================== */

gulp.task('clean', function() {
  return gulp.src(destination, {read: false})
  .pipe(clean());
});


/* =====================================================
    HTML
    ===================================================== */

var html = function() {
  return gulp.src( path.html )
    .pipe(plumber())
    .pipe(fileinclude({ basepath: path.incdir }))
    .pipe(gulp.dest(destination))
    .pipe(browserSync.reload({
      stream: true
    }));
};

gulp.task('html', ['clean'], html);
gulp.task('html-watch', html);


/* =====================================================
    SCSS
    ===================================================== */

var scss = function() {
  var ignoreNotification = false;
  return gulp.src( path.scss )
    .pipe(plumber())
    // sourcemaps for Development
    .pipe(gulpif(sourcemap, sourcemaps.init()))
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulpif(sourcemap, sourcemaps.write('.')))
    .pipe(gulp.dest(assets + 'css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
};

gulp.task('scss', ['clean'], scss);
gulp.task('scss-watch', scss);


/* =====================================================
    RTL
    ===================================================== */

var rtl = function() {
  return gulp.src(assets + 'css/listty.css')
    .pipe(rtlcss())
    .pipe(rename({suffix: '.rtl'}))
    .pipe(gulp.dest(assets + 'css/'))
};

gulp.task('rtl', ['clean', 'scss'], rtl);
gulp.task('rtl-watch', rtl);


/* =====================================================
    JS
    ===================================================== */

var js = function() {
  return gulp.src( path.js )
    .pipe(plumber())
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', gutil.log)
    .pipe(gulp.dest(assets + 'js/'))
    .pipe(browserSync.reload({
      stream: true
    }));
};

gulp.task('js', ['clean'], js);
gulp.task('js-watch', js);


/* =====================================================
    IMAGE
    ===================================================== */

var image = function() {
  return gulp.src( path.img )
    .pipe(gulpif(argv.pub , imagemin({ progressive: true })))
    .pipe(gulp.dest(assets + 'img/'))
    .pipe(browserSync.reload({
      stream: true
    }));
};

gulp.task('img', ['clean'], image);
gulp.task('img-watch', image);


/* =====================================================
    PLUGINS
    ===================================================== */

var plugins = function() {
  return gulp.src( path.plugins )
    .pipe(gulp.dest(assets + 'plugins/'))
    .pipe(browserSync.reload({
      stream: true
    }));
};

gulp.task('plugins', ['clean'], plugins);
gulp.task('plugins-watch', plugins);


/* =====================================================
    BUILD
    ===================================================== */

gulp.task('build', [
  'html',
  'scss',
  'rtl',
  'js',
  'img',
  'plugins'
]);


/* =====================================================
    WATCH
    ===================================================== */

gulp.task('watch', ['build'], function() {
  gulp.watch( path.html, ['html-watch'] );
  gulp.watch( path.htminc, ['html-watch'] );
  gulp.watch( path.scss, ['scss-watch'] );
  gulp.watch( path.scss, ['rtl-watch'] );
  gulp.watch( path.js, ['js-watch'] );
  gulp.watch( path.img, ['img-watch'] );
  browserSync.init({
    server: {
      baseDir: destination
    },
    port: port
  });
});


/* =====================================================
    TASKS
    ===================================================== */

gulp.task('default', ['watch']);


/* =====================================================
    COMMANDS
    ===================================================== */

// gulp         : Development

// gulp --pub   : Publishable
