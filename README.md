# svg2iconfont
将 svg 转化成 iconfont。

### 安装
```
npm install svg2iconfont
```

### 使用
```
var parser = require('svg2iconfont');

parser.parse(options);
// 配置项目
options = {
	// [必填] svg 路径
    svgPath: svg,
    // [可选] 产出目录，默认当前目录的 output
    output: 'output', 
    // [可选] 字体大小，默认14px
    font: 14px, 
    // [可选] 是否产出 demo 页面
    hasDemo: false, 
    // [可选] 伪类，默认 after
    pseudo: 'after', 
}
```


### CLI 方式
```
npm i -g svg2iconfont
// 参数同上，参数格式 --参数名=参数值
svg2iconfont --svgPath=svg --output=output pseudo=before
```

