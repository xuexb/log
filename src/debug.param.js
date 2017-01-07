/**
 * @file 日志debug模块
 * @author xiaowu <fe.xiaowu@gmail.com>
 */

(function (window, $, Log) {
    'use strict';

    var debug = window.Log.debug || (window.Log.debug = {});

    debug.param = {
        a: {
            required: true,
            text: '测试a',
            type: 'RegExp',
            value: '^[1-9]$'
        },
        b: {
            text: '测试b',
            type: 'String',
            value: '123'
        },
        c: {
            required: true,
            text: '测试d',
            type: 'Array',
            value: '1,2,3,4'
        }
    };
})(window, window.$, window.Log);
