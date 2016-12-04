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
//  .option('-a, --auth-output <filename>', 'What to save the new cover letter as')
//  .option('-o, --output <filename>', 'What to save the new cover letter as')

program
  .command('authenticate')
  .description('Obtain and save OAuth2 token')
  //.option("-D", "delete currently saved auth token", lj.deleteToken())
  //.option('-o, --output <directory>', 'where to save auth token')
  .action(function(result){
    //console.log(result)
    lj.authorize()
})

program
  .command('generate')
  .arguments('<company_name> <company_position>')
  .action((company, position) => {
    lj.generate(company, position)
})

program.parse(process.argv)
if (!program.args.length) program.help()