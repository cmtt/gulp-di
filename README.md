# [gulp](http://gulpjs.com)-di

<a href="http://gulpjs.com">
  <img align="right" height="192" src="http://cmtt.github.io/gulp-di/src/gulp.png">
</a>

<div>
  <a href="https://travis-ci.org/cmtt/gulp-di">
    <img src="https://img.shields.io/travis/cmtt/gulp-di/master.svg?style=flat-square" alt="Build Status">
  </a>
  <a href="https://www.npmjs.org/package/gulp-di">
    <img src="https://img.shields.io/npm/v/gulp-di.svg?style=flat-square" alt="npm version">
  </a>
  <a href="http://spdx.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/gulp-di.svg?style=flat-square" alt="npm licence">
  </a>
  <a href="https://coveralls.io/github/cmtt/gulp-di">
    <img src="https://img.shields.io/coveralls/cmtt/gulp-di/master.svg?style=flat-square" alt="Code coverage">
  </a>
  <a href="http://www.ecma-international.org/ecma-262/6.0/">
    <img src="https://img.shields.io/badge/ES-2015-F0DB4F.svg?style=flat-square" alt="ECMAScript 2015">
  </a>
</div>

gulp-di is a dependency injection framework for the [Gulp](http://gulpjs.com)
streaming build system.

- Shrink your Gulpfile to less than ten lines.
- Manage gulp plugins solely via npm and variables in your task module files.
- No major refactoring required.

See below for further examples!

## Installation

````bash
  $ npm install --save gulp-di
````

## Built-in dependencies

You can use the following dependencies in your modules and tasks.

| Name         |  Type    |  Description                                  |
|--------------|----------|-----------------------------------------------|
| _            | Function | [lodash](https://github.com/lodash/lodash)    |
| basePath     | Function | Resolves a path relative to your project path |
| chalk        | Object   | [chalk](https://www.npmjs.com/package/chalk) for using colors when logging |
| gulp         | Object   | The gulp instance                             |
| gutil        | Object   | [gulp-util](https://www.npmjs.com/package/gulp-util) |
| log          | Function | [gulp-util](https://www.npmjs.com/package/gulp-util)'s log |
| Package      | Object   | package.json as object                        |
| runningTasks | Array    | currently running gulp tasks (experimental)   |
| taskInfo     | Object   | infos about task functions (experimental)     |

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
module.exports = (gulp, concat) => {
  /* Concatenates all *.txt files from src/ to public/result.txt */
  return gulp.src('src/**/*.txt')
  .pipe(concat('result.txt'))
  .pipe(gulp.dest('public/'));
};
````
Please read the API notes below for configuring a pattern for packages which
do not start with "gulp-" or "gulp.*".

## Example: Basic refactoring

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

const gulp = require('gulp');
gulp.task('images', () => {
  return gulp.src('./**/*.jpg')
  .pipe(gulp.dest('output/'));
});
````

would be re-factored to the file at tasks/images.js as following.

````js
/* tasks/images.js */

module.exports = (gulp, imagesPath) => {
  gulp.task('images', () => {
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

const gulp = require('gulp');
let di = require('gulp-di')(gulp);
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

const gulp = require('gulp');
let di = require('gulp-di')(gulp);
.tasks('./tasks')
.provide('sourcePath', 'src')                    // Provide a string constant.
.module('extensionPath', (sourcePath) => {       // Add a module providing a
                                                 // helper function to get a
                                                 // extension name.

  return (extname) => `${sourcePath}/**/*.${extname}`;

})
.task(function (gulp, extensionPath) {
  gulp.task('copy-images', function () {
    // Copies all *.jpg images from src/ to public/
    return gulp.src(extensionPath('jpg')).pipe(gulp.dest('public/'));
  });
})
.resolve();
````

## API

### GulpDI(_object_ gulp, _object_ options)

Creates a new GulpDI instance. The first argument must always be the gulp
instance from your Gulpfile.

If you specify options, these will be passed to [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) under the hood ("camelize" cannot be configured at the moment).

```js
let di = GulpDI({
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

| Name             |  Type    |  Description                                  |
|------------------|----------|-----------------------------------------------|
| DEBUG            | Boolean  | Whether to log debugging information or not   |
| noBuiltin        | Boolean  | Disables helpers: basePath, log, Package      |
| noHelp           | Boolean  | Toggles the "help" task/providing taskInfo    |
| noModules        | Boolean  | Do not expose chalk, gutil and lodash (_)     |
| noRunningTasks   | Boolean  | Do not provide the "runningTasks" function    |

### Chainable methods

The following methods are chainable:

#### .inject(_function_ fn, returnValue)

Executes code which depends on the current's instance dependencies.
Please note that you will have to resolve() your instance if you should depend
on anything else than payloads which have been initialized by provide().

When returnValue is set, this method returns the return value of the injected
function (e.g. the function is not chainable when set to true)

````js
di.provide({ 'PI' : Math.PI, 'DEG_TO_RAD' : 180 / Math.PI });
let circle = di.inject(['PI','DEG_TO_RAD', (PI, DEG_TO_RAD) => {
  return 2 * PI * DEG_TO_RAD;
}], true);
console.log(circle); // 360
````

#### .provide(_string_ name, _*_ payload)

Provides a constant for further usage in modules and tasks. You can can also
provide a hashmap of constants as following:
````js
di.provide({ 'PI' : Math.PI, 'SIN' : Math.sin });
````

#### .task(_function_ fn)

Adds a task module. Add your provide()d dependencies to the function's argument
list to require a dependency. Their order does not matter.

Please note that tasks don't have names (in contrast to modules) as
you shouldn't depend on them using gulp-di. Use the "deps" array when calling
gulp.task() instead in order to achieve a specific task execution order.

You can also use a hashmap as following:

````js
di.task({
  /* Copies all *.png images from src/ to public/ */
  assets : (gulp) => gulp.src('src/**/*.png').pipe(gulp.dest('public/'))
});
````

#### .module(_string_ name,_function_ fn)

Adds a module with the given name. In contrast to a task, a module has a name
and its return value will be provided - thus, modules can be injected into tasks
as well as your constants.

You can provide a hashmap, too.

#### .resolve()

Resolves all dependencies and runs all task modules. You need to call this
method after your declarations.

#### .tasks(_string_ directory)

Loads all tasks from the specified directory, using [require-dir](https://www.npmjs.com/package/require-dir).

#### .modules(_string_ directory)

Loads all modules from the specified directory.

#### .byId(_string_ name)

Returns the specified dependency. When you are demanding modules, please keep in
mind that you will need to call resolve() beforehand, otherwise, this would
return your module function.

## Using dependency injection in general

By design, dependency injection is opt-in for everything, thus you can use
gulp-di for use cases beyond your gulp tasks.

### Setting values

When using DI, you can set values on your instance to arbitrary values. They
will become available in your module files.

````js
const gulp = require('gulp');
let di = require('gulp-di')(gulp, { DEBUG: false });
di.provide('PI', Math.PI);
di.provide('RAD_TO_DEG', 180 / Math.PI);
````

### Declaring task modules

You can then declare a single function or a whole directory of
CommonJS modules using the tasks() method.

````js
di.task((PI, RAD_TO_DEG, basePath) => {
  console.log((PI * 2 * RAD_TO_DEG) + '°');
});
````

Note that you have access to the gulp-di instance in the task function's scope.
You could f.e. access the "options" object in your function as following:

````js
di.task(() => {
  if (this.options.DEBUG) { console.log('Debug is enabled'); }
});
````

### Running all modules and resolving dependencies

You need to execute all provided values and modules by running resolve()
afterwards.

While you place calls to task(), tasks() and provide, the execution order of your
depends on the declared dependencies. With resolve(), the graph is being
resolved and all modules are called with the provided values.

````js
di.resolve();
// logs 360°
````

## Experimental functionalities

Please use these features with caution for now.

### gulp help

This example is included by default.

An included experiment uses the API to intersect all calls to gulp.task to
collect information about the tasks.

It registers a gulp "help" task which logs then all comments included in
gulp.task. In addition, a "taskInfo" hashmap is available for injection. It
contains the information about your gulp tasks which is being also used by
the "help" task.

````js
const gulpDi = require('gulp-di');
let di = gulpDi()
.task(function (gulp, taskInfo, log, chalk) {
  gulp.task('my-help', function () {
    /* Logs basic information about tasks. */
    for (let name in taskInfo) {
      let entry = taskInfo[name];
      log(chalk.magenta(name), 'with dependencies',  entry.deps);
    }
  });
})
.resolve();
````
### runningTasks

This function returns an array of strings, containing all current Gulp tasks,
including dependencies.

### Helper functions

The following functions are currently not integrated into gulp-di, but you can
require them as following:

````js
const getPath = require('gulp-di/contrib/get-path');
const standardTask = require('gulp-di/contrib/standard-task');
````

#### getPath(_string_ key)

Returns a property specified by the given dot-delimited key:

````js
const data = {
  at : 1350506782000,
  ids : ['507f1f77bcf86cd799439011', '507f191e810c19729de860ea']
};

let PI = getPath(Math, 'PI');
let at = getPath(data, 'at'));
let firstId = getPath(data, 'ids.0');
````

#### standardTask(_string_ name, _string_ src, _string_ dest, ...)

Generates a default task, assuming you want to pipe _src_ through the plugin specified by _name_ to _dest_. All parameters following "dest" are serialized if necessary and passed
to the plugin.

Using this method, you will just need to install a gulp plugin with npm and set
up a task as following:

````js
let taskFn = standardTask('jade', 'templates/**/*.jade', 'public', { pretty : false });

// Register the task function
di.task(taskFn);

console.log(taskFn.toString());

function jadeTask(gulp, jade) {
  /**
   * Generated task function, registers a "jade" task.
   * @param {object} gulp The current gulp instance
   * @param {jade} jade The "jade" gulp plugin
   */

  gulp.task("jade", () => {
     /**
      * jade task, declared at 10-contrib.js:44
      */
    return gulp.src("templates/**/*.jade")
    .pipe(jade({"pretty":false}))
    .pipe(gulp.dest("public"));
  });
}
````

## FAQ

### How do I insert tasks? Gulp claims "Task 'default' is not in your gulpfile" all the time!

Please call the resolve() method after all of your module and task declarations.

### gulp-di does not find my module!

In order to make your gulp plugins available, gulp-di uses
[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) internally
by default.

The default pattern is ['gulp-*', 'gulp.*', '!gulp-di']. You need to initialize
gulp-di using the "options" object in order to make plugins with arbitrary names
available:

````js
const gulp = require('gulp');
let di = require('gulp-di')(gulp, {
  pattern : ['gulp-*', 'gulp.*', '!gulp-di', 'webpack-stream']
});

di.task((webpackStream) => {
  gulp.task('webpack', () => {
    return gulp.src('src/client.js')
    .pipe(webpackStream({ output : { filename : '[name].js' }}))
    .pipe(gulp.dest('public'));
  });
});

di.resolve();

````

### Is it possible to add tasks asynchronously?

No, you will need to set up asynchronous tasks which depend on each other in
order to perform asynchronous tasks. Nevertheless, all tasks must be declared
synchronously in order to use Gulp correctly.

### I dislike the camelCaseName of my favorite module, can I change it?

Using [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins), you
can change the assigned name for arbitrary modules.

#### Using a ``rename`` object:

````js
let di = require('gulp-di')(gulp, {
  rename : {
    webpackStream : 'webpack'
  }
});
````

#### Using a ``renameFn``:
````js
let replacements = { webpackStream : 'webpack'};
let di = require('gulp-di')(gulp, {
  renameFn : (key) => return replacements[key]
});
````

## Changelog

0.0.31 - 03/13/2016

  - options.argv for "runningTasks" test
  - options.parentDir
  - updating documentation
  - extending test suite, adding code coverage report

0.0.3 - 03/12/2016

  - ES2015 rewrite
  - CI using Travis
  - using and providing [lodash](https://github.com/lodash/lodash) by default
  - Adding "standardTask" and "getPath" helpers
  - supporting [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins)'s lazy loading of gulp plugins

0.0.2 - 02/01/2016

  - Updating dependencies
  - Adding "runningTasks" helper function
  - Exposing gulp-util as "gutil" by default
  - Parsing of multi-line comments rewritten
  - added new options : noModules, noBuiltin, noRunningTasks
  - ES2015+ support with [parse-function](https://github.com/tunnckoCore/parse-function)

0.0.1 - 12/20/2015

  - Initial release, incorporating Resolver and tests from [dijs](https://www.npmjs.com/package/dijs).

## Licence

MIT
