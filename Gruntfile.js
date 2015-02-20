module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true
      },
      source: ['src/*.js'],
      test: ['test/spec/*.js']
    }
  });
};