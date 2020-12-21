const gulp = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const babel = require("gulp-babel");
const replace = require("gulp-replace");
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

exports.html = html;

const styles = () => {
    return gulp
        .src("src/styles/**/*.scss")
        .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(gulp.dest("build/styles"))
        .pipe(sync.stream());
};

exports.styles = styles;

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

exports.scripts = scripts;

const copy = () => {
    return gulp
        .src(["src/fonts/**/*", "src/images/**/*"], {
            base: "src"
        })
        .pipe(gulp.dest("build"))
        .pipe(
            sync.stream({
                once: true
            })
        );
};

exports.copy = copy;

const paths = () => {
    return gulp
        .src("build/*.html")
        .pipe(replace(/href=\"(\S*)\.scss\"/gi, 'href="$1.min.css"'))
        .pipe(replace(/src=\"(\S*)\.js\"/gi, 'src="$1.min.js"'))
        .pipe(gulp.dest("build"));
};

exports.paths = paths;

const server = () => {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: "build"
        }
    });
};

exports.server = server;

const watch = () => {
    gulp.watch("src/*.html", gulp.series(html, paths));
    gulp.watch("src/styles/**/*.scss", gulp.series(styles));
    gulp.watch("src/scripts/**/*.js", gulp.series(scripts));
    gulp.watch(["src/fonts/**/*", "src/images/**/*"], gulp.series(copy));
};

exports.watch = watch;

exports.default = gulp.series(
    clear,
    gulp.parallel(html, styles, scripts, copy),
    paths,
    gulp.parallel(watch, server)
);
