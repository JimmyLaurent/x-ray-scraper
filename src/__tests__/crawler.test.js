const crawler = require('../crawler');

describe('X-ray Crawler', () => {
  it('can crawl google.com', done => {
    const crawl = crawler()
      .throttle(3, '1s')
      .delay('1s', '10s')
      .concurrency(2)
      .limit(20);
    crawl('http://google.com', (err, ctx) => {
      if (err) {
        throw err;
      }
      expect(ctx.status).toEqual(200);
      expect(ctx.response.header['content-type']).toMatchSnapshot();
      done();
    });
  });
});
