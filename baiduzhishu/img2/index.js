const express = require('express')
// const puppeteer = require('puppeteer')
const path = require('path')
const bodyParser = require('body-parser')
const cookiesfn = require('./cookiesfn')
const fs = require('fs')
const getMap = require('./scrap').getMap
const get = require('./scrap').get
const get2 = require('./scrap').get2
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// function main() {
//   return puppeteer.launch({headless: true}).then(broswer => {
//     app.get('/getzs', async (req, res) => {
//       if (!req.query.keyword) {
//         res.send('参数不正确')
//       } else {
//         let a = await get(broswer, req.query.keyword)
//         res.send(a);
//       }
//     })
//     app.get('/map', async (req, res) => {
//       if (!req.query.keyword) {
//         res.send('参数不正确')
//       } else {
//         let a = await getMap(req.query.keyword)
//         res.send(a)
//       }
//     })
//     var server = app.listen(3000, () => {
//       var host = server.address().address
//       var port = server.address().port
    
//       console.log('Example app listening at http://%s:%s', host, port)
//     });
//   })
// }
function main2() {
  app.get('/getzs', async (req, res) => {
    if (!req.query.keyword) {
      res.send('参数不正确')
    } else {
      let a = await get2(req.query.keyword)
      res.send(a);
    }
  })
  app.get('/map', async (req, res) => {
    if (!req.query.keyword) {
      res.send('参数不正确')
    } else {
      let a = await getMap(req.query.keyword)
      res.send(a)
    }
  })
  var server = app.listen(3000, () => {
  var host = server.address().address
  var port = server.address().port
  
  console.log('Example app listening at http://%s:%s', host, port)
  });
}
// 上传cookies相关
app.use(express.static(path.join(__dirname, 'views')))
app.get('/', function (req, res) {
  res.header("Content-Type", "text/html")
  res.render('./views/index.html')
})
app.post('/updateCookies', async (req, res) => {
  req.body.cookies.forEach((i) => {
    let options = {
      user: i.user,
      cookies: i.cookies
    }
    // cookiesfn.setCookie(options)
    cookiesfn.setCookie2(options)
  })
  res.send({
    msg: 'ok'    
  })
})
app.post('/setEmails', async (req, res) => {
  fs.writeFileSync('./emails.json', JSON.stringify(req.body.emails))
  res.send({
    msg: 'ok'    
  })
})
app.get('/getEmails', async(req, res) => {
  res.send({
    emails: JSON.parse(fs.readFileSync('./emails.json'))
  })
})
app.get('/checkCookies', async (req, res) => {
  let all = JSON.parse(fs.readFileSync('./c.json'))
  var message = ''
  if (all.length === 0) {
    message = '无可用cookies'
  } else {
    all.forEach((i, index) => {
      message += index + ' : ' + i.user + '\n'
    })
  }
  res.send({
    msg: message
  })
})
// main()
main2()
