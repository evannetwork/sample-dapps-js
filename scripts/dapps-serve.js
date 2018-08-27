/*
  Copyright (c) 2018-present evan GmbH.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const { lstatSync, readdirSync } = require('fs');
const commonjs = require('rollup-plugin-commonjs');
const express = require('express');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollup = require('gulp-rollup');
const serveStatic = require('serve-static');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

const dappDirs = getDirectories(path.resolve('../dapps'))

// Run Express, auto rebuild and restart on src changes
gulp.task('serve', function () {
  gulp.watch(dappDirs.map(dapp => `${dapp}/src/**/*`), [ 'build-copy' ]);
});

// Run Express, auto rebuild and restart on src changes
gulp.task('build-copy', async function () {
  for (let dappDir of dappDirs) {
    const dbcp = require(`${ dappDir }/dbcp.json`);
    const dappConfig = dbcp.public.dapp;

    del.sync(`${dappDir}/dist`, { force: true });

    await new Promise((resolve, reject) => {
      gulp
        .src(`${dappDir}/**/*.js`)
        .pipe(sourcemaps.init())
        .pipe(rollup({
          // Bundle's entry point
          // See "input" in https://rollupjs.org/#core-functionality
          input: `${dappDir}/src/${dappConfig.entrypoint}`,

          // Allow mixing of hypothetical and actual files. "Actual" files can be files
          // accessed by Rollup or produced by plugins further down the chain.
          // This prevents errors like: 'path/file' does not exist in the hypothetical file system
          // when subdirectories are used in the `src` directory.
          allowRealFiles: true,

          // A list of IDs of modules that should remain external to the bundle
          // See "external" in https://rollupjs.org/#core-functionality
          external: [
            'bcc'
          ],

          // Format of generated bundle
          // See "format" in https://rollupjs.org/#core-functionality
          format: 'umd',

          treeshake: true,

          // Export mode to use
          // See "exports" in https://rollupjs.org/#danger-zone
          exports: 'named',

          // The name to use for the module for UMD/IIFE bundles
          // (required for bundles with exports)
          // See "name" in https://rollupjs.org/#core-functionality
          name: dappConfig.entrypoint,

          // See "globals" in https://rollupjs.org/#core-functionality
          globals: {},

          plugins: [
            rollupResolve(),
            commonjs({

            }),
          ]
        }))

        // save file
        .pipe(rename(`${dappConfig.entrypoint}`))
        .pipe(gulp.dest(`${dappDir}/dist`))
        .on('end', () => resolve());
    });

    await new Promise((resolve, reject) => {
      gulp
        .src([
          `${ dappDir }/src/**/*.css`,
          `${ dappDir }/dbcp.json`,
          `${ dappDir }/dist/**/*`,
        ])
        .pipe(gulp.dest(`${ dappDir }/dist`))
        .pipe(gulp.dest(`../node_modules/@evan.network/ui-dapp-browser/runtime/external/${dbcp.public.name}`))
        .on('end', () => resolve());
    });

    await new Promise((resolve, reject) => {
      gulp
        .src(`${ dappDir }/dist/**/*`)
        .pipe(gulp.dest(`../node_modules/@evan.network/ui-dapp-browser/runtime/external/${dbcp.public.name}`))
        .on('end', () => resolve());
    });
  }
});

gulp.task('default', [ 'build-copy', 'serve' ]);
