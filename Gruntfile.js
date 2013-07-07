'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            files: ['dist']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/jquery.popup.js', 'src/popup.keyboard.js', 'src/popup.slider.js', 'src/popup.thumb.js'],
                dest: 'dist/jquery.<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/jquery.<%= pkg.name %>.min.js'
            },
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            },
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test']
            },
        },

        // https://github.com/Darsain/grunt-tagrelease
        tagrelease: {
            file: 'package.json',
            commit:  true,
            message: 'Release %version%',
            prefix:  'v',
            annotate: false
        },

        // https://github.com/Darsain/grunt-bumpup
        bumpup: 'package.json',
        jsbeautifier: {
            files: ["Gruntfile.js", "src/**/*.js"],
            options: {
                // "indent_size": 4,
                // "indent_char": " ",
                // "indent_level": 0,
                "indent_with_tabs": true,
                "preserve_newlines": true,
                "max_preserve_newlines": 10,
                "jslint_happy": false,
                "brace_style": "collapse",
                "keep_array_indentation": false,
                "keep_function_indentation": false,
                "space_before_conditional": true,
                "eval_code": false,
                "indent_case": false,
                "unescape_strings": false
            }
        },
        recess: {
            core: {
                src: ["less/core.less", "less/WindowEffect.less"],
                dest: 'demo/css/core.css',
                options: {
                    compile: true
                }
            },
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-recess');

    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-bumpup');

    // Default task.
    grunt.registerTask('default', ['jshint', 'jsbeautifier', 'clean', 'concat', 'uglify']);

    grunt.registerTask('js', ['jsbeautifier', 'concat', 'uglify']);
    grunt.registerTask('css', ['recess']);
    grunt.registerTask('all', ['recess', 'jshint', 'jsbeautifier', 'concat', 'uglify']);

    // Release alias task
    grunt.registerTask('release', function (type) {
        type = type ? type : 'patch';
        grunt.task.run('jshint');         // Lint stuff
        grunt.task.run('uglify');         // Minify stuff
        grunt.task.run('bumpup:' + type); // Bump up the package version
        grunt.task.run('tagrelease');     // Commit & tag the changes from above
    });
};