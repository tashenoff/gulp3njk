var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync").create();
var nunjucksRender = require("gulp-nunjucks-render");
var data = require("gulp-data"); //берем данные из json data и вставляем в ninjucks
var sass = require("gulp-sass"); //sass
var wiredep = require("gulp-wiredep"); //пока не понял как сделать так что бы компонеты (стили и js) автоматом ставились в header
var del = require("del"); // Подключаем библиотеку для удаления файлов и папок
var rename = require("gulp-rename"); //rename
var cssnano = require("gulp-cssnano"); // Подключаем пакет для минификации CSS
var imagemin = require("gulp-imagemin"); // Подключаем библиотеку для работы с изображениями
var pngquant = require("imagemin-pngquant"); // Подключаем библиотеку для работы с png
var cache = require("gulp-cache"); // Подключаем библиотеку кеширования
var cleanCSS = require("gulp-clean-css"); //пока изучаю
sass.compiler = require("node-sass");

// Loads BrowserSync
gulp.task("browser-sync", function() {
  browserSync.init({
    server: {
      baseDir: "./app",
      notify: false
    }
  });
});

//компиляция nunjucks
gulp.task("nunjucksRender", function() {
  return gulp
    .src("./app/pages/**/*.+(html|njk)")
    .pipe(
      data(() => {
        return require("./app/js/data.json");
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

gulp.task("bower", function() {
  gulp
    .src("./app/templates/layout.njk")
    // .pipe(
    //   wiredep({
    //     directory: "./app/bower/"
    //   })
    // )
    .pipe(gulp.dest("./app"));
});

// gulp.task("min", function() {
//   return gulp
//     .src("./app/css/*.css")
//     .pipe(cssnano())
//     .pipe(rename({ suffix: ".min" })) // Добавляем суффикс .min
//     .pipe(gulp.dest("./app/css"));
// });

gulp.task("del", async function() {
  return del.sync("./app/css/*");
});

// Compile sass into CSS & auto-inject into browsers
gulp.task("style", function() {
  return gulp
    .src("./app/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(cssnano())
    .pipe(rename({ suffix: ".min" })) // Добавляем суффикс .min
    .pipe(gulp.dest("./app/css/"))

    .pipe(browserSync.stream());
});

gulp.task("prebuild", async function() {
  var buildHtml = gulp
    .src("./app/*.html") // Переносим HTML в продакшен
    .pipe(gulp.dest("./app/dest/"));

  var buildCss = gulp
    .src([
      // Переносим библиотеки в продакшен в разработке пока что

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
  gulp.watch("./app/scss/**/*.scss", ["del", "style"]);

  //слушаем nunjucks
  gulp
    .watch(
      ["./app/pages/**/*.+(html|njk)", "./app/templates/**/*.+(html|njk)"],
      ["nunjucksRender"]
    )
    .on("change", browserSync.reload);
});

gulp.task("default", ["del", "style", "watch"]); //я знаю что del тут поидее не нужен, что слишком радикально чистить папки и заново компилировать туда файлы но пока так стоит)

gulp.task("build", ["prebuild", "clear", "img"]); //в разработке
