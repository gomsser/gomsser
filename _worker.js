// 定义域名数组
let domains = [];
// 定义IPv4和IPv6数组，用于存储解析后的IP地址
let IPv4 = [];
let IPv6 = [];
let banIP = [];
// 定义API列表
let ipAPI = [];//'https://ipdb.030101.xyz/api/bestproxy.txt'
// 定义DoH（DNS over HTTPS）URL
let dohURL = 'https://cloudflare-dns.com/dns-query';

//Cloudflare DDNS
let CF邮箱 = '';//admin@gmail.com
let CF域名 = '';//ddns.google.com
let CF区域ID = '';//6f0b34f36efb4bdaf5e22d68ac8e5c96
let CFAPI令牌 = '';//tGb4_4f3efb4bdaf5e22d68ac8exRnJTC6-IWocs

let 执行日志 = '';

let BotToken ='';
let ChatID =''; 
let tgmsg = '';

let 解析成功次数 = 0;
let 解析失败次数 = 0;

export default {
	async fetch(request, env, ctx) {
		执行日志 = '';
		let result = '';
		try {
			if (env.DOMAIN) domains = await ADD(env.DOMAIN);
			if (env.IPV4) IPv4 = await ADD(env.IPV4);
			if (env.IPV6) IPv6 = await ADD(env.IPV6);
			if (env.BANIP) banIP = await ADD(env.BANIP);
			if (env.IPAPI) ipAPI = await ADD(env.IPAPI);
			dohURL = env.DOH || dohURL;
			
			CF邮箱 = env.CFMAIL || CF邮箱;
			CF域名 = env.CFDOMAIN || CF域名;
			CF区域ID = env.CFZONEID || CF区域ID; 
			CFAPI令牌 = env.CFKEY || CFAPI令牌; 
			
			BotToken = env.TGTOKEN || BotToken;
			ChatID = env.TGID || ChatID; 
			
			log('变量加载完成');
			if ((domains.length + IPv4.length + IPv6.length + ipAPI.length) == 0) {
				domains = ['cdn.xn--b6gac.eu.org'];
				log('DOMAIN、IPV4、IPV6、IPAPI变量值均为空，添加 演示解析域名 cdn.xn--b6gac.eu.org')
			}
			// 更新IPv4和IPv6数组
			const d2ip = await updateIPArrays(domains);
			IPv4 = IPv4.concat(d2ip[0]);
			IPv6 = IPv6.concat(d2ip[1]);
			log('域名解析完成');
			
			const api2ip = await API2ip(ipAPI);
			IPv4 = IPv4.concat(api2ip[0]);
			IPv6 = IPv6.concat(api2ip[1]);
			log('API调用完成');
			
			// 对数组进行去重
			IPv4 = [...new Set(IPv4)];
			IPv6 = [...new Set(IPv6)];
			log('IP去重完成');
			
			// 处理被banIP
			IPv4 = IPv4.filter(ip => !banIP.includes(ip));
			IPv6 = IPv6.filter(ip => !banIP.includes(ip));
			log('BAN_IP清理完成');
		
			const url = new URL(request.url);
			console.log(url.pathname);
			if (url.pathname == '/go') {
				const token = url.searchParams.get('token');
				if (env.TOKEN && env.TOKEN != token) {
				if (!token) log('token不能为空');
				else log('token不正确');
				result = await 输出结果(0);
				} else {
				log('手动执行');
				result = await 输出结果(1);
				}
			} else {
				result = await 输出结果(0);
			}
		} catch (error) {
			log(`发生错误: ${error.message}`);
			console.error(error);
			// 即使发生错误，也确保调用输出结果
			result = await 输出结果(0);
		}
		
		// 返回输出结果作为响应
		return new Response(result);
	},
	
	// 添加对scheduled事件的处理
	async scheduled(event, env, ctx) {
		// 在这里执行定期任务的逻辑
		console.log("Cron job started at " + new Date().toUTCString());
		
		// 复用fetch方法中的逻辑
		if (env.DOMAIN) domains = await ADD(env.DOMAIN);
		if (env.IPV4) IPv4 = await ADD(env.IPV4);
		if (env.IPV6) IPv6 = await ADD(env.IPV6);
		if (env.BANIP) banIP = await ADD(env.BANIP);
		if (env.IPAPI) ipAPI = await ADD(env.IPAPI);
		dohURL = env.DOH || dohURL;
	
		CF邮箱 = env.CFMAIL || CF邮箱;
		CF域名 = env.CFDOMAIN || CF域名;
		CF区域ID = env.CFZONEID || CF区域ID; 
		CFAPI令牌 = env.CFKEY || CFAPI令牌; 
	
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID; 
	
		log('Cron: 变量加载完成');
		if( (domains.length + IPv4.length + IPv6.length + ipAPI.length) == 0){
			domains = ['cdn.xn--b6gac.eu.org'];
			log('DOMAIN、IPV4、IPV6、IPAPI变量值均为空，添加 演示解析域名 cdn.xn--b6gac.eu.org')
		}
		// 更新IPv4和IPv6数组
		const d2ip = await updateIPArrays(domains);
		IPv4 = IPv4.concat(d2ip[0]);
		IPv6 = IPv6.concat(d2ip[1]);
		log('Cron: 域名解析完成');
	
		const api2ip = await API2ip(ipAPI);
		IPv4 = IPv4.concat(api2ip[0]);
		IPv6 = IPv6.concat(api2ip[1]);
		log('Cron: API调用完成');
	
		// 对数组进行去重
		IPv4 = [...new Set(IPv4)];
		IPv6 = [...new Set(IPv6)];
		log('Cron: IP去重完成');
	
		// 处理被banIP
		IPv4 = IPv4.filter(ip => !banIP.includes(ip));
		IPv6 = IPv6.filter(ip => !banIP.includes(ip));
		log('Cron: BAN_IP清理完成');

		// 执行输出结果，但不需要返回Response对象
		await 输出结果(1);
		
		console.log("Cron job completed at " + new Date().toUTCString());
	}
};

async function sendMessage(msg) {
	if ( BotToken !== '' && ChatID !== ''){
		let url = "https://api.telegram.org/bot"+ BotToken +"/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		console.log(msg);
		log(`TG推送完成`);
		
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	} else {
		log(`TG推送关闭`);
	}
}

// 更新IP数组的函数
async function API2ip(APIs) {
	let IP4 = [];
	let IP6 = [];
	if (!APIs || APIs.length === 0) {
		return [IP4, IP6];
	}

	let newIP = "";

	// 创建一个AbortController对象，用于控制fetch请求的取消
	const controller = new AbortController();

	const timeout = setTimeout(() => {
		controller.abort(); // 取消所有请求
	}, 2000); // 2秒后触发

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		// 对api数组进行遍历，对每个API地址发起fetch请求
		const responses = await Promise.allSettled(APIs.map(apiUrl => fetch(apiUrl, {
			method: 'get', 
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'User-Agent': 'cmliu/CF-Workers-DD2D'
			},
			signal: controller.signal // 将AbortController的信号量添加到fetch请求中，以便于需要时可以取消请求
		}).then(response => response.ok ? response.text() : Promise.reject())));

		// 遍历所有响应
		for (const response of responses) {
			// 检查响应状态是否为'fulfilled'，即请求成功完成
			if (response.status === 'fulfilled') {
				// 获取响应的内容
				const content = await response.value;
				newIP += content + '\n';
			}
		}
	} catch (error) {
		console.error(error);
	} finally {
		// 无论成功或失败，最后都清除设置的超时定时器
		clearTimeout(timeout);
	}

	const newIPs = await ADD(newIP);
	// 正则表达式匹配IPv4地址
	const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

	// 正则表达式匹配IPv6地址
	const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))$/;

	newIPs.forEach(ip => {
		if (ipv4Regex.test(ip)) {
			IP4.push(ip);
			log(`API获取 A记录${ip}`);
		} else if (ipv6Regex.test(ip)) {
			IP6.push(ip);
			log(`API获取 AAAA记录${ip}`);
		}
	});

	return [IP4, IP6];
}

// 使用DoH解析域名的函数
async function fetchDNSRecords(domain, type) {
	// 构建查询参数
	const query = new URLSearchParams({
		name: domain,
		type: type
	});
	const url = `${dohURL}?${query.toString()}`;

	// 发送HTTP GET请求
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/dns-json' // 接受DNS JSON格式的响应
		}
	});

	// 检查响应是否成功
	if (!response.ok) {
		throw new Error(`获取DNS记录失败: ${response.statusText}`);
	}

	// 解析响应数据
	const data = await response.json();
	return data.Answer || [];
}

// 更新IP数组的函数
async function updateIPArrays(domains) {
	let IP4 = [];
	let IP6 = [];
	for (const domain of domains) {
		try {
			// 获取域名的A记录
			const aRecords = await fetchDNSRecords(domain, 'A');
			for (const record of aRecords) {
				if (record.type === 1) { // A记录
					IP4.push(record.data);
					log(`解析域名 ${domain} A记录${record.data}`);
				}
			}
			
			// 获取域名的AAAA记录
			const aaaaRecords = await fetchDNSRecords(domain, 'AAAA');
			for (const record of aaaaRecords) {
				if (record.type === 28) { // AAAA记录
					IP6.push(record.data);
					log(`解析域名 ${domain} AAAA记录${record.data}`);
				}
			}
		} catch (error) {
			console.error(`解析域名 ${domain} 时出错:`, error);
		}
	}
	
	return [IP4, IP6];
}

// 输出结果的函数
async function 输出结果(on) {
	解析成功次数 = 0;
	解析失败次数 = 0;

	// 构建IPv6输出字符串
	let IPv6Text = ''
	if (IPv6.length != 0){
		IPv6Text = `\nIPv6：\n${IPv6.join('\n')}\n`;
	}

	let APIText = ''
	if (ipAPI.length != 0){
		APIText = `\nIP_API：\n${ipAPI.join('\n')}\n`;
	}

	let banIPTest = ''
	if (banIP.length != 0){
		banIPTest = `\nBAN_IP：\n${banIP.join('\n')}\n`;
	}

	let domainsTest = '';
	if (domains.length != 0){
		domainsTest = `\n解析域名：\n${domains.join('\n')}\n`;
	}

	// 构建解析记录列表
	const 解析记录列表 = [...IPv4.map(ip => ({ type: 'A', content: ip })), ...IPv6.map(ip => ({ type: 'AAAA', content: ip }))];

	const CF配置检查 = CF域名 + CF区域ID + CFAPI令牌 + CF邮箱;
	let CF配置信息
	if (CF配置检查 && CF配置检查 != '' && on == 1){
		CF配置信息 = `域名：${CF域名}
邮箱：${CF邮箱.substring(0, 1)}******
区域ID：${CF区域ID.substring(0, 3)}*************************${CF区域ID.substring(CF区域ID.length - 4)}
API令牌：${CFAPI令牌.substring(0, 3)}*************************${CFAPI令牌.substring(CFAPI令牌.length - 4)}`;
		const 域名现有解析ID_URL = `https://api.cloudflare.com/client/v4/zones/${CF区域ID}/dns_records?name=${CF域名}`;
		const response = await fetch(域名现有解析ID_URL, {
			method: 'GET',
			headers: {
				'X-Auth-Email': CF邮箱,
				'Authorization': `Bearer ${CFAPI令牌}`,
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		console.log(JSON.stringify(data, null, 2));
		let 域名现有解析ID = [];
		if (!data.success || data.result.length === 0){
			log(`${CF域名} 域名解析为空，跳过删除域名流程`)
		} else {
			for (let record of data.result) {
				域名现有解析ID.push(record.id);
			}
			log(`现有域名ID\n${域名现有解析ID.join('\n')}`);
		}

		// 并发删除域名
		await 批量删除域名(域名现有解析ID);

		await new Promise(resolve => setTimeout(resolve, 8000));

		// 调用批量添加解析
		await 批量添加解析(解析记录列表);

	} else {
		if(on == 0){
			CF配置信息 = `域名：${CF域名}
邮箱：${CF邮箱.substring(0, 1)}******
区域ID：${CF区域ID.substring(0, 3)}*************************${CF区域ID.substring(CF区域ID.length - 4)}
API令牌：${CFAPI令牌.substring(0, 3)}*************************${CFAPI令牌.substring(CFAPI令牌.length - 4)}`;
		} else {
			CF配置信息 = 'Cloudflare配置信息错误！'
		}
		
	}
	// 构建最终的输出文本
	const text = `Domains DDNS to Domain
################################################################
Cloudflare域名配置信息
---------------------------------------------------------------
${CF配置信息}

---------------------------------------------------------------
################################################################
配置信息
---------------------------------------------------------------
DoH：
${dohURL}
${domainsTest}${APIText}
---------------------------------------------------------------
################################################################
整理结果
---------------------------------------------------------------
IPv4：
${IPv4.join('\n')}
${IPv6Text}${banIPTest}
---------------------------------------------------------------
################################################################
执行日志
---------------------------------------------------------------
${执行日志}

---------------------------------------------------------------
################################################################
telegram 交流群 技术大佬~在线发牌!
https://t.me/CMLiussss
---------------------------------------------------------------
github 项目地址 Star!Star!Star!!!
https://github.com/cmliu/CF-Workers-DD2D
---------------------------------------------------------------
################################################################`;
	if(on == 1) await sendMessage(`Domains DDNS to Domain:\n${CF域名} 解析完成! 成功: ${解析成功次数} 失败: ${解析失败次数}${tgmsg}`);
	return text;
}

async function log(text) {
	// 获取当前的 UTC 时间
	const now = new Date();
	
	// 将 UTC 时间转换为中国时间 (CST, UTC+8)
	const offset = 8 * 60 * 60 * 1000; // 8 小时的毫秒数
	const chinaTime = new Date(now.getTime() + offset);
		
	// 格式化为 yyyy-MM-dd HH:mm:ss
	const formattedTime = formatDate(chinaTime);
	执行日志 += formattedTime + ' ' + text + '\n' ;
	console.log(text);
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function ADD(envadd) {
	var addtext = envadd.replace(/[	 |"'\r\n]+/g, ',').replace(/,+/g, ','); // 将空格、双引号、单引号和换行符替换为逗号
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split(',');
	return add;
}

async function 批量删除域名(域名ID数组) {
	const 批次大小 = 4; // 每批并发请求的数量
	const 批次间隔 = 2000; // 批次之间的间隔时间（毫秒）
  
	for (let i = 0; i < 域名ID数组.length; i += 批次大小) {
		const 当前批次 = 域名ID数组.slice(i, i + 批次大小);
		
		// 并发删除当前批次的域名
		const 删除promises = 当前批次.map(域名ID => 删除域名(域名ID));
		const results = await Promise.allSettled(删除promises);
		
		results.forEach((result, index) => {
			if (result.status === 'fulfilled') {
			log(`${CF域名}:${当前批次[index]} 删除成功`);
			} else {
			log(`${CF域名}:${当前批次[index]} 删除失败: ${result.reason}`);
			}
		});
	
		// 如果还有下一批，则等待指定的间隔时间
		if (i + 批次大小 < 域名ID数组.length) {
			await new Promise(resolve => setTimeout(resolve, 批次间隔));
		}
	}
}
  
// 删除单个域名的函数保持不变
async function 删除域名(域名ID) {
	const 删除域名_URL = `https://api.cloudflare.com/client/v4/zones/${CF区域ID}/dns_records/${域名ID}`;
	const response = await fetch(删除域名_URL, {
		method: 'DELETE',
		headers: {
			'X-Auth-Email': CF邮箱,
			'Authorization': `Bearer ${CFAPI令牌}`,
			'Content-Type': 'application/json'
		}
	});
	const data = await response.json();
	console.log(JSON.stringify(data, null, 2));
	if (!data.success) {
		throw new Error(`删除失败: ${JSON.stringify(data.errors)}`);
	}
}

async function 批量添加解析(解析记录列表) {
	const 批次大小 = 4; // 每批并发请求的数量
	const 批次间隔 =2000; // 批次之间的间隔时间（毫秒）
  
	for (let i = 0; i < 解析记录列表.length; i += 批次大小) {
		const 当前批次 = 解析记录列表.slice(i, i + 批次大小);
		
		// 并发发送当前批次的请求
		await Promise.all(当前批次.map(记录 => 添加解析(记录.type, 记录.content)));
		
		// 如果还有下一批，则等待指定的间隔时间
		if (i + 批次大小 < 解析记录列表.length) {
			await new Promise(resolve => setTimeout(resolve, 批次间隔));
		}
	}
}
  
// 修改添加解析函数，返回一个 Promise
async function 添加解析(A, IP) {
	const 添加解析_URL = `https://api.cloudflare.com/client/v4/zones/${CF区域ID}/dns_records`;
	try {
		const response = await fetch(添加解析_URL, {
			method: 'POST',
			headers: {
			'X-Auth-Email': CF邮箱,
			'Authorization': `Bearer ${CFAPI令牌}`,
			'Content-Type': 'application/json',
			},
			body: JSON.stringify({
			type: A,
			name: CF域名,
			content: IP,
			ttl: 60,
			proxied: false
			})
		});
		const data = await response.json();
		console.log(JSON.stringify(data, null, 2));
		if (data.success) {
			解析成功次数 += 1;
			tgmsg += `\n${A}记录: ${IP}`
			log(`${CF域名} 成功 ${A}记录: ${IP}`);
		} else {
			解析失败次数 += 1;
			tgmsg += `\n失败: ${IP}`
			log(`${CF域名} 失败 ${A}记录: ${IP}`);
		}
	} catch (error) {
		解析失败次数 += 1;
		tgmsg += `\n失败: ${IP}`
		log(`${CF域名} 失败 ${A}记录: ${IP}`);
	}
}
