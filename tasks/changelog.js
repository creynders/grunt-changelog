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

	grunt.registerMultiTask('changelog', 'Creates a list of changes based on a git log.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			after: moment().subtract('days', 7).format(),
			before: moment().format(),
			featureRegex: /^(.*)closes #\d+:?(.*)$/gim,
			bugRegex: /^(.*)fixes #\d+:?(.*)$/gim,
			dest: 'changelog.txt'
		});

		grunt.verbose.writeflags(options, 'Options');

		var done = this.async();
		var args = ['log', '--pretty=format:%s', '--no-merges'];

		args.push('--after="' + options.after + '"');
		args.push('--before="' + options.before + '"');

		grunt.verbose.writeln('git ' + args.join(' ') + '\n' );

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

				var output = '';

				function getChanges(regex) {
					var changes = '';
					var match;

					while ((match = regex.exec(result))) {
						var change = '';

						for (var i = 1, len = match.length; i < len; i++) {
							change += match[i];
						}

						changes += '  - ' + change.trim() + '\n';
					}

					if (changes)
						return changes + '\n';
					else
						return '  (none)\n\n';
				}

				output += 'NEW:\n\n';
				output += getChanges(options.featureRegex);

				output += 'FIXES:\n\n';
				output += getChanges(options.bugRegex);

				grunt.file.write(options.dest, output);

				grunt.log.ok(output);
				grunt.log.writeln();
				grunt.log.ok('Changelog written to '+ options.dest);

				done();
			}
		);
	});

};
