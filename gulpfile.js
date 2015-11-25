"use strict";
/*------------------------------------------------------------
 * require
 -----------------------------------------------------------*/
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
var uncss = require('gulp-uncss');                  //使用されているセレクタのみを生成
var prettify = require('gulp-prettify')             //HTML整形
var minifyHTML = require('gulp-minify-html');       //HTML圧縮 & HTML Inline圧縮
var minifyInline = require('gulp-minify-inline');   //HTML Inline圧縮
var ftp = require('gulp-ftp');                      //FTPへデプロイ
var gutil = require('gulp-util');

/*------------------------------------------------------------
 * PATH設定
 -----------------------------------------------------------*/
//FTP(for Private repository)
var ftpInfo ={
    host        :"",
    user        :"",
    pass        :"",
    remotePath  :"",
    uploadPath  :"",
};

//各ファイルPATH設定
var path ={
    css:{
        dir  :"css/",
        src  :"css/**/*.css",
        watch:"css/**/*.css",
        dist :"dist/css/"
    },
    scss:{
        dir  :"scss/",
        src  :"scss/**/*.scss",
        watch:"scss/**/*.scss",
        dist :"css/"
    },
    image:{
        dir  :"images/",
        src  :"images/**/*.+(jpg|jpeg|png|gif|svg)",
        watch:"images/**/*.+(jpg|jpeg|png|gif|svg)",
        dist :"dist/images/"
    },
    js:{
        dir  :["js/","!node_modules/"],
        src  :["js/**/*.js","!node_modules/"],
        watch:["js/**/*.js","!node_modules/"],
        dist :"dist/js/"
    },
    ejs:{
        src  :[
            "*.ejs",
            "./second/**/*.ejs",
            "!**/_*.ejs",
        ],
        watch:[
            "*.ejs",
            "second/**/*.ejs",
            "!**/_*.ejs",
        ],
        dist :"dist/",
    },
    html:{
        src  :[
            "./*.html",
            "second/**/*.html",
            "!dist/",
            "!node_modules/"
        ],
        watch:[
            "**/*.html",
            "!dist/",
            "!node_modules/"
        ],
        dist :"dist/"
    }
};


/*------------------------------------------------------------
 * TASKS
 -----------------------------------------------------------*/
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
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [UGLIFY ERROR] <%= error.message %>')}))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(gulp.dest(path.js.dist));
});
gulp.task('webserver', function() {
    gulp.src(path.html.dist)
        .pipe(webserver({
            livereload: true,
            port: 8001,
            fsrcback: 'index.html',
            open: true
        }));
});
gulp.task("ejs", function() {
    gulp.src(path.ejs.src)
        .pipe(plumber({errorHandler: notify.onError('(;◡;) [EJS ERROR]<%= error.message %>')}))
        .pipe(ejs())
        .pipe(gulp.dest(path.ejs.dist));
});
gulp.task('uncss', function () {
    return gulp.src('css/*.css')
                          .pipe(uncss({
                          html: ['./*.html', 'second/*.html'], //URL指定の可能
                          ignore: ['.reset','',/^\.*__*/, /^\.is\-/, /^\.bx*/]//IGNORE:正規表現も可能
    }))
        .pipe(rename({
            extname: '.un.css'
        }))
        .pipe(gulp.dest(path.css.src));
});
gulp.task('prettify', function() {
    gulp.src(path.html.src)
        .pipe(prettify({indent_size: 4}))
        .pipe(gulp.dest(path.html.dist));
});
gulp.task('minify-html', function() {
    var opts = {
        conditionals: true,
        spare:true
    };
    return gulp.src(path.html.dist+"**/*.html")
        .pipe(minifyHTML(opts))
        .pipe(minifyInline())
        .pipe(gulp.dest(path.html.dist));
});
gulp.task('minify-inline', function() {
    gulp.src(path.html.dist+"**/*.html")
        .pipe(minifyInline())
        .pipe(gulp.dest(path.html.dist));
});
gulp.task('ftp', function () {
    return gulp.src(ftpInfo.uploadPath)
        .pipe(ftp({
            host        : ftpInfo.host,
            user        : ftpInfo.user,
            pass        : ftpInfo.pass,
            remotePath  : ftpInfo.remotePath
        }))
    // you need to have some kind of stream after gulp-ftp to make sure it's flushed
    // this can be a gulp plugin, gulp.dest, or any kind of stream
    // here we use a passthrough stream
    .pipe(gutil.noop());
});

/*------------------------------------------------------------
 * WATCH TASKS
 -----------------------------------------------------------*/
gulp.task("watch", function() {
    gulp.watch(path.scss.watch,function(){
        gulp.start("sass");
    });
    gulp.watch(path.css.watch,function(){
        gulp.start("cssmin");
    });
    gulp.watch(path.js.watch,function(){
        gulp.start("uglify");
    });
    /*
       gulp.watch(path.html.watch,function(){
       gulp.start("minify-html");
       });
       */
    gulp.watch(path.ejs.watch,function(){
        gulp.start("ejs");
    });
    //gulp.watch(path.image.src,["imagemin"]);
});
gulp.task("default", [
        "watch",
        "sass",
        "cssmin",
        "uglify",
        "ejs",
        //"minify-html",
        //"imagemin",
        "webserver",
]);
