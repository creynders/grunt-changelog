/*
* grunt-changelog
* https://github.com/ericmatthys/grunt-changelog
*
* Copyright (c) 2013 Eric Matthys
* Licensed under the MIT license.
*/

'use strict';

module.exports = function (grunt) {

	var moment = require('moment');

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('changelog', 'Creates a list of changes based on a git log.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			after: moment().subtract('days', 7).format(),
			before: moment().format(),
			featureRegex: /([^\n]*)closes #\d+([^\n]+)*/gi,
			bugRegex: /([^\n]*)closes #\d+([^\n]+)*/gi,
			dest: 'changelog.txt'
		});

		grunt.log.writeflags(options, 'Options');

		var done = this.async();
		var args = ['log', '--pretty=format:%s', '--no-merges'];

		args.push('--after="' + options.after + '"');
		args.push('--before="' + options.before + '"');

		grunt.log.writeln('git ' + args.join(' ') + '\n' );

		grunt.util.spawn(
			{
				cmd: 'git',
				args: args
			},

			function (error, result) {
				if (error) {
					grunt.log.error(error);
					return done(false);
				}

				var match;

				while ((match = options.featureRegex.exec(result))) {
					grunt.log.ok('match');
					grunt.log.writeflags(match);
				}

				grunt.file.write(options.dest, result);
				grunt.log.ok('Changelog written to '+ options.dest);

				done();
			}
		);
	});

};