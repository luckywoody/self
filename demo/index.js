const express = require('express')
const path = require('path')
const app = express()
app.use(express.static(path.join(__dirname, 'views')))
app.get('/', function (req, res) {
  res.header("Content-Type", "text/html")
  res.render('./views/index.html')
})
app.listen(8686)