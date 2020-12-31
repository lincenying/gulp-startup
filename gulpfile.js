const gulp = require('gulp')

// css 相关
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const autoprefixer = require('autoprefixer')
const salad = require('postcss-salad')
const pxtorem = require('postcss-pxtorem')
const cleanCSS = require('gulp-clean-css')

// 服务相关
const connect = require('gulp-connect')
const proxy = require('http-proxy-middleware')

// js相关
const browserify = require('gulp-browserify')
const babel = require('gulp-babel')
const uglify = require('gulp-uglifyjs')

// html 相关
const pug = require('gulp-pug')

// 版本号
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const del = require('del')

// const cached = require('gulp-cached')

const browsers = ['> 1%', 'last 3 versions', 'not ie <= 8']

const basedir = 'scss/' // <= 修改该路径
const px2rem = false // <= 是否将单位 px 转成 rem [true | false]
const rootValue = 100 // 表示根元素的字体大小或根据输入参数返回根元素的字体大小
const port = 9091

const src = {
    root: basedir + 'src/',

    less: basedir + 'src/less/**/*.less',
    ex_less: '!' + basedir + 'src/less/**/_*.less',

    postcss: basedir + 'src/css/**/*.css',
    ex_postcss: '!' + basedir + 'src/css/**/_*.css',

    scss: basedir + 'src/scss/**/*.scss',
    ex_scss: '!' + basedir + 'src/scss/**/_*.scss',

    js: basedir + 'src/js/**/*.js',
    ex_js: '!' + basedir + 'src/js/**/_*.js',

    pug: basedir + 'src/pug/**/*.pug',
    html: basedir + 'src/**/*.html',
    assets: basedir + 'src/assets/**/*',
    rev_json: basedir + 'rev/**/*.json'
}

const dist = {
    root: basedir + 'dist/',
    css: basedir + 'dist/css/',
    js: basedir + 'dist/js/',
    assets: basedir + 'dist/assets/',
    html: basedir + 'dist/*.html'
}

const revs = {
    root: basedir + 'rev/',
    css: basedir + 'rev/css/',
    js: basedir + 'rev/js/'
}

const processors = [
    autoprefixer({
        browsers
    })
]
if (px2rem) {
    processors.push(
        pxtorem({
            rootValue,
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
            root: dist.root,
            port,
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
    const watcherLess = gulp.watch(src.less, gulp.series('compile_less'))
    watcherLess.on('change', function (path) {
        console.log(`File ${path} was changed`)
    })
    watcherLess.on('add', function (path) {
        console.log(`File ${path} was added`)
    })
    watcherLess.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
    })
    done()
})
// postcss 相关任务
gulp.task('auto_task_postcss', function (done) {
    const watcherPostcss = gulp.watch(src.postcss, gulp.series('compile_postcss'))
    watcherPostcss.on('change', function (path) {
        console.log(`File ${path} was changed`)
    })
    watcherPostcss.on('add', function (path) {
        console.log(`File ${path} was added`)
    })
    watcherPostcss.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
    })
    done()
})
// scss 相关任务
gulp.task('auto_task_scss', function (done) {
    const watcherScss = gulp.watch(src.scss, gulp.series('compile_scss'))
    watcherScss.on('change', function (path) {
        console.log(`File ${path} was changed`)
    })
    watcherScss.on('add', function (path) {
        console.log(`File ${path} was added`)
    })
    watcherScss.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
    })
    done()
})
// 其他 相关任务

const assetsFunc = done => {
    // return gulp.src([src.assets]).pipe(cached('assets')).pipe(gulp.dest(dist.assets))
    gulp.src([src.assets]).pipe(gulp.dest(dist.assets))
    done && done()
}
gulp.task('auto_task_other', function (done) {
    const watcherPug = gulp.watch(src.pug, gulp.series('compile_pug'))
    watcherPug.on('change', function (path) {
        console.log(`File ${path} was changed`)
    })
    watcherPug.on('add', function (path) {
        console.log(`File ${path} was added`)
    })
    watcherPug.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
    })

    const watcherJs = gulp.watch(src.js, gulp.series('compile_js'))
    watcherJs.on('change', function (path) {
        console.log(`File ${path} was changed`)
    })
    watcherJs.on('add', function (path) {
        console.log(`File ${path} was added`)
    })
    watcherJs.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
    })

    const watcherHtml = gulp.watch(src.html, gulp.series('copy_html'))
    watcherHtml.on('change', function (path) {
        console.log(`File ${path} was changed`)
    })
    watcherHtml.on('add', function (path) {
        console.log(`File ${path} was added`)
    })
    watcherHtml.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
    })

    const watcherAssets = gulp.watch(src.assets)
    watcherAssets.on('change', function (path) {
        console.log(`File ${path} was changed`)
        assetsFunc()
    })
    watcherAssets.on('add', function (path) {
        console.log(`File ${path} was added`)
        assetsFunc()
    })
    watcherAssets.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
        del([path.replace('/src/', '/dist/')])
    })

    done()
})

// 复制html文件
gulp.task('copy_html', done => {
    gulp.src([src.html]).pipe(gulp.dest(dist.root)).pipe(connect.reload())
    done()
})

// 编译pug文件
gulp.task('compile_pug', done => {
    gulp.src(src.pug).pipe(pug()).pipe(gulp.dest(src.root))
    done()
})

// 开发环境编译less文件
gulp.task('compile_less', done => {
    gulp.src([src.less, src.ex_less]).pipe(less()).pipe(postcss(processors)).pipe(gulp.dest(dist.css)).pipe(connect.reload())
    done()
})
// 生产环境编译less文件
gulp.task('prod_compile_less', done => {
    gulp.src([src.less, src.ex_less])
        .pipe(less())
        .pipe(postcss(processors))
        .pipe(gulp.dest(dist.css))
        .pipe(cleanCSS())
        .pipe(rev())
        .pipe(gulp.dest(dist.css))
        //CSS 生成文件 hash 编码并生成 rev-manifest.json 文件，里面定义了文件名对照映射
        .pipe(rev.manifest())
        .pipe(gulp.dest(revs.css))
    done()
})

// 开发环境编辑postcss文件
gulp.task('compile_postcss', done => {
    gulp.src([src.postcss, src.ex_postcss])
        .pipe(postcss([salad({ browsers })]))
        .pipe(gulp.dest(dist.css))
        .pipe(connect.reload())
    done()
})
// 生产环境编辑postcss文件
gulp.task('prod_compile_postcss', done => {
    gulp.src([src.postcss, src.ex_postcss])
        .pipe(postcss([salad({ browsers })]))
        .pipe(gulp.dest(dist.css))
        .pipe(cleanCSS())
        .pipe(rev())
        .pipe(gulp.dest(dist.css))
        //CSS 生成文件 hash 编码并生成 rev-manifest.json 文件，里面定义了文件名对照映射
        .pipe(rev.manifest())
        .pipe(gulp.dest(revs.css))
    done()
})

// 开发环境编译scss文件
gulp.task('compile_scss', done => {
    gulp.src([src.scss, src.ex_scss]).pipe(sass()).pipe(postcss(processors)).pipe(gulp.dest(dist.css)).pipe(connect.reload())
    done()
})
// 生产环境编译scss文件
gulp.task('prod_compile_scss', done => {
    gulp.src([src.scss, src.ex_scss])
        .pipe(sass())
        .pipe(postcss(processors))
        .pipe(gulp.dest(dist.css))
        .pipe(cleanCSS())
        .pipe(rev())
        .pipe(gulp.dest(dist.css))
        //CSS 生成文件 hash 编码并生成 rev-manifest.json 文件，里面定义了文件名对照映射
        .pipe(rev.manifest())
        .pipe(gulp.dest(revs.css))
    done()
})

// 开发环境编译js文件
gulp.task('compile_js', done => {
    gulp.src([src.js, src.ex_js])
        .pipe(
            browserify({
                insertGlobals: true,
                debug: true
            })
        )
        .pipe(gulp.dest(dist.js))
        .pipe(connect.reload())
    done()
})
// 生产环境编译js文件
gulp.task('prod_compile_js', done => {
    gulp.src([src.js, src.ex_js])
        .pipe(
            babel({
                presets: ['@babel/preset-env']
            })
        )
        .pipe(
            browserify({
                insertGlobals: true,
                debug: true
            })
        )
        .pipe(
            babel({
                presets: ['@babel/preset-env']
            })
        )
        .pipe(gulp.dest(dist.js))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(dist.js))
        .pipe(rev.manifest())
        .pipe(gulp.dest(revs.js))

    done()
})

// 清理所有编译后的文件
gulp.task('clean', async done => {
    await del([dist.css, dist.js, dist.assets, dist.html])
    done()
})

// 复制文件
gulp.task('copy_assets', assetsFunc)
gulp.task('watch_assets', assetsFunc)

// 开发环境
gulp.task(
    'start_less',
    gulp.series(
        'clean',
        'compile_pug',
        'compile_less',
        'compile_js',
        'copy_html',
        'copy_assets',
        gulp.parallel('auto_server', 'auto_task_less', 'auto_task_other')
    )
)
gulp.task(
    'start_postcss',
    gulp.series(
        'clean',
        'compile_pug',
        'compile_postcss',
        'compile_js',
        'copy_html',
        'copy_assets',
        gulp.parallel('auto_server', 'auto_task_postcss', 'auto_task_other')
    )
)
gulp.task(
    'start_scss',
    gulp.series(
        'clean',
        'compile_pug',
        'compile_scss',
        'compile_js',
        'copy_html',
        'copy_assets',
        gulp.parallel('auto_server', 'auto_task_scss', 'auto_task_other')
    )
)

// 生产环境
gulp.task('build_less', gulp.series('clean', 'compile_pug', 'prod_compile_less', 'prod_compile_js', 'copy_assets'))
gulp.task('build_postcss', gulp.series('clean', 'compile_pug', 'prod_compile_postcss', 'prod_compile_js', 'copy_assets'))
gulp.task('build_scss', gulp.series('clean', 'compile_pug', 'prod_compile_scss', 'prod_compile_js', 'copy_assets'))

//生产环境 Html替换css、js文件版本
gulp.task('compile_html', done => {
    gulp.src([src.rev_json, src.html])
        .pipe(
            revCollector({
                replaceReved: true
            })
        )
        .pipe(gulp.dest(dist.root))
    done()
})
