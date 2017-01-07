/**
 * @file 日志debug模块
 * @author xiaowu <fe.xiaowu@gmail.com>
 */

(function (window, $, Log) {
    'use strict';

    /**
     * 验证参数
     *
     * @param  {string} value 日志的参数值
     * @param  {Object} data  规则数据
     *
     * @return {boolean}       是否通过
     */
    var validateParam = function (value, data) {
        var type = data.type.toLowerCase();
        var flag = false;

        // 如果是正则
        if (type === 'regexp' ) {
            flag = new RegExp(data.value.replace('\\', '\\\\')).test(value);
        }

        // 如果是数组则是包含就算
        else if (type === 'array') {
            // 因为indexOf不是隐式转换, 而值肯定是string, 这里先把数字转字符
            $.each(data.value.split(/\s*,\s*/), function (index, key) {
                if (key === value + '') {
                    flag = true;
                    return false;
                }
            });
        }

        // 否则全比较
        else {
            flag = value === data.value + '';
        }

        return flag;
    };

    var obj2Arr = function (obj) {
        var arr = [];
        $.each(obj, function (key, val) {
            arr.push($.extend({
                name: key
            }, val));
        });
        return arr;
    };

    /**
     * 验证
     *
     * @description
     *     1. 必选 + 无值 => false
     *     2. 必选 + 有值 => check
     *     3. 非必选 + 无值 => true
     *     4. 非必选 + 有值 => check
     * @param  {Object} target 参数对象
     *
     * @return {Object}
     */
    var validate = function (target) {
        var data = debug.param;
        var pass = {};
        var error = {};
        var add = {};

        // 先根据规则验证一遍
        $.each(data, function (key, val) {
            var param = target[key];
            var isNull = !target.hasOwnProperty(key);
            var result = $.extend({}, val, {
                param: param
            });

            // 如果必选且没有参数
            if (val.required && isNull) {
                result.status = 'error';
                error[key] = result;
                console.log('必须没有参数')
            }

            // 如果不为必选, 且没有参数则忽略
            else if (!val.required && isNull) {
                return;
            }

            else {
                if (validateParam(param, val)) {
                    result.status = 'pass';
                    pass[key] = result;
                }
                else {
                    result.status = 'error';
                    error[key] = result;
                }
            }

        });

        // 检查新增参数
        $.each(target, function (key) {
            // 如果已经处理过
            if (pass[key] || error[key] || add[key]) {
                return;
            }

            add[key] = {
                name: key,
                param: target[key],
                status: 'add'
            };
        });

        error = obj2Arr(error);
        add = obj2Arr(add);
        pass = obj2Arr(pass);

        return {
            add: add,
            error: error,
            pass: pass,
            all: [].concat(error, add, pass)
        };
    };

    var debug = Log.debug || (Log.debug = {});

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
            // throw new TypeError(data);
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

            callback.apply(context, args);

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
        if ('undefined' === typeof options) {
            debug.log('Log.create() 不能为空');
        }
        else if (!$.isPlainObject(options)) {
            debug.log('Log.create(' + String(options) + ') 不为对象');
        }
        else if (!options.img) {
            debug.log('Log.create({img}) 不能为空');
        }
        else if (!options.global) {
            debug.log('Log.create(options) 全局参数options.global为空', 'warning');
        }

    });

    // 检测全局覆盖时有没有参数重复
    debug.mock('Class._makeGlobal', function (data) {
        var options = this._options;

        $.each(options.global, function (key) {
            if (data.hasOwnProperty(key)) {
                debug.log([
                    'send里存在全局global里重复参数"' + key + '", ',
                    '参数值将由"' + data[key] + '"被覆盖为全局的"' + options.global[key] + '"'
                ].join(''), 'warning');
            }
        });
    });

    // Class.send
    debug.mock('Class.send', function (key, value) {
        var data = {};

        if (!key) {
            debug.log('send() 不能为空');
        }
        else if ($.isPlainObject(key)) {
            if ($.isEmptyObject(key)) {
                debug.log('send({}) 出现空参数', 'warning');
            }
            else {
                $.extend(data, key);
            }
        }
        else if ('string' === typeof key && 'undefined' === typeof value) {
            debug.log('send(key) 值不能为空');
        }
        else if ('string' !== typeof key) {
            debug.log('send(' + key + ') key不为string');
        }
        else {
            data[key] = value;
        }
    });

    // Class.sendImg
    debug.mock('Class.sendImg', function (data) {
        var result;

        if (debug.param) {
            result = validate(data);
            console.log(JSON.stringify(result, null, 4));
        }

        debug.log(window.JSON ? JSON.stringify(data, null, 4) : data, 'warning', $.param(data));
    });

    console.info('日志调试模式: ' + ['', '只报错误', '显示全部信息'][debug.type]);
})(window, window.$, window.Log);
