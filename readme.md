### clash 订阅与节点分离

```
    npm install
    node ./index.js
```

### index.js 内需要修改的配置项： 
url 里填写你的订阅地址（clash订阅，如果是其他订阅自行转换）

of(require("./rule.json")) 填写你的自定义规则地址，可以是网络地址，和之前节点一样通过 request 获取即可
 
最后修改一下最后面配置文件的路径即可使用。
详细信息查看 [medium](https://medium.com/@jinzhuming0308/clash-%E5%AE%9E%E7%8E%B0%E8%AE%A2%E9%98%85%E4%B8%8E%E8%A7%84%E5%88%99%E7%9A%84%E5%88%86%E7%A6%BB-bdd77bfdf9f1)

