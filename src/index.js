var fs = require('fs'),
    path = require('path'),
    fontCarrier = require('font-carrier');

var font = fontCarrier.create();

var config = {
    fontDir: 'fonts',
    fontName: 'iconfont',
    cssName: 'iconfont.css',
    embeddedCssName: 'iconfont-embedded.css',
    demoHtml: 'demo.html'
};

// 读取所有 svg, 并且自定义 content

var svgCnt = 4095; // \ffff

function generateFonts(svgPath, output){
    var files = fs.readdirSync(svgPath),
        iconContent,
        iconNames = [],
        iconContents = [],
        svgsObj = {};
    files.forEach(function(file, index){
        if(path.extname(file) == '.svg'){
            iconContent = generateIconContent(svgCnt--);
            iconNames.push(path.basename(file, '.svg'));
            iconContents.push(iconContent);
            svgsObj[iconContent] = fs.readFileSync(path.join(svgPath, file)).toString();
        }
    });
    font.setSvg(svgsObj);

    // output 目录不存在
    if(!fs.existsSync(output)){
        fs.mkdirSync(output);
    }

    // 导出字体
    var fontContent = font.output({
        path: path.join(output, config.fontName)
    });

    return  {
        fontContent: fontContent,
        iconNames: iconNames,
        iconContents: iconContents
    }
}

// 十进制 转 16进制
function decimal2Hex(n){
    var hex = n.toString(16);
    hex = '000'.substr(0, 3 - hex.length) + hex;
    return hex;
}

// 生成 icon 对应的 content
function generateIconContent(n){
    return '&#xf' + decimal2Hex(n);
}

// 生成 icon 样式
function generateCss(iconNames, iconContents, output){
    var content = [];
    content.push('@font-face { ');
    content.push('font-family: "' + config.fontName + '";src: url("./' + config.fontDir + '/' + config.fontName + '.eot");');
    content.push('src: url("./' + config.fontDir + '/' + config.fontName + '.eot?#iefix") format("embedded-opentype"),');
    content.push('url("./' + config.fontDir + '/' + config.fontName + '.woff") format("woff"),');
    content.push('url("./' + config.fontDir + '/' + config.fontName + '.ttf") format("truetype"),');
    content.push('url("./' + config.fontDir + '/' + config.fontName + '.svg#' + config.fontName + '") format("svg");}');
    content.push('.icon-font{font-family:"' + config.fontName + '";font-size:40px;font-style:normal;}');
    iconNames.forEach(function(iconName, index){
        iconContents[index] = iconContents[index].replace('&#xf', '\\f');
        // content.push('%i-' + iconName + '{\r\n\t&:after{\r\n\t\tcontent:"' + iconContents[index] + '";\r\n\t}\r\n}');
        content.push('.i-' + iconName + ':after{content: "' + iconContents[index] + '";}');
    });
    fs.writeFileSync(output ? output : 'platfont.css', content.join('\r\n'));
}

// 生成 demo 页面
function generateDemo(iconNames, output){
    var content = [];
    content.push('<!DOCTYPE html>\r\n<html lang="en">\r\n<head>\r\n<meta charset="UTF-8">\r\n<title>iconfont demo</title>');
    content.push('<link href="' + config.cssName + '" rel="stylesheet" type="text/css" /> ');
    content.push('</head>\r\n<body>')

    iconNames.forEach(function(iconName, index){
        content.push('<i class="icon-font i-' + iconName + '"></i>');
    });
    content.push('</body>\r\n</html>')

    fs.writeFileSync(path.join(output, config.demoHtml), content.join('\r\n'));
}

// 文件转化成base64
function file2Base64(fontContent){
    var base64 = new Buffer(fontContent.ttf).toString('base64');
    return base64;
}

// 字体文件base64引入
function generateBase64Css(iconNames, iconContents, output, fontContent){
    var fontBase64 = file2Base64(fontContent);

    var content = [];
    content.push('@font-face { ');
    content.push('font-family: "iconfont";');
    content.push('src: url("data:application/octet-stream;base64,' + fontBase64 + '") format("truetype");}');
    content.push('.icon-font{font-family:"iconfont";font-size:16px;font-style:normal;}');
    iconNames.forEach(function(iconName, index){
        iconContents[index] = iconContents[index].replace('&#xf', '\\f');
        content.push('.i-' + iconName + ':after{content: "' + iconContents[index] + '";}');
    });
    fs.writeFileSync(path.join(output, config.embeddedCssName), content.join('\r\n'));
}

// 导出接口
// svgPath : svg 路径
// output : 产出目录
function parse(svgPath, output){
    if(!fs.existsSync(output)){
        fs.mkdirSync(output);
    }
    var results = generateFonts(svgPath, path.join(output, config.fontDir))
    generateCss(results.iconNames, results.iconContents, path.join(output, config.cssName));
    generateDemo(results.iconNames, output);
    generateBase64Css(results.iconNames, results.iconContents, output, results.fontContent);
    return results;
}   


module.exports = {
    parse: parse
}