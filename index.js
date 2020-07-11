const request = require("request");
const yaml = require("js-yaml");
const schedule = require("node-schedule");
const YAML = require("json-to-pretty-yaml");
const { forkJoin, of, Observable } = require("rxjs");
const fs = require("fs");
const { map } = require("rxjs/operators");
const url = "xxoo";

const getRules = () => {
  // 合并两个流，一个是 节点，一个是订阅
  forkJoin(
    new Observable(function (observer) {
      request(url, function (error, response, body) {
        if (error) {
          observer.error();
        } else {
          observer.next(body);
        }
        observer.complete();
      });
    }).pipe(map((proxiesConfigYml) => yaml.load(proxiesConfigYml))),
    // 如果是网络节点自行引入即可
    of(require("./rule.json")),
  )
    .pipe(
      //   对节点进行过滤转换操作
      map(([proxiesConfigJson, rules]) => ({
        ...rules,
        proxies: proxiesConfigJson.Proxy.filter(
          (item) =>
            !item.name.includes("专线") ||
            !item.name.includes("01") ||
            !item.name.includes("日本") ||
            !item.name.includes("韩国") ||
            !item.name.includes("德国"),
        ),
      })),
      map((rules) => ({
        ...rules,
        // 节点写入配置文件里，把对应的节点加入 select，这里我只做了归类，没有加入 select，有需要自己做
        ["proxy-groups"]: rules["proxy-groups"].map((item) => {
          if (item.name === "Proxies") {
            return {
              ...item,
              proxies: ["HK", "SG", "JP", "US", "TW"].concat(rules.proxies.map((proxy) => proxy.name)),
            };
          }

          if (item.name === "HK") {
            return {
              ...item,
              proxies: rules.proxies.filter((proxy) => proxy.name.includes("香港")).map((proxy) => proxy.name),
            };
          }
          if (item.name === "SG") {
            return {
              ...item,
              proxies: rules.proxies.filter((proxy) => proxy.name.includes("新加坡")).map((proxy) => proxy.name),
            };
          }
          if (item.name === "JP") {
            return {
              ...item,
              proxies: rules.proxies.filter((proxy) => proxy.name.includes("日本")).map((proxy) => proxy.name),
            };
          }

          if (item.name === "US") {
            return {
              ...item,
              proxies: rules.proxies.filter((proxy) => proxy.name.includes("美国")).map((proxy) => proxy.name),
            };
          }
          if (item.name === "TW") {
            return {
              ...item,
              proxies: rules.proxies.filter((proxy) => proxy.name.includes("台湾")).map((proxy) => proxy.name),
            };
          }
          if (item.name === "Mail") {
            return {
              ...item,
              proxies: rules.proxies.filter((proxy) => proxy.name.includes("中继")).map((proxy) => proxy.name),
            };
          }

          return item;
        }),
      })),
    )
    .subscribe((rules) => {
      // 转换为 yml
      const newRulesFile = YAML.stringify(rules);

      // 读取一下当前配置
      fs.readFile("/Users/jinzhuming/.config/clash/rules.yaml", "utf-8", (err, data) => {
        // 不一样就不替换
        if (data === newRulesFile) {
          console.log("相同不触发替换");
        } else {
          // 写入配置文件
          fs.writeFile("/Users/jinzhuming/.config/clash/rules.yaml", newRulesFile, () => {});
        }
      });
    });
};

const scheduleCronstyle = () => {
  // 定时每天1点30启动
  schedule.scheduleJob("30 13 1 * * *", () => {
    getRules();
  });
};

// 启动脚本立即执行一次
getRules();
scheduleCronstyle();
