/**
 * ! Warning: for correct working mast have:
 * 1. $npm install --global gulp-cli - install gulp-cli gloobaly
 * 2. $npm install - install all packages
 * 
 * Commands for working with this presets:
 * 
 * 1. gulp - developing in runtime, reload browser, rebuilding on file change
 * 2. gulp build - build project for production
 * 3. gulp svg - create sprite for icons from './src/img/icon sprite' dir
 */

const gulp = require('gulp');
const fs = require('fs');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const fileInclude = require('gulp-file-include');
const groupMediaQueries = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

const del = require('del');
const browserSync = require('browser-sync').create();

// ==== Variables ====
const source = 'src';
const public = 'public';

const path = {
	build: {
		html: public + '/',
		css: public + '/css',
		scripts: public + '/scripts',
		img: public + '/img',
		fonts: public + '/fonts',
		libs: public + '/libs'
	},
	src: {
		html: [source + '/*.html', '!' + source + '/_*.html'],
		css: source + '/_scss/style.scss',
		scripts: [source + '/scripts/**/*.js', '!' + source + '/_*.js'],
		img: source + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: source + '/fonts/*.ttf',
		libs: source + '/libs'
	}, 
	watch: {
		html: source + '/**/*.html',
		css: source + '/_scss/**/*.scss',
		scripts: source + '/scripts/**/*.js',
		img: source + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
	},
	clean: './' + public + '/',
}

// ==== Tasks funcitons ====
function html() {
	return gulp.src(path.src.html)
			.pipe( fileInclude() )
			.pipe( gulp.dest(path.build.html) );
}

function images() {
	return gulp.src(path.src.img)
			.pipe( 
				imagemin({
					progressive: true,
					svgoPlugins: [{ removeViewBox: false }],
					interlaced: true,
					optimizationLevel: 3
				}) 
			)
			.pipe( gulp.dest(path.build.img) );
}

function script() {
	return gulp.src(path.src.scripts)
			.pipe( concat('script.js') )
			.pipe( gulp.dest(path.build.scripts) )
			.pipe( uglify() )
			.pipe( 
				rename({
					extname: '.min.js'
				}) 
			)
			.pipe( gulp.dest(path.build.scripts) );
}

function style() {
	return gulp.src(path.src.css)
			.pipe( sass() )
			.pipe( autoprefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: true,
			}) )
			.pipe( groupMediaQueries() )
			.pipe( gulp.dest(path.build.css) )
			.pipe( cleanCSS() )
			.pipe( 
				rename({
					extname: '.min.css'
				}) 
			)
			.pipe( gulp.dest(path.build.css) );
}

function fonts() {
	gulp.src(path.src.fonts)
			.pipe( ttf2woff() )
			.pipe( gulp.dest(path.build.fonts) );
	return gulp.src(path.src.fonts)
			.pipe( ttf2woff2() )
			.pipe( gulp.dest(path.build.fonts) );

}

function svg() {
	return gulp.src('./src/img/iconsprite/*.svg')
		.pipe( 
			svgSprite({
				mode: {
					stack: {
						sprite: '../icons/icons.svg',
						example: true,
					}
				}
			})
		)
		.pipe( gulp.dest(path.build.img) );
}

function clean() {
	return del(path.clean);
}

function watch() {
	browserSync.init({
		server: {
			baseDir: './public',
		},
		notify: false,
	});

	gulp.watch(path.watch.img, images).on('change', browserSync.reload);
	gulp.watch(path.watch.scripts, script).on('change', browserSync.reload);
	gulp.watch(path.watch.css, style).on('change', browserSync.reload);
	gulp.watch(path.watch.html, html).on('change', browserSync.reload);
}


// ==== Gulp tasks commands ====
gulp.task('build', gulp.series(clean, gulp.parallel(html, style, script, images, fonts)));
gulp.task('default', gulp.series('build', watch));

exports.clean = clean;
exports.svg = svg; 

/**
 * Thanks for examples Andrikanych Yevhen
 * https://github.com/FreelancerLifeStyle
 * https://www.youtube.com/watch?v=stFOy0Noahg
 */
