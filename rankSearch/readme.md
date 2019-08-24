# 项目部署及运行
#### 标准环境为node v8.9.4
```
1.pm2的安装:
  npm install -g pm2
2.项目依赖:
  npm install
3.设置index.js 中的定时任务时间（时、分、秒）
4.启动:
  pm2 start index.js
5.pm2 list 检测是否正常启用

注:如npm install 安装缓慢/失败，建议使用 http://npm.taobao.org/
```
# 必须阅读
```
  src/config.js 注释部分
  src/common.js 注释部分
```
# 建议了解
```
1.nvm(node版本管理器) https://www.jianshu.com/p/8671e439a811
2.pm2(node后台进程管理) https://blog.csdn.net/sunscheung/article/details/79171608
3.node-schedule(定时任务),如需要高级用法时请查阅 https://github.com/node-schedule/node-schedule
```
# 日志分析
- 爬取失败长度异常:
 - 是否开启了该引擎的userProxy
 - 查看对应异常引擎下的wrong.json,是否keywordname为空或者非法词汇
 - 搜索引擎验证页面的关键词调整，需要修改config.js中对应的verifyText
 - 搜索引擎正则的调整，需要修改config.js，对应的reg参数
 - 代理池用完（日志中有抓取代理时的对应信息），需要修改config.js中的proxyUri
 - 当次爬取使用代理达到上限，（加大delay,或者提升使用上限次数）

# 项目目录
```
src目录下以baidu为例，实际上还有其他6个同类文件夹

├── data-config.js            //定义资源文件地址
├── index.js                  //主函数（集成了定时任务、数据获取、爬虫、发送数据）
├── package.json
├── readme.md
├── scrap.log                 //日志文件
└── src                       
    ├── baidu                 
    │   ├── baidu.js          //百度爬虫（引入common.js中的方法，由config.js配置)
    │   ├── data.json         //原始数据
    │   ├── result.json       //最近一次的爬虫结果
    │   └── wrong.json        //最近一次的错误列表(rank === -1)
    ├── common.js             //爬虫核心函数方法
    ├── config.js             //各爬虫配置文件（详细说明在config.js中）
    ├── log.js                //简单的日志方法
    └── url-regx.js         
```
