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

/**
 * extract all svg file name from svg path.
 */
const extractSvg = (conf) => {
    let {
        svgPath
    } = conf;
    if (!svgPath) return console.log('`svgPath` must be provided');
    let files = fs.readdirSync(svgPath);
    files = files.filter(item => path.extname(item) === '.svg');
    return files;
};



function generateFonts(conf) {
    let output = path.join(conf.output, conf.fontDir);
    let {
        svgPath
    } = conf;
    var iconContent,
        iconNames = [],
        iconContents = [],
        svgsObj = {};


    let files = extractSvg(conf);

    if (typeof conf.sort === 'function') {
        files = conf.sort(files);
    }

    files.forEach((file) => {
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
    };
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


const generateCss = (files, conf) => {
    let svgsObj = {};
    let {
        fontName,
        iconClass,
        font,
        svgPath,
        pseudo,
        classPrefix,
        output,
        fontDir
    } = conf;
    // all icon class icon
    let iconsContent = [];
    files.forEach(file => {
        let iconName = path.basename(file, '.svg');
        let iconContent = generateIconContent(svgCnt--);
        svgsObj[iconContent] = fs.readFileSync(path.join(svgPath, file)).toString();
        iconsContent.push(`.${classPrefix}${iconName}:${pseudo}{content: "${iconContent.replace('&#xf', '\\f')}";}`);
    });


    font.setSvg(svgsObj);
    // 导出目录
    let outputPath = path.join(output, fontDir);

    // output 目录不存在
    mkdirp.sync(outputPath);

    // 导出字体
    var fontContent = font.output({
        // 导出字体路径
        path: path.join(outputPath, fontName)
    });

    var fontBase64 = file2Base64(fontContent.woff);

    // 通用字体
    let content = [];
    content.push('@font-face { ');
    content.push(`font-family: "${fontName}";src: url("${fontName}.eot?t=${t}");`);
    content.push(`src: url("${fontName}.eot?t=${t}#iefix") format("embedded-opentype"),`);
    content.push(`url("data:application/x-font-woff;charset=utf-8;base64,${fontBase64}") format("woff"),`);
    // content.push('url("./' + config.fontDir + '/' + config.fontName + '.woff") format("woff"),');
    content.push(`url("${fontName}.ttf?t=${t}") format("truetype"),`);
    content.push(`url("${fontName}.svg?t=${t}#${fontName}") format("svg");}`);
    content.push(`.${iconClass}{font-family:"${fontName}" !important;font-size:${font};font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing: grayscale;}`);

    fs.writeFileSync(output ? output : 'iconfont.css', content.join('\r\n') + iconsContent.join('\r\n'));
};


// 生成 icon 样式
function generateCss(iconNames, iconContents, config, fontContent) {
    // css directory
    var output = path.join(config.output, config.fontDir, config.cssName);
    // base64 content
    var fontBase64 = file2Base64(fontContent.woff);
    let {
        fontName,
        iconClass,
        font,
        classPrefix,
        pseudo
    } = config;

    var content = [];
    let t = new Date().getTime();
    content.push('@font-face { ');
    content.push(`font-family: "${fontName}";src: url("${fontName}.eot?t=${t}");`);
    content.push(`src: url("${fontName}.eot?t=${t}#iefix") format("embedded-opentype"),`);
    content.push(`url("data:application/x-font-woff;charset=utf-8;base64,${fontBase64}") format("woff"),`);
    // content.push('url("./' + config.fontDir + '/' + config.fontName + '.woff") format("woff"),');
    content.push(`url("${fontName}.ttf?t=${t}") format("truetype"),`);
    content.push(`url("${fontName}.svg?t=${t}#${fontName}") format("svg");}`);
    content.push(`.${iconClass}{font-family:"${fontName}" !important;font-size:${font};font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing: grayscale;}`);
    iconNames.forEach((iconName, index) => {
        iconContents[index] = iconContents[index].replace('&#xf', '\\f');
        content.push(`.${classPrefix}${iconName}:${pseudo}{content: "${iconContents[index]}";}`);
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
    var base64 = new Buffer(fontContent).toString('base64');
    return base64;
}

// 字体文件base64引入
function generateBase64Css(iconNames, iconContents, config, fontContent) {
    var output = config.output;
    var fontBase64 = file2Base64(fontContent.ttf);

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

    let config = Object.assign({
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
    }, options);


    // var results = generateFonts(config)
    let files = extractSvg(conf);
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