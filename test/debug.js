/**
 * @file 日志测试用例 - debug
 * @author fe.xiaowu@gmail.com
 */

/* globals Log */

'use strict';

describe('src/debug.js', function () {
    var spy;
    var URL_MAX_LENGTH = Log.debug.URL_MAX_LENGTH;
    var PARAM_MAX_LENGTH = Log.debug.PARAM_MAX_LENGTH;

    afterEach(function () {
        if (spy) {
            spy.restore();
            spy = null;
        }

        Log.debug.PARAM_MAX_LENGTH = PARAM_MAX_LENGTH;
        Log.debug.URL_MAX_LENGTH = URL_MAX_LENGTH; 
    });

    it('debug.mock', function (done) {
        var key = 'mock_test_' + Date.now();

        Log[key] = function () {};
        Log.debug.mock('Log.' + key, function (a, b, c) {
            expect(a).to.be.deep.equal([1]);
            expect(b).to.be.equal(2);
            expect(c).to.be.equal(3);
            expect(this[key]).to.be.a('function');
            delete Log[key];
            done();
        });

        // run
        Log[key]([1], 2, 3);
    });

    it('debug.mock error param', function () {
        var fn = function () {
            Log.debug.mock('test.xxoo', function () {});
        };

        expect(fn).to.throw(/name/);
        expect(fn).to.throw(TypeError);
    });

    it('Log.create 参数检查', function () {
        spy = sinon.spy(Log.debug, 'error');

        Log.create();
        Log.create('');
        Log.create(false);
        Log.create({});

        expect(spy.args[0][0]).to.have.string('url不能为空');
        expect(spy.args[1][0]).to.have.string('url必须为非空字符串');
        expect(spy.args[2][0]).to.have.string('url必须为非空字符串');
        expect(spy.args[3][0]).to.have.string('url必须为非空字符串');

        Log.create('1', []);
        Log.create('1');
        Log.create('1', {});
        expect(spy.args[4][0]).to.have.string('options必须为对象');

        expect(spy.callCount).to.be.equal(5);
    });

    it('URL_MAX_LENGTH', function () {
        spy = sinon.spy(Log.debug, 'warn');

        var log = Log.create('/1.gif', {
            time: Date.now()
        });

        // 防止参数超长报错
        Log.debug.PARAM_MAX_LENGTH = 100;
        Log.debug.URL_MAX_LENGTH = 10;

        log.send({
            xxx: Date.now()
        });

        expect(spy.called).to.be.true;
        expect(spy.calledWithMatch('日志链接超长')).to.be.true;
        spy.restore();
    });

    it('URL_MAX_LENGTH http url', function () {
        spy = sinon.spy(Log.debug, 'warn');

        var log = Log.create('//github.xuexb.com/static/log.gif', {
            time: Date.now()
        });

        // 防止参数超长报错
        Log.debug.PARAM_MAX_LENGTH = 100;
        Log.debug.URL_MAX_LENGTH = 10;

        log.send({
            xxx: Date.now()
        });

        expect(spy.called).to.be.true;
        expect(spy.calledWithMatch('日志链接超长')).to.be.true;
    });

    it('PARAM_MAX_LENGTH', function () {
        spy = sinon.spy(Log.debug, 'warn');

        var log = Log.create('/1.gif', {
            time: 12345
        });

        Log.debug.PARAM_MAX_LENGTH = 4;

        log.send();

        expect(spy.called).to.be.true;
        expect(spy.calledWithMatch('存在超长参数')).to.be.true;
    });

    it('参数为空检查', function () {});

    it('参数覆盖检查', function () {});

    it('urlencode', function () {});
});
