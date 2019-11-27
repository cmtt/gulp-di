0.1.0 - 11/27/2019

  - Adapting to changes in gulp 4.0 (#9)
  - Removing CI tests for older Node.js versions below 5.x.
  - Removing support for Node below 9.x.

0.0.4 - 11/11/2016

  - task() and module() may take absolute or relative paths
  - using a fork of [node-introspect](https://github.com/orzarchi/node-introspect.git) instead of [parse-function](https://github.com/tunnckoCore/parse-function)
  - adopting [https://github.com/Flet/semistandard](semistandard) style

0.0.33 - 05/03/2016

  - Updating depencendies and adapting to changes

0.0.32 - 04/02/2016

  - Correcting an example in this file

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