"use strict";

var srcPath ={
    css     :"css/**/*.css",
    css2    :"css/*.css",
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
var uncss = require('gulp-uncss');                  //使用されていないセレクタを削除

gulp.task("sass", function() {
    gulp.src(srcPath["scss"])
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [SASS ERROR] <%= error.message %>')}))
        .pipe(frontnote({
            css: '../css/style.css'
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest("css/"));
});
gulp.task("imagemin",function(){
    gulp.src(srcPath["images"])
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [IMAGEMIN ERROR] <%= error.message %>')}))
        .pipe(imagemin())
        .pipe(gulp.dest(srcPath.images));

});
gulp.task('cssmin', function () {
    gulp.src(srcPath.css2)
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [CSSMIN ERROR] <%= error.message %>')}))
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest("css/dist/"));
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
        .pipe(gulp.dest("app/public"));
});

gulp.task('uncss', function () {
    return gulp.src('css/*.css')
        .pipe(uncss({
            html: ['./*.html', 'second/*.html'], //URL指定の可能
            ignore: ['.reset','',/^\.*__*/, /^\.is\-/, /^\.bx*/]//IGNORE:正規表現も可能
        }))
        .pipe(gulp.dest('./uncss'));
});


//DEFAULT
gulp.task("watch", function() {
    gulp.watch(srcPath.scss,["sass"]);
    gulp.watch(srcPath.css,["cssmin"]);
    gulp.watch(srcPath.imagemin,["imagemin"]);
});
gulp.task('default', ['webserver',"watch"]);
