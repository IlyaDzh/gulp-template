const gulp = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const htmlmin = require("gulp-htmlmin");
const cleanCSS = require("gulp-clean-css");
const sass = require("gulp-sass");
const purgecss = require("gulp-purgecss");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const babel = require("gulp-babel");
const sync = require("browser-sync");
const del = require("del");

const clear = () => {
    return del("build");
};

const html = () => {
    return gulp
        .src("src/*.html")
        .pipe(
            nunjucksRender({
                path: ["src/templates/"]
            })
        )
        .pipe(
            htmlmin({
                removeComments: true,
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest("build"))
        .pipe(sync.stream());
};

const styles = () => {
    return gulp
        .src("src/styles/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(
            purgecss({
                content: ["src/**/*.html"]
            })
        )
        .pipe(autoprefixer())
        .pipe(gulp.dest("build/styles"))
        .pipe(cleanCSS())
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(gulp.dest("build/styles"))
        .pipe(sync.stream());
};

const scripts = () => {
    return gulp
        .src("src/scripts/**/*.js")
        .pipe(
            babel({
                presets: ["@babel/preset-env"]
            })
        )
        .pipe(terser())
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(gulp.dest("build/scripts"))
        .pipe(sync.stream());
};

const copy = () => {
    return gulp
        .src(["src/fonts/**/*", "src/images/**/*", "src/styles/css/*"], {
            base: "src"
        })
        .pipe(gulp.dest("build"))
        .pipe(
            sync.stream({
                once: true
            })
        );
};

const server = () => {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: "build"
        }
    });
};

const watch = () => {
    gulp.watch("src/**/*.html", gulp.parallel(html, styles));
    gulp.watch("src/styles/**/*.scss", gulp.series(styles));
    gulp.watch("src/scripts/**/*.js", gulp.series(scripts));
    gulp.watch(
        ["src/fonts/**/*", "src/images/**/*", "src/styles/css/*"],
        gulp.series(copy)
    );
};

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.copy = copy;
exports.server = server;
exports.watch = watch;

exports.default = gulp.series(
    clear,
    gulp.parallel(html, styles, scripts, copy),
    gulp.parallel(watch, server)
);
