const path = require('path');
const { readFileSync } = require('fs');
const html = readFileSync(path.resolve(__dirname, 'index.html'));
const x = require('../..');

x(html, {
  title: '.title',
  image: 'img@src',
  tags: ['li']
}).then(console.log);
