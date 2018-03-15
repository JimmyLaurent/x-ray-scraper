const x = require('..')

x('http://google.com', {
  main: 'title',
  image: x('https://images.google.com', 'title')
}).then(console.log)
