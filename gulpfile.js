/**
 * @author chenqi14
 */
var gulp = require('gulp'),
    sass = require('gulp-sass');

// 检测改动
gulp.task('watch', function () {
    gulp.watch(['src/**/*.scss'], ['compileSass']);
    gulp.watch(['src/**/*.js'], ['packJS']);
});
// 打包JS
gulp.task('packJS', function () {
    return gulp.src('src/**/*.js')
        .pipe(gulp.dest('app/public/index/'));
});

//编译src目录下的所有less、css文件
gulp.task('compileSass', function () {
    gulp.src(['src/**/*.scss', 'src/**/*.css', '!src/**/*.min.css'])
        .pipe(sass())
        .pipe(gulp.dest('app/public/index/'));
    gulp.src('src/**/*.min.css')
        .pipe(gulp.dest('app/public/index/'));
});

gulp.task('default', ['watch', 'compileSass', 'packJS']);
