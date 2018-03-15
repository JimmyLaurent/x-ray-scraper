const { absolute } = require('../utils/commonHelpers');
const cheerio = require('cheerio');
const assert = require('assert');

describe('absolute URLs', () => {
  const path = 'http://example.com/foo.html';

  it('should not convert URL', () => {
    const $el = cheerio.load('<a href="http://example.com/bar.html"></a>');
    assert.equal(
      '<a href="http://example.com/bar.html"></a>',
      absolute(path, $el).html()
    );
  });

  it('should convert absolute URL', () => {
    const $el = cheerio.load('<a href="/bar.html"></a>');
    assert.equal(
      '<a href="http://example.com/bar.html"></a>',
      absolute(path, $el).html()
    );
  });

  it('should convert relative URL', () => {
    const $el = cheerio.load('<a href="bar.html"></a>');
    assert.equal(
      '<a href="http://example.com/bar.html"></a>',
      absolute(path, $el).html()
    );
  });

  it('should not throw when encountering invalid URLs', () => {
    const $el = cheerio.load(
      '<html><body><ul><li><a href="mailto:%CAbroken@link.com">Broken link</a></li></ul></body></html>'
    );
    absolute(path, $el);
  });
});

describe('absolute URLs with <base> tag', () => {
  const head = '<head><base href="http://example.com/foo/"></head>';
  const path = 'http://example.com/foo.html';

  it('should convert relative URL', () => {
    const $el = cheerio.load(head + '<a href="foobar.html"></a>');
    assert.equal(
      head + '<a href="http://example.com/foo/foobar.html"></a>',
      absolute(path, $el).html()
    );
  });

  it('should not convert relative URL starting with /', () => {
    const $el = cheerio.load(head + '<a href="/foobar.html"></a>');
    assert.equal(
      head + '<a href="http://example.com/foobar.html"></a>',
      absolute(path, $el).html()
    );
  });
});
