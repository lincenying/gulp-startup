/* eslint-disable */

var gulp = require('gulp'),
    less = require('gulp-less'),
    postcss = require('gulp-postcss'),
    sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    browserslist = require('browserslist'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefixer = require('autoprefixer'),
    salad = require('postcss-salad')

var basedir = 'less/', // <= 修改该路径
    browsers = browserslist('last 50 version, > 0.1%'),
    lessAutoprefix = new LessPluginAutoPrefix({
        browsers: browsers
    })

gulp.task('start_less', ['auto_server', 'auto_task_less'])
gulp.task('start_postcss', ['auto_server', 'auto_task_postcss'])
gulp.task('start_scss', ['auto_server', 'auto_task_scss'])

// 自动任务
// less 相关任务
gulp.task('auto_task_less', function() {
    gulp.watch(basedir + 'less/**/*.less', ['auto_less'])
    gulp.watch(basedir + '*.html', ['auto_refresh_from_html'])
    gulp.watch(basedir + 'css/*.css', ['auto_refresh_from_css'])
})
// postcss 相关任务
gulp.task('auto_task_postcss', function() {
    gulp.watch(basedir + 'original/*.css', ['auto_postcss'])
    gulp.watch(basedir + '*.html', ['auto_refresh_from_html'])
    gulp.watch(basedir + 'css/*.css', ['auto_refresh_from_css'])
})
// scss 相关任务
gulp.task('auto_task_scss', function() {
    gulp.watch(basedir + 'scss/*.scss', ['auto_scss'])
    gulp.watch(basedir + '*.html', ['auto_refresh_from_html'])
    gulp.watch(basedir + 'css/*.css', ['auto_refresh_from_css'])
})

// 编译less文件
gulp.task('auto_less', function() {
    gulp.src([basedir + 'less/*.less', '!' + basedir + 'less/_*.less'])
        .pipe(less({ plugins: [lessAutoprefix] }))
        .pipe(gulp.dest(basedir + 'css/'))
})

// 编辑postcss文件
gulp.task('auto_postcss', function() {
    gulp.src([basedir + 'original/*.css', '!' + basedir + 'original/_*.css'])
        .pipe(postcss([
            salad({browsers: browsers})
        ]))
        .pipe(gulp.dest(basedir + 'css/'))
})

// 编译scss文件
gulp.task('auto_scss', function() {
    gulp.src([basedir + 'scss/*.scss', '!' + basedir + 'scss/*.scss'])
        .pipe(sass())
        .pipe(autoprefixer(browsers))
        .pipe(gulp.dest(basedir + 'css/'))
})

gulp.task('auto_server', function() {
    connect.server({
        root: basedir,
        port: 9092,
        livereload: true
    })
})
gulp.task('auto_refresh_from_html', function() {
    gulp.src(basedir + '*.html')
        .pipe(connect.reload())
})
gulp.task('auto_refresh_from_css', function() {
    gulp.src(basedir + 'css/*.css')
        .pipe(connect.reload())
})
