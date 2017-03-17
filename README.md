# log

> 前端日志`lib`的研究

[![code style fecs](https://img.shields.io/badge/code%20style-fecs-brightgreen.svg)](https://github.com/ecomfe/fecs)
[![Build Status](https://travis-ci.org/xuexb/log.svg?branch=master)](https://travis-ci.org/xuexb/log)
[![Test Coverage](https://img.shields.io/coveralls/xuexb/log/master.svg)](https://coveralls.io/r/xuexb/log)
[![MIT license](https://img.shields.io/github/license/xuexb/log.svg)](https://github.com/xuexb/log)

### 特点

- 使用简单
- 空参数过滤
- 线下地址 - 对线下环境添加`debug.js`, 可以修改为线下地址
- 统一`urlencode`

### 思路

前端日志只是使用`js`往服务器上发送条请求, 大多情况是以`图片`为请求, 有体积小、响应快等特点. 在页面创建一个日志实例, 调用`send`方法可发送日志请求, 如:

```js
var page = Log.create(图片地址);
page.send('id', 1);
```

### 开发环境

在开发环境下可把`debug.js`加载引用, 可以对空参数、参数超长、链接超长校验. 而参数的值是否符合预期, 没有做校验, 当然如果有对应的参数规范平台也可以在`debug.js`里校验.

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
 * @param  {Object|string} key   参数key或者数据对象, 会把全局里同名参数覆盖
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