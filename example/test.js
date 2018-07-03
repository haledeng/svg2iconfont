var icon = require('../src/index');

icon.parse({
	svgPath: './svg', 
	output: './output',
	pseudo: 'before',
	sort: function(icons) {
		let ret = [];
		ret[0] = icons[2];
		ret[1] = icons[1];
		ret[2] = icons[0];
		return ret;
	},
	iconClass: 'bat-iconfont',
	fontName: 'bat-iconfont'
});