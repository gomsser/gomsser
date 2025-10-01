# Domains DDNS to Domain
将多个域名IP解析至指定域名的worker.js脚本

## 部署方式

- **Workers** 部署：复制 [_worker.js](https://github.com/cmliu/CF-Workers-DD2D/blob/main/_worker.js) 代码，`保存并部署`即可

## 如何使用？
例如 您的Workers项目域名为：`dd2d.fxxk.workers.dev`；

1. 如你想将`cdn.xn--b6gac.eu.org`和`my-telegram-is-herocore.onecf.eu.org`内的IP解析到你的`ddns.google.com`下，你可以设置如下变量
    - 变量名`DOMAIN`，值为`cdn.xn--b6gac.eu.org,my-telegram-is-herocore.onecf.eu.org`，支持多元素之间使用`,`或**换行**作间隔；

2. 如你想将`https://ipdb.030101.xyz/api/bestproxy.txt`列表内的IP解析到你的`ddns.google.com`下，你可以设置如下变量
    - 变量名`IPAPI`，值为`https://ipdb.030101.xyz/api/bestproxy.txt`，支持多元素之间使用`,`或**换行**作间隔；

### 手动执行
- 访问`https://dd2d.fxxk.workers.dev`即可**查看DD2D配置信息**；
- 访问`https://dd2d.fxxk.workers.dev/go`即可**手动执行**DD2D域名解析任务；
- *如果你设置了`TOKEN`变量则需要访问`https://dd2d.fxxk.workers.dev/go?token=admin`才会手动执行DD2D域名解析任务。*

### 定时任务
- 设置添加`Cron 触发器`即可；
- 例如`0 */8 * * *`为**每8小时执行一次**，更多定时任务Cron写法请自行GPT。

## 变量说明
| 变量名 | 示例 | 必填 | 备注 |
|--------|---------|-|-----|
| CFMAIL  | `admin@gmail.com` |√| Cloudflare 登录邮箱 |
| CFDOMAIN  | `ddns.google.com` |√| Cloudflare 待解析域名 |
| CFZONEID   | `6f0b34f36efb4bdaf5e22d68ac8e5c96` |√| Cloudflare 区域ID | 
| CFKEY  | `tGb4_4f5e23efb4d68ac28exRnJTfbdaC6-IWocs` |√| Cloudflare API令牌 |
| TOKEN | `admin` |×| **手动执行**时验证token，token不正确将不会执行DD2D |
| DOH | `https://cloudflare-dns.com/dns-query` |×| DoH（DNS over HTTPS）URL |
| DOMAIN | `cdn.xn--b6gac.eu.org` |×| 获取待解析至`待解析域名`IP的域名(支持多元素之间`,`或 换行 作间隔) |
| IPV4 | `8.8.8.8` |×| 待解析至`待解析域名`IPv4(支持多元素之间`,`或 换行 作间隔) |
| IPV6 | `2406:8dc0:6004:7019:ca7a:65a0:d3d7:1467` |×| 待解析至`待解析域名`IPv6(支持多元素之间`,`或 换行 作间隔) |
| BANIP | `1.1.1.1,2406:8dc0:6004:7019:ca7a:65a0:d3d7:1467` |×| 拉黑IP将不会解析至`待解析域名`(支持多元素之间`,`或 换行 作间隔) |
| IPAPI | `https://ipdb.030101.xyz/api/bestproxy.txt` |×| 通过API获取待解析至`待解析域名`IP的接口(支持多元素之间`,`或 换行 作间隔) |
| TGTOKEN | `6894123456:XXXXXXXXXX0qExVsBPUhHDAbXXX` |×| 发送TG通知的机器人token | 
| TGID | `6946912345` |×| 接收TG通知的账户数字ID | 

