// '%51000%' 001000% => '大于1000%'
const fs = require('fs')
const _ = require('lodash')
const axios = require('axios')
const Tesseract = require('tesseract.js')
const superagent = require('superagent')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport');
const cheerio = require('cheerio')
const ec = require('./encode')
const log = require('./log')
var userIndex = 0;

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
function get(broswer, keyword) {
  return new Promise(async (resolve) => {
    log('查询:' + keyword)
    let all = JSON.parse(fs.readFileSync('./c.json'))
    if (all.length -1 < userIndex) {
      userIndex = 0
    }
    if (!all[userIndex]) {
      resolve({
        msg: '已无可用cookies',
        code: -2
      })
      return
    }
    let page = await broswer.newPage()
    const oldC = JSON.parse(fs.readFileSync('./c.json'))[userIndex].cookies
    await page.setCookie(...oldC)
    await page.goto('http://index.baidu.com/?tpl=trend&word=' + ec(keyword))
    await page.waitForSelector('#schword,#TANGRAM__PSP_4__userName')
  
    if (await page.$('#TANGRAM__PSP_4__userName')) {
      removeCookies()
      page.close()
      resolve({
        msg: '当前cookies已过期，请重新尝试',
        code: -1
      })
      return
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
    userIndex += 1
    resolve({
      average: average,
      maverage: maverage,
      rate: rate,
      circleRate: circleRate,
      mRate: mRate,
      mCircleRate: mCircleRate,
      searchNums: searchNums,
      code: 1
    }) 
  })
}
async function get2(keyword) {
  log('查询:' + keyword)
  let all = JSON.parse(fs.readFileSync('./c.json'))
  if (all.length -1 < userIndex) {
    userIndex = 0
  }
  if (!all[userIndex]) {
    return({
      msg: '已无可用cookies',
      code: -2
    })
    return
  }
  const oldC = JSON.parse(fs.readFileSync('./c.json'))[userIndex].cookies
  let a = await Promise.all([getSearchNums(keyword), test()])
  // let searchNums = await getSearchNums(keyword)
  if (a[1].code !== 1) {
    return a[1]
  } else {
    return Object.assign(a[1], {searchNums: a[0]})
  }
  console.log(a)
  function test () {
    return axios.get(`http://index.baidu.com/api/SearchApi/index?word=${encodeURI(keyword)}&area=0&days=30`, {
      headers: {
        'COOKIE': oldC
      }
    }).then(
      (res) => {
        if (+res.data.status === 10000) {
          removeCookies()
          return {
            msg: '当前cookies已过期，请重新尝试',
            code: -1
          }
        }
        userIndex += 1
        let data = _.get(res.data, 'data.generalRatio[0]')
        if (!data) {
          return {
            msg: '查无相关数据',
            code: -3
          }
        } else {
          return {
            average: data.all.avg,
            maverage: data.wise.avg,
            rate: data.all.yoy + '%',
            circleRate: data.all.qoq + '%',
            mRate: data.wise.yoy + '%',
            mCircleRate: data.wise.qoq + '%',
            code: 1
          }
        }
      }
    )
  }
}
function getSearchNums(keyword) {
  return superagent.get('http://www.baidu.com/s?wd=' + encodeURI(keyword)).then((res) => {
    let $ = cheerio.load(res.text);
    let text = $('.nums_text').text()
    text = text.substring(text.indexOf('约') + 1, text.length - 1)
    return text.replace(/\,/g, '')
  })
}
function removeCookies() {
  let all = JSON.parse(fs.readFileSync('./c.json'))
  sendEmail(all[userIndex].user)
  all.splice(userIndex, 1)
  if (all.length === 0) {
    sendEmail('无可用')
  }
  fs.writeFileSync('./c.json', JSON.stringify(all, null, 2))
  return
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
    let all = JSON.parse(fs.readFileSync('./c.json'))
    if (!all[userIndex]) {
      resolve()
    }
    all[userIndex].cookies = jsonObj
    // Try saving the file.        
    fs.writeFile(targetFile, JSON.stringify(all, null, 2), (err, text) => {
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
// ncgfrdzngiuxgejd

function sendEmail(user) {
  let config = {
    service: 'QQ',
    user: '774898896@qq.com',
    pass: 'dtjvfsdewypfbfdb'
  }
  var aaa = nodemailer.createTransport(smtpTransport({
    service: config.service,
    auth: {
        user: config.user,
        pass: config.pass
    }
  }));
  let emails = JSON.parse(fs.readFileSync('./emails.json'))
  let emtext = ''
  emails.forEach((i, index) => {
    emtext += index === emails.length - 1 ? i.email : i.email + ','
  })
  if (user === '无可用') {
    aaa.sendMail({
   
      from: config.user,
      to: emtext,
      subject: '已无可用cookies，请及时录入',
      html: '<p>处理地址:http://139.199.181.200:3000</p>'
  
    }, function (error, response) {
        if (error) {
            console.log(error);
        }
        console.log('发送成功')
    });
  } else {
    aaa.sendMail({
   
      from: config.user,
      to: emtext,
      subject: user + ' 的百度指数cookies已过期',
      html: '<p>处理地址:http://139.199.181.200:3000</p>'
  
    }, function (error, response) {
        if (error) {
            console.log(error);
        }
        console.log('发送成功')
    });
  }
}
module.exports.getMap = getMap
module.exports.get = get
module.exports.get2 = get2
module.exports.sendEmail = sendEmail