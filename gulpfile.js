const { src, dest, parallel } = require('gulp');
const rename = require('gulp-rename');

function build(cb) {
    return src('./src/storage-cachelib.js')
        .pipe(rename({ basename: 'index' }))
        .pipe(dest('./dist'));
}

function copyPackageMetafile() {
    return src('./package.json')
        .pipe(dest('./dist'));
}

function copyReadme() {
    return src('./README.md')
        .pipe(dest('./dist'));
}

module.exports.build = parallel(build, copyReadme, copyPackageMetafile);

