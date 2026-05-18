module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "karma-chrome-launcher"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage")
    ],
    client: {
      jasmine: {
        random: false
      }
    },
    coverageReporter: {
      dir: require("path").join(__dirname, "coverage"),
      subdir: ".",
      reporters: [
        { type: "html" },
        { type: "text-summary" }
      ]
    },
    reporters: ["progress", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadless"],
    singleRun: false,
    restartOnFileChange: true
  });
};
