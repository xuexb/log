/**
 * @file 日志测试用例
 * @author fe.xiaowu@gmail.com
 */

/* globals Log */

'use strict';

describe('src/index.js', function () {
    it('Log.version', function () {
        expect(Log.version).to.a('string');
    });

    it('Log.create', function (done) {
        expect(Log.create).to.a('function');

        Log.sendImg = function () {
            done();
        };

        var app = Log.create('1.gif');
        app.send();
    });

    it('#send', function () {});
});
