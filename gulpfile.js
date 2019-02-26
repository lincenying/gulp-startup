/* eslint-disable */

var gulp = require('gulp'),
    less = require('gulp-less'),
    postcss = require('gulp-postcss'),
    //sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    browserslist = require('browserslist'),
    proxy = require('http-proxy-middleware'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefixer = require('autoprefixer'),
    salad = require('postcss-salad')

var basedir = 'less/', // <= 修改该路径
    browsers = browserslist('last 50 version, > 0.1%'),
    lessAutoprefix = new LessPluginAutoPrefix({
        browsers: browsers
    })

gulp.task('auto_server', function() {
    return new Promise(function(resolve) {
        connect.server({
            root: basedir,
            port: 9092,
            livereload: true,
            middleware: function(connect, opt) {
                return [
                    proxy('/base_api',  {
                        target: 'http://127.0.0.1:3000',
                        changeOrigin:true
                    }),
                    proxy('/shike_api', {
                        target: 'http://127.0.0.1:3000',
                        changeOrigin:true
                    })
                ]
            }
        })
        resolve()
    })
})

// 自动任务
// less 相关任务
gulp.task('auto_task_less', function(done) {
    gulp.watch(basedir + 'less/**/*.less', gulp.series('auto_less'))
    gulp.watch(basedir + '*.html', gulp.series('auto_refresh_from_html'))
    gulp.watch(basedir + 'css/*.css', gulp.series('auto_refresh_from_css'))
    done()
})
// postcss 相关任务
gulp.task('auto_task_postcss', function(done) {
    gulp.watch(basedir + 'original/**/*.css', gulp.series('auto_postcss'))
    gulp.watch(basedir + '*.html', gulp.series('auto_refresh_from_html'))
    gulp.watch(basedir + 'css/*.css', gulp.series('auto_refresh_from_css'))
    done()
})
// scss 相关任务
gulp.task('auto_task_scss', function(done) {
    gulp.watch(basedir + 'scss/**/*.scss', gulp.series('auto_scss'))
    gulp.watch(basedir + '*.html', gulp.series('auto_refresh_from_html'))
    gulp.watch(basedir + 'css/*.css', gulp.series('auto_refresh_from_css'))
    done()
})

// 编译less文件
gulp.task('auto_less', function() {
    return gulp.src([basedir + 'less/**/*.less', '!' + basedir + 'less/**/_*.less'])
        .pipe(less({ plugins: [lessAutoprefix] }))
        .pipe(gulp.dest(basedir + 'css/'))
})

// 编辑postcss文件
gulp.task('auto_postcss', function() {
    return gulp.src([basedir + 'original/**/*.css', '!' + basedir + 'original/**/_*.css'])
        .pipe(postcss([
            salad({browsers: browsers})
        ]))
        .pipe(gulp.dest(basedir + 'css/'))
})

// 编译scss文件
gulp.task('auto_scss', function() {
    return gulp.src([basedir + 'scss/**/*.scss', '!' + basedir + 'scss/**/_*.scss'])
        .pipe(sass())
        .pipe(autoprefixer(browsers))
        .pipe(gulp.dest(basedir + 'css/'))
})

gulp.task('auto_refresh_from_html', function() {
    return gulp.src(basedir + '*.html')
        .pipe(connect.reload())
})
gulp.task('auto_refresh_from_css', function() {
    return gulp.src(basedir + 'css/*.css')
        .pipe(connect.reload())
})

gulp.task('start_less', gulp.parallel('auto_server', 'auto_task_less'))
gulp.task('start_postcss', gulp.parallel('auto_server', 'auto_task_postcss'))
gulp.task('start_scss', gulp.parallel('auto_server', 'auto_task_scss'))