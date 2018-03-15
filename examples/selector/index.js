const path = require('path');
const { readFileSync } = require('fs');
const html = readFileSync(path.resolve(__dirname, 'index.html'));
const x = require('..');

x(html, 'h2').then(console.log);
