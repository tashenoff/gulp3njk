var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync").create();
var nunjucksRender = require("gulp-nunjucks-render");
var sass = require("gulp-sass");
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
    .src("./app/assets/scss/main.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(gulp.dest("./app/assets/css/"))
    .pipe(browserSync.stream());
});

// Static Server
gulp.task("watch", ["browser-sync"], function() {
  //слушаем sass
  gulp.watch("./app/assets/scss/**/*.scss", ["style"]);

  //слушаем nunjucks
  gulp
    .watch(
      ["./app/pages/**/*.+(html|njk)", "./app/templates/**/*.+(html|njk)"],
      ["nunjucksRender"]
    )
    .on("change", browserSync.reload);
});

gulp.task("default", ["watch"]);
