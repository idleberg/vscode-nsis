'use strict';

// Dependencies
import gulp from 'gulp';
import raster from 'gulp-raster-update';
import rename from 'gulp-rename';

const svgFiles = [
  'node_modules/@nsis/logo/src/Logo/below 48x48/outlines-light.svg'
];

// Convert SVG
gulp.task('default', (done) => {
  gulp.src(svgFiles)
    .pipe(raster())
    .pipe(rename('logo.png'))
    .pipe(gulp.dest('./images'));
  done();
});
