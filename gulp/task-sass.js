/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){ 
    var sass = require('gulp-sass');
    var rename = require('gulp-rename');
    var autoprefixer = require('gulp-autoprefixer');

    var args = require('yargs').argv;
    
    var input = `./online/Tripwire.Web/Content/${args.fileName}.scss`;
    
    var output = './online/Tripwire.Web/Content/';

    var sassExpandedOptions = {
        errLogToConsole: true,
        outputStyle: 'expanded'
    };

    var sassMinifiedOptions = {
        errLogToConsole: true,
        outputStyle: 'compressed'
    }

    gulp.task('sass-expanded', function () {
        return gulp
            .src(input)
            .pipe(sass(sassExpandedOptions).on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(gulp.dest(output));
        });

    gulp.task('sass-minified', function () {
    return gulp
        .src(input)        
        .pipe(sass(sassMinifiedOptions).on('error', sass.logError))        
        .pipe(autoprefixer())
        .pipe(rename(`${args.fileName}.min.css`))
        .pipe(gulp.dest(output));
    });

    gulp.task('sass', ['sass-expanded', 'sass-minified']);
};