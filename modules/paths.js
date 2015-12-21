module.exports = function (basePath) {
  return {
    specs : basePath('specs', '**/*.js'),
    src : [
      basePath('index.js'),
      basePath('lib/**/*.js'),
      basePath('contrib/**/*.js')
    ],
    tasks : [
      basePath('tasks/**/*.js')
    ]
  };
};