var path = require('path')
var read = require('fs').readFileSync
var html = read(path.resolve(__dirname, 'index.html'))
var x = require('../..')

x(html, ['a']).then(console.log)
