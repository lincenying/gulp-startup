const gulp = require('gulp')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const connect = require('gulp-connect')
const proxy = require('http-proxy-middleware')
// const LessPluginAutoPrefix = require('less-plugin-autoprefix')
const autoprefixer = require('autoprefixer')
const salad = require('postcss-salad')
const pxtorem = require('postcss-pxtorem')

const browsers = ['> 1%', 'last 3 versions', 'not ie <= 8']

const basedir = 'less/' // <= 修改该路径
const siteType = 'h5' // <= 网站类型:  h5 或者  web

const processors = [
    autoprefixer({
        browsers
    })
]
if (siteType === 'h5') {
    processors.push(
        pxtorem({
            rootValue: 100,
            unitPrecision: 6, // 转换后的精度，即小数点位数
            propList: ['*'], // 指定可以转换的css属性，*代表全部css属性
            selectorBlackList: ['van-circle__layer'], // 指定不转换为视窗单位的类名
            mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
            minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
            exclude: [/node_modules/] // 设置忽略文件，用正则做目录名匹配
        })
    )
}

gulp.task('auto_server', function () {
    return new Promise(function (resolve) {
        connect.server({
            root: basedir,
            port: 9092,
            livereload: true,
            // eslint-disable-next-line no-unused-vars
            middleware(connect, opt) {
                return [
                    proxy.createProxyMiddleware('/base_api', {
                        target: 'http://127.0.0.1:3000',
                        changeOrigin: true
                    }),
                    proxy.createProxyMiddleware('/shike_api', {
                        target: 'http://127.0.0.1:3000',
                        changeOrigin: true
                    })
                ]
            }
        })
        resolve()
    })
})

// 自动任务
// less 相关任务
gulp.task('auto_task_less', function (done) {
    gulp.watch(basedir + 'less/**/*.less', gulp.series('auto_less'))
    gulp.watch(basedir + '*.html', gulp.series('auto_refresh_from_html'))
    gulp.watch(basedir + 'css/*.css', gulp.series('auto_refresh_from_css'))
    done()
})
// postcss 相关任务
gulp.task('auto_task_postcss', function (done) {
    gulp.watch(basedir + 'original/**/*.css', gulp.series('auto_postcss'))
    gulp.watch(basedir + '*.html', gulp.series('auto_refresh_from_html'))
    gulp.watch(basedir + 'css/*.css', gulp.series('auto_refresh_from_css'))
    done()
})
// scss 相关任务
gulp.task('auto_task_scss', function (done) {
    gulp.watch(basedir + 'scss/**/*.scss', gulp.series('auto_scss'))
    gulp.watch(basedir + '*.html', gulp.series('auto_refresh_from_html'))
    gulp.watch(basedir + 'css/*.css', gulp.series('auto_refresh_from_css'))
    done()
})

// 编译less文件
gulp.task('auto_less', function () {
    return gulp
        .src([basedir + 'less/**/*.less', '!' + basedir + 'less/**/_*.less'])
        .pipe(less())
        .pipe(postcss(processors))
        .pipe(gulp.dest(basedir + 'css/'))
})

// 编辑postcss文件
gulp.task('auto_postcss', function () {
    return gulp
        .src([basedir + 'original/**/*.css', '!' + basedir + 'original/**/_*.css'])
        .pipe(postcss([salad({ browsers })]))
        .pipe(gulp.dest(basedir + 'css/'))
})

// 编译scss文件
gulp.task('auto_scss', function () {
    return gulp
        .src([basedir + 'scss/**/*.scss', '!' + basedir + 'scss/**/_*.scss'])
        .pipe(sass())
        .pipe(postcss(processors))
        .pipe(gulp.dest(basedir + 'css/'))
})

gulp.task('auto_refresh_from_html', function () {
    return gulp.src(basedir + '*.html').pipe(connect.reload())
})
gulp.task('auto_refresh_from_css', function () {
    return gulp.src(basedir + 'css/*.css').pipe(connect.reload())
})

gulp.task('start_less', gulp.parallel('auto_server', 'auto_task_less'))
gulp.task('start_scss', gulp.parallel('auto_server', 'auto_task_scss'))
gulp.task('start_postcss', gulp.parallel('auto_server', 'auto_task_postcss'))
