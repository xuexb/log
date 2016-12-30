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
    function Main(options) {
        var self = this;

        // 合并参数
        self._options = $.extend(true, {}, Log.defaults, options);
    }

    $.extend(Main.prototype, {

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
            self._sendImg('?' + $.param(data));

            return self;
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
         * @param  {string} str 日志参数
         */
        _sendImg: function (str) {
            var key = Log.expando + (Log.guid ++);
            var img = window[key] = new Image();

            img.onload = img.onerror = function () {
                img.onload = img.onerror = null;

                try {
                    delete window[key];
                }
                catch (e) {
                    window[key] = null;
                }
            };

            img.src = this._options.img + str;
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
        return new Main(options);
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
