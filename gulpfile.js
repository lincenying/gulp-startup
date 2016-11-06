/* eslint-disable */

var gulp = require('gulp'),
    less = require('gulp-less'),
    connect = require('gulp-connect'),
    postcss = require('gulp-postcss'),
    browserslist = require('browserslist'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    salad = require('postcss-salad')

var basedir = 'postcss/',
    browsers = browserslist('last 2 version, > 0.1%'),
    autoprefix = new LessPluginAutoPrefix({
        browsers: browsers
    })

gulp.task('start_less', ['auto_server', 'auto_task_less'])
gulp.task('start_postcss', ['auto_server', 'auto_task_postcss'])

// 自动任务
gulp.task('auto_task_less', function() {
    gulp.watch(basedir + 'less/*.less', ['auto_less'])
    gulp.watch(basedir + '*.html', ['auto_refresh_from_html'])
    gulp.watch(basedir + 'css/*.css', ['auto_refresh_from_css'])
})
gulp.task('auto_task_postcss', function() {
    gulp.watch(basedir + 'original/*.css', ['auto_postcss'])
    gulp.watch(basedir + '*.html', ['auto_refresh_from_html'])
    gulp.watch(basedir + 'css/*.css', ['auto_refresh_from_css'])
})

// 编译less文件
gulp.task('auto_less', function() {
    gulp.src(basedir + 'less/*.less')
        .pipe(less({ plugins: [autoprefix] }))
        .pipe(gulp.dest(basedir + 'css/'))
})

// 编辑postcss文件
gulp.task('auto_postcss', function() {
    gulp.src(basedir + 'original/*.css')
        .pipe(postcss([
            salad({browsers: browsers})
        ]))
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
