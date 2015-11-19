"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");                    //SASS
var autoprefixer = require("gulp-autoprefixer");    //ベンダープレフィックス付与
var frontnote = require("gulp-frontnote");          //スタイルガイド生成
var plumber = require("gulp-plumber");              //エラー対策
var imagemin = require('gulp-imagemin');            //画像圧縮
var ejs = require('gulp-ejs');                      //EJS
var cssmin = require('gulp-cssmin');                //CSS圧縮
var uglify = require('gulp-uglify');                //JS圧縮
var rename = require('gulp-rename');                //出力ファイル名変更
var runSequence = require('run-sequence');          //並列処理
var webserver = require('gulp-webserver');          //LIVERELOAD
var notify = require('gulp-notify');                //エラー通知
var uncss = require('gulp-uncss');                  //使用されていないセレクタを削除

//パス設定
var path ={
    css:{
        dir :"css/",
        src :"css/**/*.css",
        dist:"dist/css/"
    },
    scss:{
        dir :"scss/",
        src :"scss/**/*.scss",
        dist:"css/"
    },
    image:{
        dir :"images/",
        src :"images/**/*.+(jpg|jpeg|png|gif|svg)",
        dist:"dist/images/"
    },
    js:{
        dir :"js/",
        src :"js/**/*.js",
        dist:"dist/js/"
    },
};

//タスク
gulp.task("sass", function() {
    gulp.src(path.scss.src)
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [SASS ERROR] <%= error.message %>')}))
        .pipe(frontnote({
            css: '../css/style.css'
        }))
    .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest(path.scss.dist));
});
gulp.task("imagemin",function(){
    gulp.src(path.image.src)
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [IMAGEMIN ERROR] <%= error.message %>')}))
        .pipe(imagemin())
        .pipe(gulp.dest(path.image.dist));

});
gulp.task('cssmin', function () {
    gulp.src(path.css.src)
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [CSSMIN ERROR] <%= error.message %>')}))
        .pipe(cssmin())
        .pipe(gulp.dest(path.css.dist));
});
gulp.task('uglify', function(){
    gulp.src(path.js.src)
        .pipe(plumber({errorHandler: notify.onError('[UGLIFY ERROR] <%= error.message %>')}))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(gulp.dest(path.js.dist));
});
gulp.task('webserver', function() {
    gulp.src('./')
        .pipe(webserver({
            livereload: true,
            port: 8001,
            fsrcback: 'index.html',
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
        .pipe(gulp.dest(path.css.src));
});

//監視タスク
gulp.task("watch", function() {
    gulp.watch(path.scss.src,function(){
        gulp.start("sass");
    });
    gulp.watch(path.css.src,function(){
        gulp.start("cssmin");
    });
    gulp.watch(path.js.src,function(){
        gulp.start("uglify");
    });
    //gulp.watch(path.image.src,["imagemin"]);
});
gulp.task("default", [
        "webserver",
        "watch",
        "sass",
        "cssmin",
        "uglify",
        "imagemin"
]);
