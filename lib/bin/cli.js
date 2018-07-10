#!/usr/bin/env node
'use strict';

var parser = require('../index');
var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;

parser.parse(argv);