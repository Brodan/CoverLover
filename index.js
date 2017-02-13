#!/usr/bin/env node

/**
 * Module dependencies.
 */
var lj = require('./src/letterjen');
var program = require('commander');
var pjson = require('./package.json');

program
  .description('A cover letter generator.')
  .version(pjson.version)

program
  .command('authenticate')
  .description('Obtain and save OAuth2 token')
  //.option('-o, --output <directory>', 'where to save auth token')
  .action(function(){
    //console.log(result)
    lj.authenticate()
  }).on('--help', function() {
    console.log('  Examples:');
  });

program
  .command('generate')
  .arguments('<company_name> <company_position>')
  //.option('-o, --output <directory>', 'where to save auth token')
  .action((company, position) => {
    lj.generate(company, position)
  })

program.parse(process.argv)
if (!program.args.length) program.help()