/**
 * @file 日志debug模块
 * @author xiaowu <fe.xiaowu@gmail.com>
 */

(function (window, $, Log) {
    'use strict';

    var debug = {};

    /**
     * 标识
     *
     * @example
     *     1 - 默认, 只报严重错误
     *     2 - 打印所有信息
     * @type {string}
     */
    debug.type = (function () {
        var value = (location.search.substr(1).match(/(?:^|&)log\.debug=(.+?)(?:$|&)/) || ['', '1'])[1];

        // 如果不在白名单
        if ($.inArray(value, ['1', '2']) === -1) {
            value = '1';
        }

        return value;
    })();

    /**
     * 输出日志信息
     *
     * @param  {any} data   输出数据
     * @param  {string} [level=error] 类型, 如果是error则都输出, 如果为warning则只在[打印全部信息]时输出
     */
    debug.log = function (data, level) {
        if (level === 'error' || !level) {
            console.error(data);
        }
        else if (level === 'warning' && debug.type === '2') {
            console.warn(data);
        }

    };
    if (!window.console) {
        debug.log = $.noop || function () {};
    }

    /**
     * 拦截数据
     *
     * @param  {string}   name     名字
     * @param  {Function} callback 回调, 参数1是args, 参数2是下一步
     */
    debug.mock = function (name, callback) {
        var old;
        var type = name.split('.')[0].toLowerCase();
        var fn = function () {
            var context = this;
            var args = [].slice.call(arguments);

            callback.apply(null, args);

            return old.apply(context, args);
        };

        name = name.split('.')[1];

        if (type === 'log') {
            old = Log[name];
            Log[name] = fn;
        }
        else if (type === 'class') {
            old = Log.Class.prototype[name];
            Log.Class.prototype[name] = fn;
        }

    };

    // Log.create
    debug.mock('Log.create', function (options) {
        if (!options) {
            debug.log('Log.create options 不能为空');
        }
        else if (!$.isPlainObject(options)) {
            debug.log('Log.create options 不为对象');
        }
        else if (!options.img) {
            debug.log('Log.create options.img 不能为空');
        }
        else if (!options.global) {
            debug.log('Log.create options.global 全局参数为空', 'warning');
        }

    });

    // Class.send
    debug.mock('Class.send', function (options) {});

    // 幅值到全局对象上
    Log.debug = debug;

    console.info('日志调试模式: ' + ['', '只报错误', '显示全部信息'][debug.type]);
})(window, window.$, window.Log);
