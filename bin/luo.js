#!/usr/bin/env node

const program = require('commander')
const listOption = require("../options");

program
    .version(`Version is ${require('../package.json').version}`)
    .description('A simple CLI for building initialize project include Wechat applet, Vue, Egg (nodejs)')
    .usage('<command> [options]')
    .command('create', "initialize project include Wechat applet, Vue, Egg (nodejs)")
    .option("-l --list", "project list", listOption)
    .parse(process.argv)