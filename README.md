gulp-di
-------

gulp-di is a dependency injection framework for the [Gulp](http://gulpjs.com)
streaming build system.

- Shrink your Gulpfile to less than ten lines.
- Manage gulp plugins solely via npm and variables in your task module files.
- No major refactoring required.

See below for further examples!

# Installation

````bash
  $ npm install --save gulp-di
````
# Basic refactoring

Instead of declaring all gulp tasks in a single file, we can take a more modular
approach.
Basically, we will move all calls to gulp.task() to separate files.

Additionally, we will see how we can detach a constant (in this case: a glob
matching all files with the "jpg" extension) from the actual task.

The following task

````js
/* gulpfile.js (previous version) */

var gulp = require('gulp');
gulp.task('images', function () {
  return gulp.src('./**/*.jpg')
  .pipe(gulp.dest('output/'));
});
````

would be refactored to the file at tasks/images.js as following.

````js
/* tasks/images.js */

module.exports = function (gulp, imagesPath) {
  gulp.task('images', function () {
    return gulp.src(imagesPath)
    .pipe(gulp.dest('output/'));
  });
};
````

Notice that the function uses the "imagePath" constant. Such constants could
be defined in your Gulpfile files in order to separate them from the tasks.

Thus, you might assemble your tasks from other declarations and build much more
flexible tasks.

Then, you can reduce your Gulpfile to the following lines. We will declare
additionally the "imagePath" constant which is being used in our "images" task.

This separation allows to assemble Gulp tasks conditionally by separating such
data from your streams.

````js
/* gulpfile.js (refactored version) */

var gulp = require('gulp');
var di = require('gulp-di')(gulp);
.tasks('./tasks')
.provide('imagesPath', ['src/**/*.jpg'])
.resolve();
````

Additionally, you can now "inject" arbitrary values into your functions, e. g.
run-time configurations, asynchronous methods for usage with Gulp's asynchronous
API, constants etc.

# Available dependencies

By default, the following dependencies are available in modules:

| Name     |  Type    |  Description                                  |
|----------|----------|-----------------------------------------------|
| gulp     | Object   | The gulp instance                             |
| Options  | Object   | The provided options object (experimental)    |
| Package  | Object   | package.json as object (experimental)         |
| basePath | Function | Resolves a path relative to your project path |

In addition, all Gulp modules which are installed in your package.json are
available in your modules, driven by [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins).

For example, if you install the "gulp-concat" as devDependency (in your
package.json) plugin using ...

````bash
  $ npm install --save-dev gulp-concat
````

... it will become available as dependency in each module file:

````js
module.exports = function (gulp, concat) {
  return gulp.src('src/**/*.txt')
  .pipe(concat())
  .pipe(gulp.dest('/tmp/result.txt'));
};
````
# API

## GulpDI(_object_ gulp, _object_ options)

Creates a new GulpDI instance. The first argument must always be the required
gulp module.

If you specify options, these will be passed to [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) under the hood.

```js
var di = GulpDI({
  DEBUG: false, // when set to true, the plugin will log info to console. Useful for bug reporting and issue debugging
  pattern: ['gulp-*', 'gulp.*'], // the glob(s) to search for
  config: 'package.json', // where to find the plugins, by default searched up from process.cwd()
  scope: ['dependencies', 'devDependencies', 'peerDependencies'], // which keys in the config to look within
  replaceString: /^gulp(-|\.)/, // what to remove from the name of the module when adding it to the context
  camelize: true, // if true, transforms hyphenated plugins names to camel case
  lazy: true, // whether the plugins should be lazy loaded on demand
  rename: {}, // a mapping of plugins to rename
  renameFn: function (name) { ... } // a function to handle the renaming of plugins (the default works)
}, require('gulp'));
```

All of the following methods are chainable.

## .provide(_string_ key, _*_ payload)

Sets a value. It becomes available in your modules (see below).

## .task(_function_ fn)

Adds a task module. Add your provide()d dependencies to the function's argument
list to require a dependency. Their order does not matter.

## .inject(_function_ fn)

Injects a function into the current dependencies synchronously. This allows
you to run your module immediately, but without any dependencies not yet
provide()d before this call.

## .injectValue(_string_ key, _function_ fn)

Injects the return value of the given function as "key". For example, This might
be useful when your configuration depends on other dependencies like basePath().

## .resolve()

Resolves all dependencies and runs all task modules. You need to call this
method after your declarations.

## .tasks(_string_ directory)

Adds all tasks from the specified directory, using [require-dir](https://www.npmjs.com/package/require-dir).

# Using dependency injection in general

By design, dependency injection is opt-in for everything, thus you can use
gulp-di for use cases beyond your gulp tasks.

## Setting values

When using DI, you can set values on your instance to arbitrary values. They
will become available in your module files.

````js
var di = require('gulp-di')();
di.provide('PI', Math.PI);
di.provide('RAD_TO_DEG', 180 / Math.PI);
````

## Declaring task modules

You can then declare a single function or a whole directory of
CommonJS modules using the tasks() method.

````js
di.task(function (PI, RAD_TO_DEG, basePath) {
  console.log((PI * 2 * RAD_TO_DEG) + '°');
});
````

## Running all modules

You need to execute all provided values and modules by running resolve()
afterwards.

While you place calls to task(), tasks() and provide, the execution order of your
depends on the declared dependencies. With resolve(), the graph is being
resolved and all modules are called with the provided values.

````js
di.resolve();
// logs 360°
````

# Experimental functionalities

Please use these features with caution for now.

## gulp help

This example is included by default.

An included experiment uses the API to intersect all calls to gulp.task to
collect information about the tasks.

It registers a gulp "help" task which logs then all comments included in
gulp.task. If you provide your package.json as "Package", it displays its
name and version information on top.

````js
var gulpDi = require('gulp-di');
var di = gulpDi()
.inject(require('gulp-di/contrib/help'))
.provide('Package', require('./package.json'))
.tasks('./tasks')
.resolve();
````

# FAQ

## How do I insert tasks? Gulp claims "Task 'default' is not in your gulpfile" all the time!

Please call the resolve() method in order to make all modules available.

## Instead of my plugin, gulp-di just returns "null". What is wrong?

In order to inject your gulp plugins, gulp-di uses [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins)
internally by default.

By default, it matches the pattern ['gulp-*', 'gulp.*']. You need to initialize
gulp-di using the "options" object in order to make plugins with arbitrary names
available:

````js
var gulp = require('gulp');
var di = require('gulp-di')(gulp, {
  pattern : ['gulp-*', 'gulp.*', 'webpack-stream']
});

di.task(function (webpackStream) {
  gulp.task('webpack', function () {
    return gulp.src('src/client.js')
    .pipe(webpackStream({ output : { filename : '[name].js' }}))
    .pipe(gulp.dest('public'));
  });
});

````

## I dislike the camelCaseName of my favorite module, can I change it?

Using [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins), you
can change the assigned name for arbitrary modules.

### Using a ``rename`` object:

````js
var di = require('gulp-di')(gulp, {
  rename : {
    webpackStream : 'gulpWebpack'
  }
})
````

### Using a ``renameFn``:
````js
var replacements = { webpackStream : 'gulpWebpack'};
var di = require('gulp-di')(gulp, {
  renameFn : function(key) { return replacements[key]; }
});
````

# Changelog

0.0.0 - 12/??/2015

  Initial release, incorporating Resolver and tests from [dijs](https://www.npmjs.com/package/dijs).

# License

MIT
