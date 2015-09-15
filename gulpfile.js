var gulp           = require('gulp'),
    rename         = require('gulp-rename'),
    less           = require('gulp-less'),
    changed        = require('gulp-changed'),
    react          = require('gulp-react'),
    mainBowerFiles = require('main-bower-files'),
    del            = require('del');

var paths = {
  webpages: {
    src: ['./src/**/*.html', './src/**/*.php'],
    dest: './dist'
  },
  js: {
    src: './src/js/*.js',
    dest: './dist/js'
  },
  jsx: {
    src: './src/js/*.jsx',
    dest: './dist/js'
  },
  less: {
    src: './src/css/*.less',
    dest: './dist/css'
  },
  lib: {
    src: mainBowerFiles(),
    dest: './dist/lib'
  },
  fonts: {
    src: 'bower_components/semantic/src/themes/default/**',
    dest: './dist/lib'
  }
};

gulp.task('clean', function(callback) {
  del(['dist', '!dist/lib'], callback);
});

gulp.task('web-pages', function() {
  return gulp.src(paths.webpages.src, {base: './src'})
    .pipe(changed(paths.webpages.dest))
    .pipe(gulp.dest(paths.webpages.dest));
});

gulp.task('Javascript', function() {
  return gulp.src(paths.js.src)
    .pipe(changed(paths.js.dest))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('React', function() {
  return gulp.src(paths.jsx.src)
    .pipe(changed(paths.jsx.dest))
    .pipe(react())
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('Less', function() {
  return gulp.src(paths.less.src)
    .pipe(changed(paths.less.dest))
    .pipe(less())
    .pipe(gulp.dest(paths.less.dest));
});

gulp.task('libs', ['libs-fonts'], function() {
  return gulp.src(paths.lib.src)
    .pipe(changed(paths.lib.dest))
    .pipe(gulp.dest(paths.lib.dest));
});

gulp.task('libs-fonts', function() {
  return gulp.src(paths.fonts.src, { base: './bower_components/semantic/src' })
    .pipe(changed(paths.fonts.dest))
    .pipe(gulp.dest(paths.fonts.dest));
});

gulp.task('default', ['web-pages', 'Javascript', 'React', 'Less', 'libs', 'libs-fonts']);
