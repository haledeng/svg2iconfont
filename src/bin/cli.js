#!/usr/bin/env node
var parser = require('../index');
var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;

parser.parse(argv);


