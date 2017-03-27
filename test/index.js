/**
 * @file 日志测试用例
 * @author fe.xiaowu@gmail.com
 */

/* globals Log */

'use strict';

describe('src/index.js', function () {
    it('Log.version', function () {
        expect(Log.version).to.a('string', '版本号判断');
    });

    it('Log.expando', function () {
        expect(Log.expando).to.a('string', '随机扩展key判断').and.to.be.ok;
    });

    it('Log.create', function () {
        var spy = sinon.spy(Log, 'Class');

        Log.create('1.gif');
        Log.create('2.gif', {
            a: 1
        });

        expect(Log.create).to.a('function', 'create方法检查');
        expect(spy.calledTwice).to.be.true;
        expect(spy.args[0]).to.deep.equal(['1.gif', {}]);
        expect(spy.args[1]).to.deep.equal(['2.gif', {
            a: 1
        }]);

        spy.restore();
    });

    it('Log._parseUrl', function () {
        expect(Log._parseUrl({}, '1.gif')).to.equal('1.gif?');
        expect(Log._parseUrl({
            a: 1,
            b: 2
        }, '1.gif')).to.equal('1.gif?a=1&b=2', '参数拼接判断');
        expect(Log._parseUrl({
            a: '中',
            测试: 1,
            成功: '对'
        }, '1.gif?xxx=1')).to.equal('1.gif?xxx=1&a=中&测试=1&成功=对'.replace(/[^&=\?]+/g, function ($1) {
            return encodeURIComponent($1);
        }), '中文转义判断');

        // 这里后续要配合后端看是否要处理多维数组
        expect(Log._parseUrl({
            '': 1,
            '1': '',
            '2': false,
            '3': 0,
            '4': null
        }, '1.gif')).to.equal('1.gif?2=false&3=0&4=null', '空key过滤判断');

        expect(Log._parseUrl({
            false: 1,
            null: 1,
            0: 1,
            '': 1
        }, '1.gif')).to.have.string('false=1', 'key值判断 - false=1')
        .and.to.have.string('0=1', 'key值判断 - 0=1')
        .and.to.have.string('null=1', 'key值判断 - null=1');
    });

    it('Log._sendImg', function (done) {
        var key = Log.expando + Log.guid;
        Log._sendImg({}, '/1.gif');
        expect(window[key]).to.be.instanceof(Image);
        setTimeout(function () {
            expect(window[key]).to.be.undefined;
            done();
        }, 100);
    });

    it('Log.guid', function () {
        var guid = Log.guid;

        expect(guid).to.a('number');

        Log._sendImg({}, '/');

        expect(Log.guid - guid).to.equal(1);

        Log._sendImg({}, '/');

        expect(Log.guid - guid).to.equal(2);
    });

    it('#send', function () {
        var spy = sinon.spy(Log, '_sendImg');
        var log = new Log.create('/1.gif', {
            a: 1
        });

        log.send('key', 'value');
        log.send({
            b: 2,
            c: 3
        });
        log.send();
        log.send(1, 2);

        expect(spy.args[0][0]).to.be.deep.equal({
            a: 1,
            key: 'value'
        });
        expect(spy.args[0][1]).to.be.equal('/1.gif');

        expect(spy.args[1][0]).to.be.deep.equal({
            a: 1,
            b: 2,
            c: 3
        });
        expect(spy.args[1][1]).to.be.equal('/1.gif');

        expect(spy.args[2][0]).to.be.deep.equal({
            a: 1
        });

        expect(spy.args[3][0]).to.be.deep.equal({
            a: 1
        });

        expect(spy.callCount).to.equal(4);

        spy.restore();
    });

    it('#_makeGlobal', function () {
        var log = Log.create('/1.gif', {
            a: 1,
            b: 2,
            c: function () {
                return 3;
            }
        });
        var data = log._makeGlobal({
            a: 5,
            d: 4
        });

        expect(data).to.be.deep.equal({
            a: 5,
            b: 2,
            c: 3,
            d: 4
        });
    });

    it('debug mode', function () {
        var old = Log.debug;
        var spy = sinon.spy(Log, '_sendImg');
        Log.debug = {
            url: '/2.gif'
        };
        var log = Log.create('/1.gif');

        log.send();

        expect(spy.args[0][1]).to.be.equal('/2.gif');

        Log.debug = old;
    });
});
