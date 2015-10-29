"use strict";

// 1. config.rb,gulpfile.js,package.jsonをプロジェクトディレクトリのルートに配置
// 2. npm install
// 3. X╹◡╹)っ凵^

var srcPath ={
    css     :"css/**/*.css",
    scss    :"scss/**/*.scss",
    images  :"images/**/*.+(jpg|jpeg|png|gif|svg)",
    js      :"scss/**/*.js",
    html    :"*.html"
};

var gulp = require("gulp");
var sass = require("gulp-sass");                    //SASS
var autoprefixer = require("gulp-autoprefixer");    //ベンダープレフィックス付与
var frontnote = require("gulp-frontnote");          //スタイルガイド生成
var plumber = require("gulp-plumber");              //エラー対策
var imagemin = require('gulp-imagemin');            //画像圧縮
var ejs = require('gulp-ejs');                      //EJS
var cssmin = require('gulp-cssmin');                //CSS圧縮
var rename = require('gulp-rename');                //出力ファイル名変更
var runSequence = require('run-sequence');          //並列処理
var webserver = require('gulp-webserver');          //LIVERELOAD
var notify = require('gulp-notify');                //エラー通知


gulp.task("sass", function() {
    gulp.src(srcPath["scss"])
        .pipe(plumber({errorHandler: notify.onError('(X╹◡╹凸 [SASS ERROR] <%= error.message %>')}))
        .pipe(frontnote({
            css: '../css/style.css'
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest(srcPath.css));
});
gulp.task("imagemin",function(){
    gulp.src(srcPath["images"])
        .pipe(plumber({errorHandler: notify.onError('[IMAGEMIN ERROR] <%= error.message %>')}))
        .pipe(imagemin())
        .pipe(gulp.dest(srcPath.images));

});
gulp.task('cssmin', function () {
    gulp.src(srcPath.css)
        .pipe(plumber({errorHandler: notify.onError('[CSSMIN ERROR] <%= error.message %>')}))
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest("css/"));
});
gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      port: 8001,
      fallback: 'index.html',
      open: true
    }));
});
gulp.task("ejs", function() {
    gulp.src(
        ["*.ejs",'!' + "_*.ejs"]
    )
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(ejs())
        .pipe(gulp.dest("app/public"))
});

//DEFAULT
gulp.task("watch", function() {
    gulp.watch(srcPath.scss,["sass"]);
    gulp.watch(srcPath.css,["cssmin"]);
    gulp.watch(srcPath.imagemin,["imagemin"]);
});
gulp.task('default', ['webserver',"watch"]);
