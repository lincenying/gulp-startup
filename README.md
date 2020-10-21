# gulp-startup

切图必备, 自动编译less/postcss/scss, 自动添加css3前缀, h5模式时, 自动将px转成rem, 自动刷新浏览器

```bash
# 安装依赖
npm install  or  yarn

# less 模式
npm run less  or  yarn less

### 或者

gulp start_less

# scss 模式
npm run scss  or  yarn scss

### 或者

gulp start_scss

# postcss-salad 模式

npm run postcss  or  yarn postcss

### 或者

gulp start_postcss
```

打开 http://localhost:9092

自己建立切图文件夹后, 记得修改`gulpfile.js`的`basedir` 和 `siteType`

siteType = h5 时:
会将px单位自动转成rem, 默认比例100, 即设计稿宽度为750px, 书写时, css只需要写成设计稿的真实尺寸即可
