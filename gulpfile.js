const gulp = require('gulp')

// css 相关
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')
const cleanCSS = require('gulp-clean-css')

// 服务相关
const connect = require('gulp-connect')
const proxy = require('http-proxy-middleware')

// js相关
const browserify = require('gulp-browserify')
const uglify = require('gulp-minify')

// html 相关
const pug = require('gulp-pug')
// 版本号
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const del = require('del')
const replace = require('gulp-replace')

const wait = require('gulp-wait')
const shell = require('gulp-shell')

const basedir = 'less/' // <= 修改该路径
const px2rem = true // <= 是否将单位 px 转成 rem [true | false]
const rootValue = 100 // <= 表示根元素的字体大小或根据输入参数返回根元素的字体大小
const port = 9091 // <= 访问端口
const openTailwind = true // <= 是否开启Tailwind [true | false]

const src = {
    root: basedir + 'src/',

    less: basedir + 'src/less/*.less',
    in_less: basedir + 'src/less/**/*.less',
    ex_less: ['!' + basedir + 'src/less/*/*.less', '!' + basedir + 'src/less/**/_*.less'],

    tailwind: basedir + 'src/tailwind/tailwind.css',

    scss: basedir + 'src/scss/*.scss',
    in_scss: basedir + 'src/scss/**/*.scss',
    ex_scss: ['!' + basedir + 'src/scss/*/*.scss', '!' + basedir + 'src/scss/**/_*.scss'],

    js: basedir + 'src/js/*.js',
    in_js: basedir + 'src/js/**/*.js',
    ex_js: ['!' + basedir + 'src/js/*/*.js', '!' + basedir + 'src/js/**/_*.js'],

    pug: basedir + 'src/pug/*.pug',
    in_pug: basedir + 'src/pug/**/*.pug',
    ex_pug: ['!' + basedir + 'src/pug/*/*.pug', '!' + basedir + 'src/pug/**/_*.pug'],

    html: basedir + 'src/*.html',
    in_html: basedir + 'src/**/*.html',

    assets: basedir + 'src/assets/**/*',
    rev_json: basedir + 'rev/**/*.json'
}

const dev = {
    root: basedir + 'dev/',
    css: basedir + 'dev/css/',
    js: basedir + 'dev/js/',
    assets: basedir + 'dev/assets/',
    html: basedir + 'dev/*.html'
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

// const processors = [require('postcss-import'), require('tailwindcss'), require('postcss-nested'), autoprefixer()]
const processors = [autoprefixer()]
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
            root: dev.root,
            port,
            livereload: {
                port: 35730
            },
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
// =========================================
// ========== less 相关任务 =================
// =========================================
const lessTask = async path => {
    console.log(path)
    await new Promise(resolve => {
        gulp.src(path)
            .pipe(wait(200))
            .pipe(less())
            .pipe(postcss(processors))
            .pipe(gulp.dest(dev.css))
            .pipe(connect.reload())
            .on('end', function () {
                console.log('watch_compile_less_end')
                resolve()
            })
    })
}
const getLessFile = path => {
    path = path.replace(/\\/g, '/')
    let file = path.replace(basedir + 'src/less/', '').split('/')[0]
    if (file.indexOf('.') > -1) {
        file = file.split('.')[0]
    }
    // 这里可以设置全局文件夹, 如果变动的文件属于全局文件夹下, 那么重新编译所有入口文件
    // 文件以_开头, 也重新编译所有入口文件
    if (['global'].includes(file) || file.indexOf('_') > -1) {
        lessTask([src.less, ...src.ex_less])
    } else {
        lessTask(basedir + 'src/less/' + file + '.less')
    }
}
gulp.task('auto_task_less', function (done) {
    const watcherLess = gulp.watch(src.in_less)
    watcherLess.on('change', function (path) {
        console.log(`File ${path} was changed`)
        getLessFile(path)
    })
    watcherLess.on('add', function (path) {
        console.log(`File ${path} was added`)
        getLessFile(path)
    })
    watcherLess.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
        getLessFile(path)
    })
    done()
})
// 开发环境编译less文件
gulp.task('compile_less', async () => {
    await lessTask([src.less, ...src.ex_less])
})
// 生产环境编译less文件
gulp.task('prod_compile_less', async () => {
    await new Promise(resolve => {
        gulp.src([src.less, ...src.ex_less])
            .pipe(less())
            .pipe(postcss(processors))
            .pipe(gulp.dest(dist.css))
            .pipe(cleanCSS())
            .pipe(rev())
            .pipe(gulp.dest(dist.css))
            //CSS 生成文件 hash 编码并生成 rev-manifest.json 文件，里面定义了文件名对照映射
            .pipe(rev.manifest())
            .pipe(gulp.dest(revs.css))
            .on('end', function () {
                console.log('prod_compile_less_end')
                resolve()
            })
    })
})

// =========================================
// ========== scss 相关任务 =================
// =========================================
const scssTask = async path => {
    console.log(path)
    await new Promise(resolve => {
        gulp.src(path)
            .pipe(wait(200))
            .pipe(sass().on('error', sass.logError))
            .pipe(postcss(processors))
            .pipe(gulp.dest(dev.css))
            .pipe(connect.reload())
            .on('end', function () {
                console.log('watch_compile_scss_end')
                resolve()
            })
    })
}

const getScssFile = path => {
    let file
    path = path.replace(/\\/g, '/')
    file = path.replace(basedir + 'src/scss/', '').split('/')[0]

    if (file.indexOf('.') > -1) {
        file = file.split('.')[0]
    }
    // 这里可以设置全局文件夹, 如果变动的文件属于全局文件夹下, 那么重新编译所有入口文件
    // 文件以_开头, 也重新编译所有入口文件
    if (['global'].includes(file) || file.indexOf('_') > -1) {
        scssTask([src.scss, ...src.ex_scss])
    } else {
        scssTask([basedir + 'src/scss/' + file + '.scss', ...src.ex_scss])
    }
}
// 生产环境编译scss文件
const prodCompileScss = async (path, revFile) => {
    await new Promise(resolve => {
        gulp.src(path)
            .pipe(sass().on('error', sass.logError))
            .pipe(postcss(processors))
            .pipe(gulp.dest(dist.css))
            .pipe(cleanCSS())
            .pipe(rev())
            .pipe(gulp.dest(dist.css))
            //CSS 生成文件 hash 编码并生成 rev-manifest.json 文件，里面定义了文件名对照映射
            .pipe(rev.manifest(revFile))
            .pipe(gulp.dest(revs.css))
            .on('end', resolve)
    })
}
gulp.task('auto_task_scss', function (done) {
    const watcherScss = gulp.watch(src.in_scss)
    watcherScss.on('change', function (path) {
        console.log(`File ${path} was changed`)
        getScssFile(path)
    })
    watcherScss.on('add', function (path) {
        console.log(`File ${path} was added`)
        getScssFile(path)
    })
    watcherScss.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
        getScssFile(path)
    })

    done()
})
// 开发环境编译scss文件
gulp.task('compile_scss', async () => {
    await scssTask([src.scss, ...src.ex_scss])
})
// 生产环境编译scss文件
gulp.task('prod_compile_scss', async () => {
    await prodCompileScss([src.scss, ...src.ex_scss], 'rev-manifest.json')
})

const compileTailwindSheel = async () => {
    if (openTailwind) {
        await new Promise(resolve => {
            gulp.src([src.tailwind])
                .pipe(wait(200))
                .pipe(shell(["npx windicss './" + src.in_html + "' -to " + src.tailwind]))
                .on('end', function () {
                    console.log('compile_tailwind_end')
                    resolve()
                })
        })
    }
}

const compileTailwind = async () => {
    if (openTailwind) {
        await compileTailwindSheel()
        await scssTask([src.tailwind])
    }
}
// 开发环境编译tailwind文件
gulp.task('compile_tailwind', async () => {
    if (openTailwind) await compileTailwind()
    else {
        console.log('compile_tailwind_is_close')
    }
})
// 生产环境编译tailwind文件
gulp.task('prod_compile_tailwind', async () => {
    if (openTailwind) {
        await compileTailwindSheel()
        await prodCompileScss([src.tailwind], 'manifest.json')
    } else {
        console.log('compile_tailwind_is_close')
    }
})

// =========================================
// ========== js 相关任务 ===================
// =========================================
const jsTask = async path => {
    await new Promise(resolve => {
        gulp.src(path)
            .pipe(wait(200))
            .pipe(
                browserify({
                    insertGlobals: true,
                    debug: true,
                    transform: ['babelify']
                })
            )
            .pipe(gulp.dest(dev.js))
            .pipe(connect.reload())
            .on('end', function () {
                console.log('watch_compile_js_end')
                resolve()
            })
    })
}

const getJsFile = path => {
    path = path.replace(/\\/g, '/')
    let file = path.replace(basedir + 'src/js/', '').split('/')[0]
    if (file.indexOf('.') > -1) {
        file = file.split('.')[0]
    }
    // 这里可以设置全局文件夹, 如果变动的文件属于全局文件夹下, 那么重新编译所有入口文件
    // 文件以_开头, 也重新编译所有入口文件
    if (['components', 'utils'].includes(file) || file.indexOf('_') > -1) {
        jsTask([src.js, ...src.ex_js])
    } else {
        jsTask([basedir + 'src/js/' + file + '.js', ...src.ex_js])
    }
}
// 开发环境编译js文件
gulp.task('compile_js', async () => {
    await jsTask([src.js, ...src.ex_js])
})
// 生产环境编译js文件
gulp.task('prod_compile_js', async () => {
    await new Promise(resolve => {
        gulp.src([src.js, ...src.ex_js])
            .pipe(
                browserify({
                    insertGlobals: true,
                    debug: true,
                    transform: ['babelify']
                })
            )
            .pipe(
                uglify({
                    ext: {
                        src: '-debug.js',
                        min: '.js'
                    }
                })
            )
            .pipe(rev())
            .pipe(gulp.dest(dist.js))
            .pipe(rev.manifest())
            .pipe(gulp.dest(revs.js))
            .on('end', resolve)
    })
})

// 其他 相关任务
const assetsFunc = done => {
    // return gulp.src([src.assets]).pipe(cached('assets')).pipe(gulp.dest(dist.assets))
    gulp.src([src.assets]).pipe(gulp.dest(dev.assets))
    done && done()
}
const prodAssetsFunc = done => {
    // return gulp.src([src.assets]).pipe(cached('assets')).pipe(gulp.dest(dist.assets))
    gulp.src([src.assets]).pipe(gulp.dest(dist.assets))
    done && done()
}

// 复制html文件
const copyHtml = async path => {
    path = path ? [path.replace(/\\/g, '/')] : [src.html]
    await new Promise(resolve => {
        const tmp = gulp.src(path).pipe(gulp.dest(dev.root))
        if (path) {
            tmp.pipe(connect.reload())
        }
        tmp.on('end', function () {
            resolve()
        })
    })
}

gulp.task('auto_task_other', function (done) {
    const watcherJs = gulp.watch(src.in_js)
    watcherJs.on('change', function (path) {
        console.log(`File ${path} was changed`)
        getJsFile(path)
    })
    watcherJs.on('add', function (path) {
        console.log(`File ${path} was added`)
        getJsFile(path)
    })
    watcherJs.on('unlink', function (path) {
        console.log(`File ${path} was removed`)
        getJsFile(path)
    })

    const watcherHtml = gulp.watch(src.in_html)
    watcherHtml.on('change', async function (path) {
        await compileTailwind()
        await copyHtml(path)
        console.log(`File ${path} was changed`)
    })
    watcherHtml.on('add', async function (path) {
        await compileTailwind()
        await copyHtml(path)
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
        del([path.replace('/src/', '/dev/')])
    })

    done()
})

gulp.task('copy_html', async () => {
    await copyHtml()
})

// 编译pug文件
gulp.task('compile_pug', done => {
    gulp.src([src.pug, ...src.ex_pug])
        .pipe(pug())
        .pipe(gulp.dest(src.root))
    done()
})

// 清理所有编译后的文件
gulp.task('clean', async done => {
    await del([dev.css, dev.js, dev.assets, dev.html])
    done()
})
gulp.task('prod_clean', async done => {
    await del([dist.css, dist.js, dist.assets, dist.html])
    done()
})

// 复制文件
gulp.task('copy_assets', assetsFunc)
gulp.task('prod_copy_assets', prodAssetsFunc)
gulp.task('watch_assets', assetsFunc)

// 开发环境
gulp.task(
    'start_less',
    gulp.series(
        'clean',
        'compile_pug',
        'compile_less',
        'compile_tailwind',
        'compile_js',
        'copy_html',
        'copy_assets',
        gulp.parallel('auto_server', 'auto_task_less', 'auto_task_other')
    )
)

gulp.task(
    'start_scss',
    gulp.series(
        'clean',
        'compile_pug',
        'compile_scss',
        'compile_tailwind',
        'compile_js',
        'copy_html',
        'copy_assets',
        gulp.parallel('auto_server', 'auto_task_scss', 'auto_task_other')
    )
)

// 生产环境
gulp.task('build_less', gulp.series('prod_clean', 'compile_pug', 'prod_compile_less', 'prod_compile_tailwind', 'prod_compile_js', 'prod_copy_assets'))
gulp.task('build_scss', gulp.series('prod_clean', 'compile_pug', 'prod_compile_scss', 'prod_compile_tailwind', 'prod_compile_js', 'prod_copy_assets'))

//生产环境 Html替换css、js文件版本
gulp.task('compile_html', done => {
    gulp.src([src.rev_json, src.html])
        .pipe(
            revCollector({
                replaceReved: true
            })
        )
        .pipe(replace('vue.js', 'vue.min.js'))
        .pipe(gulp.dest(dist.root))
    done()
})
