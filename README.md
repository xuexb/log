# log

> 前端日志的研究

[![code style fecs](https://img.shields.io/badge/code%20style-fecs-brightgreen.svg)](https://github.com/ecomfe/fecs)
[![Build Status](https://travis-ci.org/xuexb/log.svg?branch=master)](https://travis-ci.org/xuexb/log)
[![Test Coverage](https://img.shields.io/coveralls/xuexb/log/master.svg)](https://coveralls.io/r/xuexb/log)
[![MIT license](https://img.shields.io/github/license/xuexb/log.svg)](https://github.com/xuexb/log)

## Topic1: Log lib

### 思路

前端日志只是使用`js`往服务器上发送条请求, 大多情况是以`图片`为请求, 有体积小、响应快等特点. 在页面创建一个日志实例, 调用`send`方法可发送日志请求, 如:

```js
var page = Log.create(图片地址);
page.send('id', 1);
```

### 特点

- 使用简单
- 空参数过滤
- 线下地址 - 对线下环境添加`debug.js`, 可以修改为线下地址
- 统一`urlencode`

### 开发环境

在开发环境下可把`debug.js`引用加载, 可以对空参数、参数超长、链接超长校验. 而参数的值是否符合预期, 没有做校验, 当然如果有对应的参数规范平台也可以在`debug.js`里校验.

方向 | 线上环境 | 开发环境
--- | --- | ---
目标 | 容错高、稳定 | 有问题及时提示
空参数 | 过滤 | 过滤并提示
超长参数、请求超长 | 通过 | 通过并提示
重复参数 | 通过 | 通过并提示
`urlencode` | 通过 | 通过并提示

### Api

```js
/**
 * 创建日志
 *
 * @param {string} url gif图链接
 * @param {Object} options 日志全局参数
 *
 * @return {Object} 实例对象
 */
Log.create(url, options);

/**
 * 发送日志
 *
 * @param  {Object|string} key   参数key或者数据对象, 会把全局里同名参数覆盖. 如果不是对象, 只能是string
 * @param  {string|undefined} value 参数值
 *
 * @return {Object}       this
 */
#send(key, value);
```

### 例子

```js
// 页面a的点击日志
var clickLog = Log.create('/日志.gif', {
    page: 'a',
    type: 'click'
});

// 页面a的pv日志
var pvLog = Log.create('/日志.gif', {
    page: 'a',
    type: 'pv'
});


// 发送点击日志
clickLog.send({
    id: 1,
    width: 120
});
clickLog.send('xxxx', 1);

// 发送pv日志
pvLog.send({
    id: 1
});
pvLog.send('xxxx', 1);
```

### 问题

#### 1. 如何保证参数正确

可以在`debug.js`里针对开发环境对参数进入逐一的校验, 或者在开发环境把图片地址修改为线下地址, 使用日志监控分析工具实时的处理线下图片地址

#### 2. 如何自动化测试

由于日志很多都是交互时触发, 可使用模拟交互行为的工具, 如: `selenium`

#### 3. 发送日志的格式、时机

目前只支持一维`json`对象发送, 会把值当前`string`发送, 在调用`send`时发送, 后续考虑多维度`json`结构

#### 4. 采集信息?

目前只是一个简单的`send`库, 没有主动的收集用户信息, 如滚动监听、屏幕信息等, 后续考虑

## Topic2: 用户行为收集

1. 记录用户停留时长
1. 自动发送, 自动调整发送时机
2. 可`mark`的动作:
    1. 按时间点
    2. 停留时长
    2. 取值最大
    3. 取值最小
1. 默认监听的行为
    1. scroll
    2. resize
    3. focus
    4. blur
    5. visibilitychange
1. 提供`cli`命令解析日志, 并支持绘画出用户在页面内的行为
2. 提供`alias`接口设置字段别名, 优化日志体积

```js
const App = Log(options);

// 开始记录首页日志
App.use('index.html');

// 普通打点, 只记录打点时间
App.mark('DOM_READY');

// 普通打点, 只记录打点时间
App.mark('ON_LOAD');

// 记录用户浏览深度 + 浏览轨迹
let scrollTimer = null;
$(window).on('scroll.log', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
        App.mark('READ_HEIGHT', window.scrollY);
        App.mark('MAX_HEIGHT', window.scrollY, Log.markType.MAX);
    }, 300);
});

// 以文章id来统计文章的浏览时长
page.on('文章切换', () => {
    App.mark('ARTICLE_ID', page.article_id, Log.markType.TIME);
});

// 统计文章分页切换时间点
page.on('文章翻页', () => {
    App.mark('ARTICLE_PAGE', page.current_page);
});


```