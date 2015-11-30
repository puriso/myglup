"use strict";
/*------------------------------------------------------------
 * require
 -----------------------------------------------------------*/
var gulp = require("gulp");
var $ = require("gulp-load-plugins")({
    pattern: ["gulp-*", "gulp.*"],
    replaceString: /\bgulp[\-.]/
});
var browser = require("browser-sync");

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
        dist :"dist/css/",
        uncss:{
            html    : ["./*.html", "second/*.html"], //URL指定の可能
            ignore  : [".reset","",/^\.*__*/, /^\.is\-/, /^\.bx*/],//IGNORE:正規表現も可能
            rename  : ".un.css"
        }
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
            "second/**/*.ejs",
            "ejs/**/*.ejs",
            "!**/_*.ejs",
        ],
        watch:[
            "*.ejs",
            "second/**/*.ejs",
            "ejs/**/*.ejs",
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
    },
    frontnote:{
        overview:"overview.md",
        watch   :["scss/**/*.scss","overview.md"],
        dist    :"_doc",
    }

};

/*------------------------------------------------------------
 * TASKS
 -----------------------------------------------------------*/

    /*
     * CSS Task
     */
    gulp.task("sass", function () {
        return gulp.src(path.scss.src)
            .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [SASS ERROR] <%= error.message %>")}))
            .pipe($.sass())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(path.scss.dist));
    });
gulp.task("cssmin", function () {
    gulp.src(path.css.src)
        .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [CSSMIN ERROR] <%= error.message %>")}))
        .pipe($.cssmin())
        .pipe(gulp.dest(path.css.dist));
});
gulp.task("uncss", function () {
    return gulp.src("css/*.css")

        .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [UNCSS ERROR] <%= error.message %>")}))
        .pipe($.uncss(path.css.uncss))
        .pipe($.rename({
            extname: path.css.uncss.rename
        }))
    .pipe(gulp.dest(path.css.dist));
});


/*
 * Image
 */
    gulp.task("imagemin",function(){
        gulp.src(path.image.src)
            .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [IMAGEMIN ERROR] <%= error.message %>")}))
            .pipe($.imagemin())
            .pipe(gulp.dest(path.image.dist));
    });

/*
 * JavaScript
 */
            gulp.task("uglify", function(){
                gulp.src(path.js.src)
                    .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [UGLIFY(JS File) ERROR] <%= error.message %>")}))
                    .pipe($.uglify({preserveComments: "some"}))
                    .pipe(gulp.dest(path.js.dist));
            });

/*
 * HTML
 */
    gulp.task("htmlmin", function() {
        var opts = {
            conditionals: true,
            spare:true
        };
        return gulp.src(path.html.dist+"**/*.html")
            .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [HTMLMIN ERROR]<%= error.message %>")}))
            .pipe($.minifyHTML(opts))
            .pipe($.minifyInline())
            .pipe(gulp.dest(path.html.dist));
    });
gulp.task("ejs", function() {
    gulp.src(path.ejs.src)
        .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [EJS ERROR]<%= error.message %>")}))
        .pipe($.ejs())
        .pipe(gulp.dest(path.ejs.dist));
});


/*
 * Browser
 */
    gulp.task("start_server", function() {
        browser.init(null, {
            server: {
                baseDir: path.html.dist
            }
        });
    });
gulp.task("reload_server", function () {
    browser.reload();
});

/*
 * Document
 */
gulp.task('doc', function() {
    gulp.src(path.css.src)
        .pipe($.frontnote({
            out: path.frontnote.dist,
            overview: path.frontnote.overview
        }));
});

/*
 * FTP
 */
gulp.task("ftp", function () {
    return gulp.src(ftpInfo.uploadPath)
        .pipe($.plumber({errorHandler: $.notify.onError("[FTP ERROR]<%= error.message %>")}))
        .pipe($.ftp({
            host        : ftpInfo.host,
            user        : ftpInfo.user,
            pass        : ftpInfo.pass,
            remotePath  : ftpInfo.remotePath
        }))
    // you need to have some kind of stream after gulp-ftp to make sure it"s flushed
    // this can be a gulp plugin, gulp.dest, or any kind of stream
    // here we use a passthrough stream
    .pipe($.gutil.noop());
});

/*------------------------------------------------------------
 * WATCH TASKS
 -----------------------------------------------------------*/
gulp.task('default', [
        "sass",
        "cssmin",
        "uglify",
        "ejs",
        //"html-min",
        //"imagemin",
        "doc",
        "start_server"
], function () {
    gulp.watch(path.scss.watch,["sass","reload_server"]);
    gulp.watch(path.js.watch,["uglify","reload_server"]);
    //gulp.watch(path.html.watch,["htmlmin","reload_server"]);
    //gulp.watch(path.image.src,["imagemin","reload_server"]);
    gulp.watch(path.ejs.watch,["ejs","reload_server"]);
    gulp.watch(path.frontnote.watch,["doc","reload_server"]);
}
);
