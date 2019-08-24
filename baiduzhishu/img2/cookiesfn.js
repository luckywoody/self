const fs = require('fs')
const _ = require('lodash')

let ex = new Date().getTime() + 30*24*3600*1000
let template = [
  {
    "name": "Hm_lpvt_d101ea4d2a5c67dab98251f0b5de24dc",
    "value": "1535160633",
    "domain": ".index.baidu.com",
    "path": "/",
    "expires": -1,
    "size": 50,
    "httpOnly": false,
    "secure": false,
    "session": true
  },
  {
    "name": "Hm_lvt_d101ea4d2a5c67dab98251f0b5de24dc",
    "value": "1535159743",
    "domain": ".index.baidu.com",
    "path": "/",
    "expires": ex,
    "size": 49,
    "httpOnly": false,
    "secure": false,
    "session": false
  },
  {
    "name": "bdshare_firstime",
    "value": "1526706848677",
    "domain": "index.baidu.com",
    "path": "/",
    "expires": ex,
    "size": 29,
    "httpOnly": false,
    "secure": false,
    "session": false
  },
  {
    "name": "BDUSS",
    "value": "lFU3BURTE1blZWRWN3eUJ2QWRQTGluNi0zMUlKemxDNGZlOEFGSGpUfjZPNmhiQVFBQUFBJCQAAAAAAAAAAAEAAACSfchQzPDM8LXE0KHR~tH-NgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPqugFv6roBbUF",
    "domain": ".baidu.com",
    "path": "/",
    "expires": ex,
    "size": 197,
    "httpOnly": true,
    "secure": false,
    "session": false
  },
  {
    "name": "CHKFORREG",
    "value": "62e433668b21ddb012295f006c713a6e",
    "domain": "index.baidu.com",
    "path": "/",
    "expires": ex,
    "size": 41,
    "httpOnly": false,
    "secure": false,
    "session": false
  },
  {
    "name": "BAIDUID",
    "value": "FD07C50217EA4C78C9A74A15BE9E2C5B:FG=1",
    "domain": ".baidu.com",
    "path": "/",
    "expires": ex,
    "size": 44,
    "httpOnly": false,
    "secure": false,
    "session": false
  }
]
let parseCookie = function (cookie) {
  let cookies={};
  if (!cookie) {
      return cookies;
  }
  let list=cookie.split(';');
  for (let i = 0;i<list.length;i++) {
      let pair=list[i].split('=');
      cookies[pair[0].trim()]=pair[1];
  }
  return cookies;
};
let setCookie = function (options) {
  let all = JSON.parse(fs.readFileSync('./c.json'))
  let userIndex = _.findIndex(all, {user: options.user})
  let oldC = userIndex === -1 ? template : all[userIndex].cookies
  let newC = parseCookie(options.cookies)
  let keys = Object.keys(newC)
  keys.forEach(i => {
    let index = _.findIndex(oldC, {name: i})
    if (index !== -1) {
      oldC[index].value = newC[i]
    }
  })
  if (userIndex !== -1) {
    all[userIndex].cookies = oldC
  } else {
    all.push({
      user: options.user,
      cookies: oldC
    })
  }
  fs.writeFileSync('./c.json', JSON.stringify(all, null, 2))
}
let setCookie2 = function (options) {
  let all = JSON.parse(fs.readFileSync('./c.json'))
  let userIndex = _.findIndex(all, {user: options.user})
  let newC = JSON.stringify(options.cookies)
  if (userIndex !== -1) {
    all[userIndex].cookies = newC
  } else {
    all.push({
      user: options.user,
      cookies: newC
    })
  }
  fs.writeFileSync('./c.json', JSON.stringify(all, null, 2))
}
module.exports.setCookie = setCookie
module.exports.setCookie2 = setCookie2