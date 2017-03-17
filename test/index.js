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

    it('Log.json2url', function () {
        expect(Log.json2url()).to.equal('');
        expect(Log.json2url({
            a: 1,
            b: 2
        })).to.equal('a=1&b=2', '参数拼接判断');
        expect(Log.json2url({
            a: '中',
            测试: 1,
            成功: '对'
        })).to.equal('a=中&测试=1&成功=对'.replace(/[^&=]+/g, function ($1) {
            return encodeURIComponent($1);
        }), '中文转义判断');

        // 这里后续要配合后端看是否要处理多维数组
        expect(Log.json2url({
            '': 1,
            '1': '',
            '2': false,
            '3': 0,
            '4': null
        })).to.equal('2=false&3=0&4=null', '空key过滤判断');

        expect(Log.json2url({
            false: 1,
            null: 1,
            0: 1,
            '': 1
        })).to.match(/false=1/, 'key值判断 - false=1')
        .and.to.match(/0=1/, 'key值判断 - 0=1')
        .and.to.match(/null=1/, 'key值判断 - null=1');
    });

    it('Log.sendImg', function (done) {
        var key = Log.expando + Log.guid;
        Log.sendImg(null, '/1.gif');
        expect(window[key]).to.be.instanceof(Image);
        setTimeout(function () {
            expect(window[key]).to.be.undefined;
            done();
        }, 100);
    });
});
