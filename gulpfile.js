/*
 *  Web Starter Kit
 */
"use strict";
/*------------------------------------------------------------
 * Include Gulp & Tools We'll Use
 -----------------------------------------------------------*/
var gulp = require("gulp");
var $ = require("gulp-load-plugins")({ //require自動宣言
    pattern: ["gulp-*", "gulp.*"],
    replaceString: /\bgulp[\-.]/
});
var browser = require("browser-sync");

/*------------------------------------------------------------
 * Gulp Option
 -----------------------------------------------------------*/
var autoprefixer_opt = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

/*------------------------------------------------------------
 * PATH設定
 -----------------------------------------------------------*/
//FTP
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
        dist :"css/",

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
 * SCSS,CSS Task
 */
gulp.task("sass", function () {
    //sass
    gulp.src(path.scss.src)
        .pipe($.plumber({errorHandler: $.notify.onError("(;◡;) [SASS ERROR] <%= error.message %>")}))
        .pipe($.sass())
        .pipe($.autoprefixer(autoprefixer_opt))
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
 * Images TASK
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
        "uglify",
        "ejs",
        //"html-min",
        "imagemin",
        "start_server"
], function () {
    gulp.watch(path.scss.watch,["sass","reload_server"]);
    gulp.watch(path.js.watch,["uglify","reload_server"]);
    //gulp.watch(path.html.watch,["htmlmin","reload_server"]);
    gulp.watch(path.image.src,["imagemin","reload_server"]);
    gulp.watch(path.ejs.watch,["ejs","reload_server"]);
});
