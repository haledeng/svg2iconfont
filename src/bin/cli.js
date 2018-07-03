#!/usr/bin/env node
var parser = require('../index');
var fs = require('fs');
var path = require('path');

function getJSON() {
	var jsonPath = path.dirname(__dirname) + '/package.json';
	if (fs.existsSync(jsonPath)) {
		var content = fs.readFileSync(jsonPath);
		content = JSON.parse(content);
		return content;
	}
	return {};
}


function index() {
	var argv = [].slice.call(process.argv, 2);
	var packageJson = getJSON();
	input = argv[0].toLowerCase();
	if (~input.indexOf('-v')) {
		console.log(packageJson.version);
	} else {
		parser.parse(argv[0], argv[1]);
	}
}

index();