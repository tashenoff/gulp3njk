var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync").create();
var nunjucksRender = require("gulp-nunjucks-render");
var data = require("gulp-data");
var sass = require("gulp-sass");

var rename = require("gulp-rename");
var cssnano = require("gulp-cssnano"); // Подключаем пакет для минификации CSS
var imagemin = require("gulp-imagemin"); // Подключаем библиотеку для работы с изображениями
var pngquant = require("imagemin-pngquant"); // Подключаем библиотеку для работы с png
var cache = require("gulp-cache"); // Подключаем библиотеку кеширования
var cleanCSS = require("gulp-clean-css");
sass.compiler = require("node-sass");

// Loads BrowserSync
gulp.task("browser-sync", function() {
  browserSync.init({
    server: {
      baseDir: "./app"
    }
  });
});

//компиляция nunjucks
gulp.task("nunjucksRender", function() {
  return gulp
    .src("./app/pages/**/*.+(html|njk)")
    .pipe(
      data(() => {
        return require("./app/data.json");
      })
    )
    .pipe(
      nunjucksRender({
        path: ["./app/templates/"] // String or Array
      })
    )
    .pipe(gulp.dest("./app"))
    .pipe(browserSync.stream());
});

// Compile sass into CSS & auto-inject into browsers
gulp.task("style", function() {
  return gulp
    .src("./app/scss/main.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(cssnano())
    .pipe(cleanCSS({ compatibility: "ie8" }))

    .pipe(gulp.dest("./app/css/"))
    .pipe(browserSync.stream());
});

gulp.task("prebuild", async function() {
  var buildHtml = gulp
    .src("./app/*.html") // Переносим HTML в продакшен
    .pipe(gulp.dest("./app/dest/"));

  var buildCss = gulp
    .src([
      // Переносим библиотеки в продакшен

      "./app/css/*.min.css"
    ])
    .pipe(gulp.dest("./app/dest/css/"));
});

gulp.task("clear", function(callback) {
  return cache.clearAll();
});

gulp.task("img", function() {
  return gulp
    .src("./app/img/**/*") // Берем все изображения из app
    .pipe(
      cache(
        imagemin({
          // С кешированием
          // .pipe(imagemin({ // Сжимаем изображения без кеширования
          interlaced: true,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()]
        })
      ) /**/
    )
    .pipe(gulp.dest("./app/dest/img")); // Выгружаем на продакшен
});

// Static Server
gulp.task("watch", ["browser-sync"], function() {
  //слушаем sass
  gulp.watch("./app/scss/**/*.scss", ["style"]);

  //слушаем nunjucks
  gulp
    .watch(
      ["./app/pages/**/*.+(html|njk)", "./app/templates/**/*.+(html|njk)"],
      ["nunjucksRender"]
    )
    .on("change", browserSync.reload);
});

gulp.task("default", ["watch"]);

gulp.task("build", ["prebuild", "clear", "img"]);
