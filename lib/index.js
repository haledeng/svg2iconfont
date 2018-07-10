'use strict';

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    fontCarrier = require('font-carrier');

var fontC = fontCarrier.create();

var defaultConfig = {
    // 字体文件夹名称
    fontDir: 'fonts',
    // 字体名
    fontName: 'iconfont',
    // css 文件名
    cssName: 'iconfont.css',
    // 字体大小
    font: '14px',
    // demo 页面名称
    demoHtml: 'demo.html',
    // 是否生成 demo 页面
    hasDemo: false,
    // 伪类
    pseudo: 'after',
    iconClass: 'icon-font',
    // 类名前缀
    classPrefix: 'i-'
};

// 读取所有 svg, 并且自定义 content

var svgCnt = 4095; // \ffff

/**
 * extract all svg file name from svg path.
 */
var extractSvg = function extractSvg(conf) {
    var svgPath = conf.svgPath;

    if (!svgPath) return console.log('`svgPath` must be provided');
    var files = fs.readdirSync(svgPath);
    files = files.filter(function (item) {
        return path.extname(item) === '.svg';
    });
    return files;
};

// 十进制 转 16进制
function decimal2Hex(n) {
    var hex = n.toString(16);
    hex = '000'.substr(0, 3 - hex.length) + hex;
    return hex;
}

// 生成 icon 对应的 content
function generateIconContent(n) {
    return '&#xf' + decimal2Hex(n);
}

var generateCss = function generateCss(files, conf) {
    var svgsObj = {};
    var fontName = conf.fontName,
        iconClass = conf.iconClass,
        font = conf.font,
        svgPath = conf.svgPath,
        pseudo = conf.pseudo,
        classPrefix = conf.classPrefix,
        output = conf.output,
        fontDir = conf.fontDir,
        cssName = conf.cssName;
    // all icon class icon

    var iconsContent = [];
    files.forEach(function (file) {
        var iconName = path.basename(file, '.svg');
        var iconContent = generateIconContent(svgCnt--);
        svgsObj[iconContent] = fs.readFileSync(path.join(svgPath, file)).toString();
        iconsContent.push(`.${classPrefix}${iconName}:${pseudo}{content: "${iconContent.replace('&#xf', '\\f')}";}`);
    });

    fontC.setSvg(svgsObj);
    // 导出目录
    var outputPath = path.join(output, fontDir);

    // output 目录不存在
    mkdirp.sync(outputPath);

    // 导出字体
    var fontContent = fontC.output({
        // 导出字体路径
        path: path.join(outputPath, fontName)
    });

    var fontBase64 = file2Base64(fontContent.woff);

    var t = new Date().getTime();
    // 通用字体
    var content = [];
    content.push('@font-face { ');
    content.push(`font-family: "${fontName}";src: url("${fontName}.eot?t=${t}");`);
    content.push(`src: url("${fontName}.eot?t=${t}#iefix") format("embedded-opentype"),`);
    content.push(`url("data:application/x-font-woff;charset=utf-8;base64,${fontBase64}") format("woff"),`);
    // content.push('url("./' + config.fontDir + '/' + config.fontName + '.woff") format("woff"),');
    content.push(`url("${fontName}.ttf?t=${t}") format("truetype"),`);
    content.push(`url("${fontName}.svg?t=${t}#${fontName}") format("svg");}`);
    content.push(`.${iconClass}{font-family:"${fontName}" !important;font-size:${font};font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing: grayscale;}`);

    fs.writeFileSync(path.join(outputPath, cssName), content.join('\r\n') + iconsContent.join('\r\n'));
};

// 生成 demo 页面
var generateDemo = function generateDemo(files, config) {
    var content = [];
    content.push('<!DOCTYPE html>\r\n<html lang="en">\r\n<head>\r\n<meta charset="UTF-8">\r\n<title>iconfont demo</title>');
    content.push(`<link href="${config.fontDir}/${config.cssName}" rel="stylesheet" type="text/css" />`);
    content.push('</head>\r\n<body>');

    files.forEach(function (file) {
        var iconName = path.basename(file, '.svg');
        content.push(`<i class="${config.iconClass} ${config.classPrefix}${iconName}"></i>`);
    });

    content.push('</body>\r\n</html>');
    fs.writeFileSync(path.join(config.output, config.demoHtml), content.join('\r\n'));
};

// 文件转化成base64
function file2Base64(fontContent) {
    var base64 = new Buffer(fontContent).toString('base64');
    return base64;
}

// 导出接口
// svgPath : svg 路径
// output : 产出目录
/**
 * options = {
 *     svgPath: svg, svg 路径
 *     output: 'output', 产出目录
 *     font: 14px, 字体大小，默认14px
 *     hasDemo: false, 是否产出 demo 页面
 *     pseudo: 'after', 伪类，默认 after
 * }
 */
function parse(options) {
    if (!options || !options.svgPath) return;
    options.output = options.output || 'output';
    if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output);
    }

    var config = Object.assign(defaultConfig, options);

    var files = extractSvg(config);
    generateCss(files, config);
    if (config.hasDemo) {
        generateDemo(files, config);
    }
}

module.exports = {
    parse: parse
};