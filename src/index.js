/**
 * @file 研究日志
 * @author xiaowu <fe.xiaowu@gmail.com>
 */

(function (window, $) {
    'use strict';

    var Log = {
        version: '0.0.1'
    };

    /**
     * 日志构造函数
     *
     * @class
     * @param {Object} options 配置参数
     */
    Log.Class = function (options) {
        var self = this;

        // 合并参数
        self._options = $.extend(true, {}, Log.defaults, options);
    };

    $.extend(Log.Class.prototype, {

        /**
         * 发送日志
         *
         * @param  {Object|string} key   参数key或者数据对象
         * @param  {string|undefined} value 参数值
         *
         * @return {Object}       this
         */
        send: function (key, value) {
            var self = this;
            var data = {};

            if ($.isPlainObject(key)) {
                // 复制对象, 防止污染外部对象
                $.extend(data, key);
            }
            else {
                data[key] = value;
            }

            // 合并全局参数
            self._makeGlobal(data);

            // 立即发送日志
            self.sendImg(self._filter(data));

            return self;
        },

        _filter: function (data) {
            var res = {};

            $.each(data, function (key, value) {
                if (key && typeof value !== 'undefined') {
                    res[key] = value;
                }
            });

            return res;
        },

        /**
         * 合并全局参数
         *
         * @private
         * @param  {Object} target 合并源对象
         */
        _makeGlobal: function (target) {
            var data = this._options.global;

            $.each(data, function (key, val) {
                if ($.isFunction(val)) {
                    data[key] = val();
                }

            });

            $.extend(target, data);
        },

        /**
         * 发送图片
         *
         * @private
         * @param  {Object} data 日志参数
         */
        sendImg: function (data) {
            var key = Log.expando + (Log.guid++);

            // 这里一定要挂在window下
            // 在IE中，如果没挂在window下，这个img变量又正好被GC的话，img的请求会abort
            // 导致服务器收不到日志
            var img = window[key] = new Image();

            img.onload = img.onerror = img.onabort = function () {
                // 下面这句非常重要
                // 如果这个img很不幸正好加载了一个存在的资源，又是个gif动画
                // 则在gif动画播放过程中，img会多次触发onload
                // 因此一定要清空
                img.onload = img.onerror = img.onabort = null;

                // 清空window变量
                try {
                    delete window[key];
                }
                catch (e) {
                    window[key] = null;
                }

                // 下面这句非常重要
                // new Image创建的是DOM，DOM的事件中形成闭包环引用DOM是典型的内存泄露
                // 因此这里一定要置为null
                img = null;
            };

            // 一定要在注册了事件之后再设置src
            // 不然如果图片是读缓存的话，会错过事件处理
            // 最后，对于url最好是添加客户端时间来防止缓存
            // 同时服务器也配合一下传递Cache-Control: no-cache;
            img.src = this._options.img + '?' + $.param(data);
        }
    });

    /**
     * 全局唯一标识
     *
     * @type {number}
     */
    Log.guid = 0;

    /**
     * 全局key
     *
     * @type {string}
     */
    Log.expando = '__log__' + new Date().getTime();

    /**
     * 创建日志
     *
     * @param  {Object} options 配置对齐
     *
     * @return {Object}
     */
    Log.create = function (options) {
        return new Log.Class(options);
    };

    /**
     * 默认参数
     *
     * @type {Object}
     */
    Log.defaults = {
        img: '',
        global: {}
    };

    window.Log = Log;
})(window, window.$);
