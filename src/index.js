var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    fontCarrier = require('font-carrier');

var font = fontCarrier.create();

// var config = {
//     fontDir: 'fonts',
//     fontName: 'iconfont',
//     cssName: 'iconfont.css',
//     embeddedCssName: 'iconfont-embedded.css',
//     demoHtml: 'demo.html'
// };

// 读取所有 svg, 并且自定义 content

var svgCnt = 4095; // \ffff

function generateFonts(conf) {
    var svgPath = conf.svgPath;
    var output = path.join(conf.output, conf.fontDir);
    var files = fs.readdirSync(svgPath),
        iconContent,
        iconNames = [],
        iconContents = [],
        svgsObj = {};

    files = files.filter(item => path.extname(item) == '.svg');
    if (typeof conf.sort === 'function') {
        files = conf.sort(files);
    }

    files.forEach(function(file, index) {
        iconContent = generateIconContent(svgCnt--);
        iconNames.push(path.basename(file, '.svg'));
        iconContents.push(iconContent);
        svgsObj[iconContent] = fs.readFileSync(path.join(svgPath, file)).toString();
    });

    font.setSvg(svgsObj);

    // output 目录不存在
    mkdirp.sync(output);

    // 导出字体
    var fontContent = font.output({
        path: path.join(output, conf.fontName)
    });

    return {
        fontContent: fontContent,
        iconNames: iconNames,
        iconContents: iconContents
    }
}

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

// 生成 icon 样式
function generateCss(iconNames, iconContents, config, fontContent) {
    var output = path.join(config.output, config.fontDir, config.cssName);
    var fontBase64 = file2Base64(fontContent);
    var content = [];
    let t = new Date().getTime();
    content.push('@font-face { ');
    content.push('font-family: "' + config.fontName + '";src: url("' + config.fontName + '.eot?t=' + t + '");');
    content.push('src: url("' + config.fontName + '.eot?t=' + t + '#iefix") format("embedded-opentype"),');
    content.push('url("data:application/x-font-woff;charset=utf-8;base64,' + fontBase64 + '") format("woff");}');
    // content.push('url("./' + config.fontDir + '/' + config.fontName + '.woff") format("woff"),');
    content.push('url("' + config.fontName + '.ttf?t=' + t + '") format("truetype"),');
    content.push('url("' + config.fontName + '.svg?t=' + t + '#' + config.fontName + '") format("svg");}');
    content.push('.' + config.iconClass + '{font-family:"' + config.fontName + '" !important;font-size:' + config.font + ';font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing: grayscale;}');
    iconNames.forEach(function(iconName, index) {
        iconContents[index] = iconContents[index].replace('&#xf', '\\f');
        content.push('.' + config.classPrefix + iconName + ':' + config.pseudo + '{content: "' + iconContents[index] + '";}');
    });
    fs.writeFileSync(output ? output : 'iconfont.css', content.join('\r\n'));
}

// 生成 demo 页面
function generateDemo(iconNames, config) {
    var output = config.output;
    var content = [];
    content.push('<!DOCTYPE html>\r\n<html lang="en">\r\n<head>\r\n<meta charset="UTF-8">\r\n<title>iconfont demo</title>');
    content.push('<link href="' + config.fontDir + '/' + config.cssName + '" rel="stylesheet" type="text/css" /> ');
    content.push('</head>\r\n<body>')

    iconNames.forEach(function(iconName, index) {
        content.push('<i class="' + config.iconClass + ' ' + config.classPrefix + iconName + '"></i>');
    });
    content.push('</body>\r\n</html>')

    fs.writeFileSync(path.join(output, config.demoHtml), content.join('\r\n'));
}

// 文件转化成base64
function file2Base64(fontContent) {
    var base64 = new Buffer(fontContent.ttf).toString('base64');
    return base64;
}

// 字体文件base64引入
function generateBase64Css(iconNames, iconContents, config, fontContent) {
    var output = config.output;
    var fontBase64 = file2Base64(fontContent);

    var content = [];
    content.push('@font-face { ');
    content.push('font-family: "' + config.fontName + '";');
    content.push('src: url("data:application/octet-stream;base64,' + fontBase64 + '") format("truetype");}');
    content.push('.' + config.iconClass + '{font-family:"' + config.fontName + '";font-size' + config.font + ';font-style:normal;}');
    iconNames.forEach(function(iconName, index) {
        iconContents[index] = iconContents[index].replace('&#xf', '\\f');
        content.push('.' + config.classPrefix + iconName + ':' + config.pseudo + '{content: "' + iconContents[index] + '";}');
    });
    fs.writeFileSync(path.join(output, config.embeddedCssName), content.join('\r\n'));
}

function extend(target, source, isOverrider) {
    for (var key in source) {
        if (typeof target[key] === 'undefined' || isOverrider) {
            target[key] = source[key];
        }
    }
    return target;
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
 *     sort: function, 自定义产出字体排序，默认按照文件排序
 *     pseudo: 'after', 伪类，默认 after
 * }
 */
function parse(options) {
    if (!options || !options.svgPath) return;
    options.output = options.output || 'output';
    if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output);
    }

    let config = extend({
        fontDir: 'fonts',
        fontName: 'iconfont',
        cssName: 'iconfont.css',
        font: '14px',
        embeddedCssName: 'iconfont-embedded.css',
        demoHtml: 'demo.html',
        hasDemo: false,
        pseudo: 'after',
        hasEmbedded: false,
        iconClass: 'icon-font',
        classPrefix: 'i-'
    }, options, true);


    var results = generateFonts(config)
    generateCss(results.iconNames, results.iconContents, config, results.fontContent);
    if (config.hasDemo) {
        generateDemo(results.iconNames, config);
    }
    if (config.hasEmbedded) {
        generateBase64Css(results.iconNames, results.iconContents, config, results.fontContent);
    }
    return results;
}


module.exports = {
    parse: parse
}