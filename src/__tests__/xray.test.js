const m = require('multiline').stripIndent;
const cheerio = require('cheerio');
const assert = require('assert');
const isUrl = require('is-url');
const concat = require('concat-stream');
const { readFileSync } = require('fs');
const rm = require('rimraf').sync;
const { join } = require('path');
const Xray = require('../../Xray');

/**
 * URL
 *
 * We can be reasonably certain the issues list with that sorting will stay static,
 * since it is sorted by created date.
 */

const url = 'http://lapwinglabs.github.io/static/';
const pagedUrl =
  'https://github.com/lapwinglabs/x-ray/issues?q=is%3Aissue%20sort%3Acreated-asc%20';

describe('Xray basics', () => {
  it('should work with the kitchen sink', done => {
    const x = Xray();

    x('http://www.google.com/ncr', {
      title: 'title@text',
      image: x('#gbar a@href', 'title'),
      scoped_title: x('head', 'title'),
      inner: x('title', {
        title: '@text'
      })
    }).then(obj => {
      assert.equal('Google', obj.title, '{ title: title@text }');
      assert.equal('Google Images', obj.image);
      assert.equal('Google', obj.scoped_title);
      assert.equal('Google', obj.inner.title);
      done();
    });
  });

  it('should work with embedded x-ray instances', done => {
    const x = Xray();

    x(url, {
      list: x('body', {
        first: x('a@href', 'title')
      })
    })
      .then(obj => {
        assert.deepEqual(obj, {
          list: {
            first:
              "Loripsum.net - The 'lorem ipsum' generator that doesn't suck."
          }
        });
        done();
      })
      .catch(done);
  });

  it('should work without passing a URL in the callback', done => {
    const x = Xray();

    x('http://google.com', {
      title: 'title'
    })
      .then(obj => {
        assert.deepEqual(obj, {
          title: 'Google'
        });
        done();
      })
      .catch(done);
  });

  it('should work passing neither a valid URL nor valid HTML', done => {
    const x = Xray();
    x('garbageIn', {
      title: 'title'
    })
      .then(obj => {
        assert.deepEqual(obj, {});
        done();
      })
      .catch(done);
  });

  it('should work with arrays', done => {
    const x = Xray();

    x(url, ['a@href'])
      .then(arr => {
        assert.equal(50, arr.length);
        assert.equal('http://loripsum.net/', arr.pop());
        assert.equal('http://loripsum.net/', arr.pop());
        assert.equal('http://loripsum.net/', arr.pop());
        assert.equal('http://producthunt.com/', arr.pop());
        done();
      })
      .catch(done);
  });

  it('should work with an array without a url', done => {
    const x = Xray();

    x(['a@href'])(url)
      .then(arr => {
        assert.equal(50, arr.length);
        assert.equal('http://loripsum.net/', arr.pop());
        assert.equal('http://loripsum.net/', arr.pop());
        assert.equal('http://loripsum.net/', arr.pop());
        assert.equal('http://producthunt.com/', arr.pop());
        done();
      })
      .catch(done);
  });

  it('arrays should work with a simple selector', done => {
    const x = Xray();

    x('a', [{ link: '@href' }])(url)
      .then(arr => {
        assert.equal(50, arr.length);
        assert.deepEqual({ link: 'http://loripsum.net/' }, arr.pop());
        assert.deepEqual({ link: 'http://loripsum.net/' }, arr.pop());
        assert.deepEqual({ link: 'http://loripsum.net/' }, arr.pop());
        assert.deepEqual({ link: 'http://producthunt.com/' }, arr.pop());
        done();
      })
      .catch(done);
  });

  it('should select items with a scope', done => {
    const html =
      '<ul class="tags"><li>a</li><li>b</li><li>c</li></ul><ul class="tags"><li>d</li><li>e</li></ul>';
    const $ = cheerio.load(html);
    const x = Xray();
    x('.tags', ['li'])($)
      .then(arr => {
        assert.equal(5, arr.length);
        assert.equal('a', arr[0]);
        assert.equal('b', arr[1]);
        assert.equal('c', arr[2]);
        assert.equal('d', arr[3]);
        assert.equal('e', arr[4]);
        done();
      })
      .catch(done);
  });

  it('should select items within array with xray object', done => {
    const html = `
      <body>
        <div class="tag">
          <a>A</a>
          <a>B</a>
          <a>C</a>
        </div>
        <div class="tag">
          <a>D</a>
          <a>E</a>
          <a>F</a>
        </div>
      </body>
    `;
    const $ = cheerio.load(html);
    const x = Xray();
    x('.tag', [x('a', ['@text'])])($)
      .then(arr => {
        assert.equal(2, arr.length);
        assert.equal(3, arr[0].length);
        assert.equal(3, arr[1].length);
        assert.equal('A', arr[0][0]);
        assert.equal('B', arr[0][1]);
        assert.equal('C', arr[0][2]);
        assert.equal('D', arr[1][0]);
        assert.equal('E', arr[1][1]);
        assert.equal('F', arr[1][2]);
        done();
      })
      .catch(done);
  });

  it('should select lists separately too', done => {
    const html =
      '<ul class="tags"><li>a</li><li>b</li><li>c</li></ul><ul class="tags"><li>d</li><li>e</li></ul>';
    const $ = cheerio.load(html);
    const x = Xray();

    x('.tags', [['li']])($)
      .then(arr => {
        assert(arr[0].length === 3);
        assert(arr[0][0] === 'a');
        assert(arr[0][1] === 'b');
        assert(arr[0][2] === 'c');
        assert(arr[1].length === 2);
        assert(arr[1][0] === 'd');
        assert(arr[1][1] === 'e');
        done();
      })
      .catch(done);
  });

  it('should select collections within collections', done => {
    const html = m(() => {
      /*
      <div class="items">
        <div class="item">
          <h2>first item</h2>
          <ul class="tags">
            <li>a</li>
            <li>b</li>
            <li>c</li>
          </ul>
        </div>
        <div class="item">
          <h2>second item</h2>
          <ul class="tags">
            <li>d</li>
            <li>e</li>
          </ul>
        </div>
      </div>
    */
    }); // eslint-disable-line

    const $ = cheerio.load(html);
    const x = Xray();

    x($, '.item', [
      {
        title: 'h2',
        tags: x('.tags', ['li'])
      }
    ])
      .then(arr => {
        assert.deepEqual(
          [
            { title: 'first item', tags: ['a', 'b', 'c'] },
            { title: 'second item', tags: ['d', 'e'] }
          ],
          arr
        );
        done();
      })
      .catch(done);
  });

  it('should apply filters', done => {
    const html =
      '<h3> All Tags </h3><ul class="tags"><li> a</li><li> b </li><li>c </li></ul><ul class="tags"><li>\nd</li><li>e</li></ul>';
    const $ = cheerio.load(html);
    const x = Xray();

    x.setFilters({
      trim: value => (typeof value === 'string' ? value.trim() : value),
      slice: (value, limit) =>
        typeof value === 'string' ? value.slice(0, limit) : value,
      reverse: value =>
        typeof value === 'string'
          ? value
              .split('')
              .reverse()
              .join('')
          : value
    });

    x($, {
      title: 'h3 | trim | reverse | slice:4',
      tags: ['.tags > li | trim']
    })
      .then(obj => {
        assert.deepEqual(obj, {
          title: 'sgaT',
          tags: ['a', 'b', 'c', 'd', 'e']
        });
        done();
      })
      .catch(done);
  });

  it('should work with pagination & limits', done => {
    jest.setTimeout(10000);
    const x = Xray();

    const xray = x('https://blog.ycombinator.com/', '.post', [
      {
        title: 'h1 a',
        link: '.article-title@href'
      }
    ])
      .paginate('.nav-previous a@href')
      .limit(3);

    xray()
      .then(arr => {
        assert(arr.length, 'array should have a length');

        arr.forEach(function(item) {
          assert(item.title.length);
          assert.equal(true, isUrl(item.link));
        });
        done();
      })
      .catch(done);
  });

  it('should work with pagination function', done => {
    jest.setTimeout(10000);
    const x = Xray();

    const xray = x('https://blog.ycombinator.com/', '.post', [
      {
        title: 'h1 a',
        link: '.article-title@href'
      }
    ])
      .paginate(
        pageNumber => `https://blog.ycombinator.com/page/${pageNumber}/`
      )
      .limit(3);

    xray()
      .then(arr => {
        assert(arr.length, 'array should have a length');

        arr.forEach(function(item) {
          assert(item.title.length);
          assert.equal(true, isUrl(item.link));
        });
        done();
      })
      .catch(done);
  });

  it('should work with pagination & abort function checking returned object', done => {
    jest.setTimeout(10000);
    const x = Xray();

    const xray = x(pagedUrl, 'li.js-issue-row', [
      {
        id: '@id',
        title: 'a.h4'
      }
    ])
      .paginate('.next_page@href')
      .limit(3)
      .abort(function(result) {
        var i = 0;

        // Issue 40 is on page 2 of our result set
        for (; i < result.length; i++) {
          if (result[i].id === 'issue_40') return true;
        }

        return false;
      });

    xray()
      .then(arr => {
        // 25 results per page
        assert.equal(50, arr.length);

        arr.forEach(function(item) {
          assert(item.id.length);
          assert(item.title.length);
        });
        done();
      })
      .catch(done);
  });

  it('should work with pagination & abort function checking next URL', done => {
    jest.setTimeout(10000);
    const x = Xray();

    const xray = x(pagedUrl, 'li.js-issue-row', [
      {
        id: '@id',
        title: 'a.h4'
      }
    ])
      .paginate('.next_page@href')
      .limit(3)
      .abort((result, url) => {
        // Break after page 2
        if (url.indexOf('page=3') >= 0) return true;

        return false;
      });

    xray()
      .then(arr => {
        // 25 results per page
        assert.equal(50, arr.length);

        arr.forEach(function(item) {
          assert(item.id.length);
          assert(item.title.length);
        });
        done();
      })
      .catch(done);
  });

  it('should not call function twice when reaching the last page', done => {
    jest.setTimeout(10000);
    setTimeout(done, 9000);
    let timesCalled = 0;
    const x = Xray();

    x('https://github.com/lapwinglabs/x-ray/watchers', '.follow-list-item', [
      {
        fullName: '.vcard-username'
      }
    ])
      .paginate('.next_page@href')
      .limit(10)()
      .then(() => {
        timesCalled++;
        assert.equal(1, timesCalled, 'callback was called more than once');
      })
      .catch(done);
  });

  describe('.stream() === .write()', () => {
    it('write should work with streams', done => {
      const html =
        '<ul class="tags"><li>a</li><li>b</li><li>c</li></ul><ul class="tags"><li>d</li><li>e</li></ul>';
      const $ = cheerio.load(html);
      const x = Xray();

      const xray = x($, '.tags', [['li']]);

      xray.stream().pipe(
        concat(function(data) {
          const arr = JSON.parse(data.toString());
          assert(arr[0].length === 3);
          assert(arr[0][0] === 'a');
          assert(arr[0][1] === 'b');
          assert(arr[0][2] === 'c');
          assert(arr[1].length === 2);
          assert(arr[1][0] === 'd');
          assert(arr[1][1] === 'e');
          done();
        })
      );
    });

    it('write should work with pagination', done => {
      jest.setTimeout(10000);
      const x = Xray();

      const xray = x('https://blog.ycombinator.com/', '.post', [
        {
          title: 'h1 a',
          link: '.article-title@href'
        }
      ])
        .paginate('.nav-previous a@href')
        .limit(3);

      xray.stream().pipe(
        concat(function(buff) {
          var arr = JSON.parse(buff.toString());

          assert(arr.length, 'array should have a length');

          arr.forEach(function(item) {
            assert(item.title.length);
            assert.equal(true, isUrl(item.link));
          });
          done();
        })
      );
    });
  });

  describe('.write(file)', () => {
    it('should stream to a file', done => {
      const path = join(__dirname, 'tags.json');
      const html =
        '<ul class="tags"><li>a</li><li>b</li><li>c</li></ul><ul class="tags"><li>d</li><li>e</li></ul>';
      const $ = cheerio.load(html);
      const x = Xray();

      x($, '.tags', [['li']])
        .write(path)
        .on('finish', () => {
          const arr = JSON.parse(readFileSync(path, 'utf8'));
          assert(arr[0].length === 3);
          assert(arr[0][0] === 'a');
          assert(arr[0][1] === 'b');
          assert(arr[0][2] === 'c');
          assert(arr[1].length === 2);
          assert(arr[1][0] === 'd');
          assert(arr[1][1] === 'e');
          rm(path);
          done();
        });
    });
    it('stream to a file with pagination', done => {
      const path = join(__dirname, 'pagination.json');
      jest.setTimeout(10000);
      const x = Xray();

      x('https://blog.ycombinator.com/', '.post', [
        {
          title: 'h1 a',
          link: '.article-title@href'
        }
      ])
        .paginate('.nav-previous a@href')
        .limit(3)
        .write(path)
        .on('finish', () => {
          const arr = JSON.parse(readFileSync(path, 'utf8'));
          assert(arr.length, 'array should have a length');
          arr.forEach(item => {
            assert(item.title.length);
            assert.equal(true, isUrl(item.link));
          });
          rm(path);
          done();
        });
    });
  });

  describe('.then(cb)', () => {
    it('should return a promise', done => {
      const html =
        '<ul class="tags"><li>a</li><li>b</li><li>c</li></ul><ul class="tags"><li>d</li><li>e</li></ul>';
      const $ = cheerio.load(html);
      const x = Xray();

      const xray = x($, '.tags', [['li']]);

      xray().then(arr => {
        assert(arr[0].length === 3);
        assert(arr[0][0] === 'a');
        assert(arr[0][1] === 'b');
        assert(arr[0][2] === 'c');
        assert(arr[1].length === 2);
        assert(arr[1][0] === 'd');
        assert(arr[1][1] === 'e');
        done();
      });
    });
  });

  it('timeout should throw a job timeout error', async () => {
    await expect(Xray().timeout(1)('http://google.com', 'title')).rejects.toEqual(
      new Error('job timed out')
    );
  });
});
