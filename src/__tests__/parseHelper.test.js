const selectors = require('./fixtures/selectors');
const assert = require('assert');
const parse = require('../utils/parseHelper');

describe('parse', function() {
  it('should extract single element selectors', () => {
    for (let i = 0, l = selectors.length; i < l; i++) {
      assert.equal(selectors[i], parse(selectors[i]).selector);
      assert.equal(undefined, parse(selectors[i]).attribute);
      assert.deepEqual([], parse(selectors[i]).filters);
    }
  });

  it('should extract any combination of element and attribute selectors', () => {
    for (let i = 0, l = selectors.length; i < l; i++) {
      const selector = selectors[i] + '@ href';
      assert.equal(selectors[i], parse(selector).selector);
      assert.equal('href', parse(selector).attribute);
      assert.deepEqual([], parse(selector).filters);
    }
  });

  it('should extract any combination of element and attribute selectors with spaces and hypens', () => {
    for (let i = 0, l = selectors.length; i < l; i++) {
      const selector = selectors[i] + ' @ data-item';
      assert.equal(selectors[i], parse(selector).selector);
      assert.equal('data-item', parse(selector).attribute);
      assert.deepEqual([], parse(selector).filters);
    }
  });

  it('should extract any combination of element and attribute selectors', () => {
    for (let i = 0, l = selectors.length; i < l; i++) {
      assert.equal(selectors[i], parse(selectors[i]).selector);
      assert.equal(undefined, parse(selectors[i]).attribute);
      assert.deepEqual([], parse(selectors[i]).filters);
    }
  });

  it('should support a single attribute', () => {
    assert.equal('href', parse('@ href').attribute);
    assert.equal('href', parse('@href').attribute);
  });

  it('should support filters', () => {
    const selector = 'a[href][class] @ html | filter1 | filter2';
    assert.equal('a[href][class]', parse(selector).selector);
    assert.equal('html', parse(selector).attribute);
    assert.deepEqual(
      [{ name: 'filter1', args: [] }, { name: 'filter2', args: [] }],
      parse(selector).filters
    );
  });

  it('should support filters with arguments', () => {
    const selector =
      'a[href][class] @ html | filter1: "%Y %M %d" | filter2: matt 25';
    assert.equal('a[href][class]', parse(selector).selector);
    assert.equal('html', parse(selector).attribute);
    assert.deepEqual(
      [
        { name: 'filter1', args: ['%Y %M %d'] },
        { name: 'filter2', args: ['matt', 25] }
      ],
      parse(selector).filters
    );
  });

  it('should support everything with no spaces', () => {
    const selector = 'a@href|href|uppercase';
    assert.equal('a', parse(selector).selector);
    assert.equal('href', parse(selector).attribute);
    assert.deepEqual(
      [{ name: 'href', args: [] }, { name: 'uppercase', args: [] }],
      parse(selector).filters
    );
  });
});
