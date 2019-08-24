const fs = require('fs')
const axios = require('axios')
const path = require('path')
const express = require('express')
const app = require('express')()
const compression = require('compression')
const libqqwry = require('./lib-qqwry')
let time = new Date()
function update() {
  return axios.get('http://184.170.208.109:3001/').then(
    (res) => res.data
  )
}
app.use(compression())
app.all('*', function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS")
  res.header("X-Powered-By",' 3.2.1')
  next();
})

app.use(express.static(path.join(__dirname, 'views')))
app.get('/', function (req, res) {
  res.header("Content-Type", "text/html")
  res.render('./views/index.html')
})

app.get('/update', async (req, res) => {
  let f = await update()
  let table = handleData(f.split('\n'))
  fs.writeFileSync('./log.json', JSON.stringify(table))
  res.send({
    code: 0
  })
  time = new Date()
})
app.get('/data', (req, res) => {
  let data = JSON.parse(fs.readFileSync('./log.json'))
  d = data.filter(i => {
    if (i.ipInfo && i.ipInfo.Country && i.ipInfo.Country.indexOf('广州') === -1){
      return true
    }
    return false
  })
  res.send({
    d,
    t: time
  })
})

function handleData (list) {
  let table = []
  var qqwry = libqqwry()
  qqwry.speed()
  list.forEach(i => {
    if (i.indexOf('INFO') !== -1 &&
    i.indexOf('connecting') !== -1 &&
    i.indexOf('from') !== 1) {
      let ip = i.substring(i.indexOf('from') + 4, i.lastIndexOf(':')).trim()
      let ipInfo = {}
      try {
        ipInfo = qqwry.searchIP(ip)
      } catch (error) {
        
      }
      table.push({
        time: i.substring(0, i.indexOf('INFO')).trim(),
        site: i.substring(i.indexOf('connecting')+ 10,i.indexOf('from')).trim(),
        ipInfo
      })
    }
  })
  return table
}
app.listen(3002)