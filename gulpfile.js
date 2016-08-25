/* eslint-disable */

var gulp = require('gulp'),
    less = require('gulp-less'),
    connect = require('gulp-connect')

var basedir = '20160708/'

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix = new LessPluginAutoPrefix({
        browsers: [
            'ie >= 8',
            'ie_mob >= 10',
            'ff >= 26',
            'chrome >= 30',
            'safari >= 7',
            'ios >= 7',
            'android >= 2.3'
        ]
    })
gulp.task('start', ['auto_server', 'auto_task'])

// 自动任务
gulp.task('auto_task', function() {
    gulp.watch(basedir + 'less/*.less', ['auto_less'])
    gulp.watch(basedir + '*.html', ['auto_refresh_from_html'])
    gulp.watch(basedir + 'css/*.css', ['auto_refresh_from_css'])
})

gulp.task('auto_less', function() {
    gulp.src(basedir + 'less/style.less')
        .pipe(less({ plugins: [autoprefix] }))
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
