# gulp-startup

切图及活动页必备, 自动编译less/postcss/scss, 自动添加css3前缀, h5模式时, 自动将px转成rem, 自动刷新浏览器, 支持将es6变成es5

在`src/scss|less`文件夹中, 入口文件正常命名, 其他被`import`的文件, 以下划线开头
src
    scss
        main.scss
        _plugin.scss
        _module.scss
那么编译后, dist/css文件夹里只有main.css文件

在`src/js`文件夹中, 入口文件正常命名, 其他被`require`的文件, 以下划线开头, 如:
src
    js
        main.js
        _plugin.js
        _module.js
那么编译后, dist/js文件夹里只有main.js文件

src/assets 文件夹为静态资源文件夹, 如第三方插件, 字体文件, 和图片这类不需要经常改动的文件, 该文件夹会全部复制到dist文件夹下

```bash
# 安装依赖
npm install  or  yarn

# less 模式
# 开发模式
npm run less  or  yarn less
# 生成模式
npm run build_less  or  yarn build_less

# scss 模式
# 开发模式
npm run scss  or  yarn scss
# 生成模式
npm run build_scss  or  yarn build_scss

# postcss-salad 模式
# 开发模式
npm run postcss  or  yarn postcss
# 生成模式
npm run build_postcss  or  yarn build_postcss

```

打开 http://localhost:9091

自己建立切图文件夹后, 记得修改`gulpfile.js`的`basedir` 和 `px2rem`

basedir: 相对当前项目根目录的相对地址

px2rem = true 时:
会将px单位自动转成rem, 默认比例100(可以自行根据需求修改`rootValue`的值), 即设计稿宽度为750px, 书写时, css只需要写成设计稿的真实尺寸即可
