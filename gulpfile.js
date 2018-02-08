 // Dependencies
const gulp = require('gulp');
const raster = require('gulp-raster');
const rename = require('gulp-rename');

const svgFiles = [
  'node_modules/nsis-logo-v3/src/Logo/outlines-light.svg'
];

// Convert SVG
gulp.task('default',(done) => {
  gulp.src(svgFiles)
    .pipe(raster())
    .pipe(rename("logo.png"))
    .pipe(gulp.dest('./images'));
  done();
});
