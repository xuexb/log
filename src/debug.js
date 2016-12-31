/**
 * @file 日志debug模块
 * @author xiaowu <fe.xiaowu@gmail.com>
 * @requires ./index.js
 */

(function (window, $, Log) {
    'use strict';

    /**
     * 标识
     *
     * @example
     *     1 - 默认, 只报严重错误
     *     2 - 打印所有信息
     * @type {string}
     */
    var debug = (function () {
        var value = (location.search.substr(1).match(/(?:^|&)log\.debug=(.+?)(?:$|&)/) || ['', '1'])[1];

        // 如果不在白名单
        if ($.inArray(value, ['1', '2']) === -1) {
            value = '1';
        }

        return value;
    })();

    var mock = function (name, callback) {
        var old = Log[name];

        Log[name] = function () {
            var args = [].slice.call(arguments);

            callback(args, function () {
                old.apply(old, args);
            });
        };
    };

    // Log.create
    mock('create', function (args, next) {
        var options = args[0];

    });

    // 幅值到全局对象上
    Log.debug = debug;

    console.info('日志调试模式: ' + ['', '只报错误', '显示全部信息'][debug]);
})(window, window.$, window.Log);
