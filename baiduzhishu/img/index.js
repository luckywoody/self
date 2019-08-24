// '%51000%' 001000% => '大于1000%'
const fs = require('fs')
const express = require('express')
const puppeteer = require('puppeteer')
const Tesseract = require('tesseract.js')
const superagent = require('superagent')
const cheerio = require('cheerio')
const ec = require('./encode')
const axios = require('axios')
const _ = require('lodash')
var app = express()
function main() {
  return puppeteer.launch({headless: false}).then(broswer => {
    app.get('/getzs', async (req, res) => {
      if (!req.query.keyword) {
        res.send('参数不正确')
      } else {
        let a = await get(broswer, req.query.keyword)
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
  })
}
main()
function get(broswer, keyword) {
  return new Promise(async (resolve) => {
    let page = await broswer.newPage()
    const oldC = JSON.parse(fs.readFileSync('./c.json'))
    await page.setCookie(...oldC)
    await page.goto('http://index.baidu.com/?tpl=trend&word=' + ec(keyword))
    await page.waitForSelector('#schword,#TANGRAM__PSP_4__userName')
  
    if (await page.$('#TANGRAM__PSP_4__userName')) {
      await login(page)
      await page.waitForNavigation()
    }
    await page.waitForSelector('.lrRadius,.wrapper')
    if (await page.$('.wrapper')) {
      await page.close()
      resolve(false)
    }
    let cookies = await page.cookies()
    await saveToJSONFile(cookies)
    const el = await page.$$('.lrRadius .ftlwhf.enc2imgVal')
    const rates = await page.$$('.lrRadius .ftlwhf.imgnums')
    await freezeTime(2000)
    await page.evaluate(() => {
      document.querySelectorAll('.ratUp,.ratDown,.rat__').forEach(i => {
        i.style.background = 'none'
      })
      return Promise.resolve(true)
    })
    let p1 = `./average.png`
    let p2 = `./maverage.png`
    let r1 = `./rate.png`
    let r2 = `./circleRate.png`
    let r3 = `./mRate.png`
    let r4 = `./mCircleRate.png`
    await Promise.all([
      el[0].screenshot({path: p1}),
      el[1].screenshot({path: p2}),
      rates[0].screenshot({path: r1}),
      rates[1].screenshot({path: r2}),
      rates[2].screenshot({path: r3}),
      rates[3].screenshot({path: r4})
    ])
    let nums = await Promise.all([
      getNums(p1),
      getNums(p2),
      getNums(r1),
      getNums(r2),
      getNums(r3),
      getNums(r4),
      getSearchNums(keyword)
    ])
    let average = nums[0]
    let maverage = nums[1]
    let rate = nums[2]
    let circleRate = nums[3]
    let mRate = nums[4]
    let mCircleRate = nums[5]
    let searchNums = nums[6]
    page.close()
    resolve({
      average: average,
      maverage: maverage,
      rate: rate,
      circleRate: circleRate,
      mRate: mRate,
      mCircleRate: mCircleRate,
      searchNums: searchNums
    }) 
  })
}
function getSearchNums(keyword) {
  return superagent.get('http://www.baidu.com/s?wd=' + encodeURI(keyword)).then((res) => {
    let $ = cheerio.load(res.text);
    let text = $('.nums_text').text()
    text = text.substring(text.indexOf('约') + 1, text.length - 1)
    return text.replace(/\,/g, '')
  })
}
function getMap(keyword) {
  return axios.get('http://index.baidu.com/Interface/Newwordgraph/?word=' + encodeURI(keyword)).then(
    (res) => {
      if (res.data.data.length === 0) {
        return '查无相关数据'
      } else {
        let data = res.data.data[Object.keys(res.data.data)[0]]
        return handleMap(data)
      }
    }
  )
}
function handleMap(data, r = 20) {
  let a = []
  data.forEach(i => {
    a.push({
      title: i.substring(0, i.indexOf('\t')),
      source: parseNum(i, 2),
      direction: parseNum(i, 1)
    })
  })
  let d = {
    sourceRank: _.sortBy(a, 'source').reverse().slice(0, r),
    directionRank: _.sortBy(a, 'direction').reverse().slice(0, r)
  }
  return d
}
function parseNum(data, k) {
  let start = data.indexOf(k + '=') + 2
  if (start === 1) return -1
  data = data.substring(start)
  let end = data.indexOf('&')
  if (end === -1) {
    return +data
  }
  return +data.substring(0, end)
}
async function login(page) {
  let ac = await page.$('#TANGRAM__PSP_4__userName')
  let pa = await page.$('#TANGRAM__PSP_4__password')
  let sub = await page.$('#TANGRAM__PSP_4__submit')
  await ac.type('chickenDady', {delay: 60})
  await pa.type('05679235a', {delay: 60})
  await sub.click()
  return Promise.resolve(true)
}
Tesseract.create({
  langPath: './baidu.traineddata'
})
function getNums(path) {
  return new Promise((resolve) => {
    Tesseract.recognize(path, {
      lang: 'baidu',
      tessedit_char_whitelist: '-%,1234567890'
    }).then(
      (r) => {
        let reg = /\r|\s+|,|\n|\\s/g
        let t = r.text.replace(reg, '')
        if (t === '%51000%' || t === '001000%') {
          t = '大于100%'
        }
        resolve(t)
      }
    )
  })
}
/**
 * Write JSON object to specified target file
 * @param {String} jsonObj 
 * @param {String} targetFile 
 */
async function saveToJSONFile(jsonObj) {

  targetFile = './c.json'
  
  return new Promise((resolve, reject) => {

    try {
      var data = JSON.stringify(jsonObj);
    }
    catch (err) {
      console.log("Could not convert object to JSON string ! " + err);
      reject(err);
    }
      
    // Try saving the file.        
    fs.writeFile(targetFile, data, (err, text) => {
      if(err)
        reject(err);
      else {
        resolve(targetFile);
      }
    });
    
  });
}
function freezeTime(t) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, t);
  })
}
