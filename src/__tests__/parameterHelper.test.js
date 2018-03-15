const params = require('../utils/parameterHelper');
const assert = require('assert');

describe('params', () => {
  describe('1 arguments', () => {
    it("should be a selector if it's a string", () => {
      var arg = params('#hi');
      assert.equal(null, arg.source);
      assert.equal(null, arg.scope);
      assert.equal('#hi', arg.selector);
    });

    it("should be a selector if it's an object", () => {
      var arg = params({ hi: 'hi' });
      assert.equal(null, arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, {
        hi: 'hi'
      });
    });

    it("should be a selector if it's an array", () => {
      var arg = params(['hi']);
      assert.equal(null, arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, ['hi']);
    });
  });

  describe('2 arguments', () => {
    it('should support attribute selectors', () => {
      var arg = params('@attr', { hi: 'hi' });
      assert.equal(null, arg.source);
      assert.equal('@attr', arg.scope);
      assert.deepEqual(arg.selector, {
        hi: 'hi'
      });
    });

    it('should support selectors', () => {
      var arg = params('.hi', { hi: 'hi' });
      assert.equal(null, arg.source);
      assert.equal('.hi', arg.scope);
      assert.deepEqual(arg.selector, {
        hi: 'hi'
      });
    });

    it('should support urls with object selectors', () => {
      var arg = params('https://google.com', { hi: 'hi' });
      assert.equal('https://google.com', arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, {
        hi: 'hi'
      });
    });

    it('should support urls with string selectors', () => {
      var arg = params('https://google.com', 'hi');
      assert.equal('https://google.com', arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, 'hi');
    });

    it('should support urls with array selectors', () => {
      var arg = params('https://google.com', ['hi']);
      assert.equal('https://google.com', arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, ['hi']);
    });

    it('should support HTML strings with object selectors', () => {
      var arg = params('<h2>hi</h2>', { hi: 'hi' });
      assert.equal('<h2>hi</h2>', arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, {
        hi: 'hi'
      });
    });

    it('should support HTML strings with string selectors', () => {
      var arg = params('<h2>hi</h2>', 'hi');
      assert.equal('<h2>hi</h2>', arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, 'hi');
    });

    it('should support HTML strings with array selectors', () => {
      var arg = params('<h2>hi</h2>', ['hi']);
      assert.equal('<h2>hi</h2>', arg.source);
      assert.equal(null, arg.scope);
      assert.deepEqual(arg.selector, ['hi']);
    });
  });

  describe('3 arguments', () => {
    it('should support a source, scope, and selector', () => {
      var arg = params('http://google.com', '#hi', { hi: 'hi' });
      assert.equal('http://google.com', arg.source);
      assert.equal('#hi', arg.scope);
      assert.deepEqual({ hi: 'hi' }, arg.selector);
    });
  });
});
