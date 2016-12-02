#!/usr/bin/env node
var lj = require('./src/letterjen');
var program = require('commander');
var pjson = require('./package.json');
var chalk = require('chalk');
//console.log(pjson.version);

program
 .arguments('<file>')
 .option('-o, --output <filename>', 'What to save the new cover letter as')
 .option('-u, --username <username>', 'The user to authenticate as')
 .option('-p, --password <password>', 'The user\'s password')
 .option('-v, --version', 'See current version')
 .action(function(file) {
   console.log(chalk.bold.cyan('File downloaded.'));
})
.parse(process.argv);