module.exports = (basePath) => {
  return {
    specs: basePath('specs', '**/*.js'),
    src: [
      basePath('index.js'),
      basePath('lib/**/*.js'),
      basePath('contrib/**/*.js')
    ],
    istanbul: [
      basePath('index.js'),
      basePath('lib/**/*.js'),
      basePath('contrib/**/*.js')
    ],
    docs: [
      basePath('lib/**/*.js')
    ],
    tasks: [
      basePath('tasks/**/*.js')
    ]
  };
};
