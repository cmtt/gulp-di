<img align="right" src="http://cmtt.github.io/gulp-di/src/gulp.png" alt="Gulp"/>
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
# Example: Basic refactoring

Instead of declaring all gulp tasks in a single file, gulp-di allows you to
take a more modular approach. You can separate your stream definitions from
configurations while gulp-di handles the majority of your existing calls to
require() for you.

In this example, we will see how we can move a call to gulp.task() to a
separate file.

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

would be re-factored to the file at tasks/images.js as following.

````js
/* tasks/images.js */

module.exports = function (gulp, imagesPath) {
  gulp.task('images', function () {
    return gulp.src(imagesPath)
    .pipe(gulp.dest('output/'));
  });
};
````

Notice that the function uses the "imagePath" constant. Such constants can
be defined in your Gulpfile files in order to separate them from the tasks.

Thus, you can now use all of your Functional programming skills with Gulp and
**assemble** your tasks from other declarations and build much more
flexible and re-usable tasks.

gulp-di should help you to reduce your Gulpfile's complexity.
In this example, we will declare additionally the "imagePath" constant which is
being used in our "images" task.

````js
/* gulpfile.js (refactored version) */

var gulp = require('gulp');
var di = require('gulp-di')(gulp);
.tasks('./tasks')
.provide('imagesPath', 'src/**/*.jpg')
.resolve();
````

Additionally, you can now "inject" arbitrary values into your functions, e. g.
run-time configurations, asynchronous methods for usage with Gulp's asynchronous
API, constants etc.

The following example uses constants and modules in order to compose a helper
function.

````js
/* gulpfile.js (refactored version) */

var gulp = require('gulp');
var di = require('gulp-di')(gulp);
.tasks('./tasks')
.provide('sourcePath', 'src')                    // Provide a string constant.
.module('extensionPath', function (sourcePath) { // Add a module providing a
  return function (extname) {                    // helper function to get a
    return sourcePath + '/**/*.'  + extname;     // glob for the specified
  };                                             // extension name.
})
.task(function (gulp, extensionPath) {
  gulp.task('copy-images', function () {
    // Copies all *.jpg images from src/ to public/
    return gulp.src(extensionPath('jpg')).pipe(gulp.dest('public/'));
  });
})
.resolve();
````

# Built-in dependencies

You can use the following dependencies in your modules and tasks.

| Name     |  Type    |  Description                                  |
|----------|----------|-----------------------------------------------|
| basePath | Function | Resolves a path relative to your project path |
| chalk    | Object   | [chalk](https://www.npmjs.com/package/chalk) for using colors when logging           |
| gulp     | Object   | The gulp instance                             |
| log      | Function | [gulp-util](https://www.npmjs.com/package/gulp-util)'s log                                 |
| Package  | Object   | package.json as object                        |
| taskInfo | Object   | infos about task functions (experimental)     |

In addition, all Gulp modules which are installed in your package.json are
available in your modules, driven by [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins).

For example, if you install the "gulp-concat" as devDependency (in your
package.json) plugin using ...

````bash
  $ npm install --save-dev gulp-concat
````

... it will become available as dependency in each module file:

````js
// tasks/concat-texts.js
module.exports = function (gulp, concat) {
  /* Concatenates all *.txt files from src/ to public/result.txt */
  return gulp.src('src/**/*.txt')
  .pipe(concat('result.txt'))
  .pipe(gulp.dest('public/'));
};
````
Please read the API notes below for configuring a pattern for packages which
do not start with "gulp-" or "gulp.*".

# API

## GulpDI(_object_ gulp, _object_ options)

Creates a new GulpDI instance. The first argument must always be the your
existing gulp module from your Gulpfile.

If you specify options, these will be passed to [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) under the hood (but "lazy" and "camelize" cannot
be configured at the moment).

```js
var di = GulpDI({
  DEBUG: false, // when set to true, the plugin will log info to console. Useful for bug reporting and issue debugging
  pattern: ['gulp-*', 'gulp.*'], // the glob(s) to search for
  config: 'package.json', // where to find the plugins, by default searched up from process.cwd()
  scope: ['dependencies', 'devDependencies', 'peerDependencies'], // which keys in the config to look within
  replaceString: /^gulp(-|\.)/, // what to remove from the name of the module when adding it to the context
  rename: {}, // a mapping of plugins to rename
  renameFn: function (name) { ... } // a function to handle the renaming of plugins (the default works)
}, require('gulp'));
```
The following options are additionally available:

| Name     |  Type    |  Description                                  |
|----------|----------|-----------------------------------------------|
| DEBUG    | Boolean  | Whether to log debugging information or not   |
| noHelp   | Boolean  | Toggle the "help" task/providing taskInfo     |

All of the following methods are chainable.

## .provide(_string_ name, _*_ payload)

Provides a constant for further usage in modules and tasks. You can can also
provide a hashmap as following:
````js
di.provide({ 'PI' : Math.PI, 'SIN' : Math.sin });
````

## .task(_function_ fn)

Adds a task module. Add your provide()d dependencies to the function's argument
list to require a dependency. Their order does not matter.

Please note that tasks don't have names (in contrast to modules) as
you shouldn't depend on them using gulp-di. Use the "deps" array when calling
gulp.task() instead in order to achieve a specific task execution order.

You can also use a hashmap as following:

````js
di.task({
  assets : function (gulp) {
    /* Copies all *.png images from src/ to public/ */
    return gulp.src('src/**/*.png').pipe(gulp.dest('public/'));
  }
});
````

## .module(_string_ name,_function_ fn)

Adds a module with the given name. In contrast to a task, a module has a name
and its return value will be provided - thus, modules can be injected into tasks
as well as your constants.

You can provide a hashmap, too.

## .resolve()

Resolves all dependencies and runs all task modules. You need to call this
method after your declarations.

## .tasks(_string_ directory)

Loads all tasks from the specified directory, using [require-dir](https://www.npmjs.com/package/require-dir).

## .modules(_string_ directory)

Loads all modules from the specified directory.

## .byId(_string_ name)

Returns the specified dependency. When you are demanding modules, please keep in
mind that you will need to call resolve() beforehand, otherwise, this would
return your module function.

# Using dependency injection in general

By design, dependency injection is opt-in for everything, thus you can use
gulp-di for use cases beyond your gulp tasks.

## Setting values

When using DI, you can set values on your instance to arbitrary values. They
will become available in your module files.

````js
var gulp = require('gulp');
var di = require('gulp-di')(gulp, { DEBUG: false });
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

Note that you have access to the gulp-di instance in the task function's scope.
You could f.e. access the "options" object in your function as following:

````js
di.task(function () {
  if (this.options.DEBUG) { console.log('Debug is enabled'); }
});
````

## Running all modules and resolving dependencies

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
gulp.task. In addition, a "taskInfo" hashmap is available for injection. It
contains the information about your gulp tasks which is being also used by
the "help" task.

````js
var gulpDi = require('gulp-di');
var di = gulpDi()
.task(function (gulp, taskInfo, log, chalk) {
  gulp.task('my-help', function () {
    /* Logs basic information about tasks. */
    for (var name in taskInfo) {
      var entry = taskInfo[name];
      log(chalk.magenta(name), 'with dependencies',  entry.deps);
    }
  });
})
.resolve();
````

# FAQ

## How do I insert tasks? Gulp claims "Task 'default' is not in your gulpfile" all the time!

Please call the resolve() method after all of your module and task declarations.

## gulp-di does not find my module!

In order to make your gulp plugins available, gulp-di uses
[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) internally
by default.

The default pattern is ['gulp-*', 'gulp.*', '!gulp-di']. You need to initialize
gulp-di using the "options" object in order to make plugins with arbitrary names
available:

````js
var gulp = require('gulp');
var di = require('gulp-di')(gulp, {
  pattern : ['gulp-*', 'gulp.*', '!gulp-di', 'webpack-stream']
});

di.task(function (webpackStream) {
  gulp.task('webpack', function () {
    return gulp.src('src/client.js')
    .pipe(webpackStream({ output : { filename : '[name].js' }}))
    .pipe(gulp.dest('public'));
  });
});

di.resolve();

````

## Is it possible to add tasks asynchronously?

No, you will need to set up asynchronous tasks which depend on each other in
order to perform asynchronous tasks. Nevertheless, all tasks must be declared
synchronously in order to use Gulp correctly.

## I dislike the camelCaseName of my favorite module, can I change it?

Using [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins), you
can change the assigned name for arbitrary modules.

### Using a ``rename`` object:

````js
var di = require('gulp-di')(gulp, {
  rename : {
    webpackStream : 'webpack'
  }
});
````

### Using a ``renameFn``:
````js
var replacements = { webpackStream : 'webpack'};
var di = require('gulp-di')(gulp, {
  renameFn : function(key) { return replacements[key]; }
});
````

# Changelog

0.0.1 - 12/20/2015

  Initial release, incorporating Resolver and tests from [dijs](https://www.npmjs.com/package/dijs).

# Licence

MIT
