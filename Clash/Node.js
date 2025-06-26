
// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 定义直连 DNS 和代理 DNS 的数组
  const direct_dns = ["https://doh.pub/dns-query", "https://dns.alidns.com/dns-query"];
  const proxy_dns = ["https://dns.google/dns-query", "https://cloudflare-dns.com/dns-query"];

  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "ipv6": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist", // 黑名单
    "fake-ip-filter": ["*","+.lan","+.local","+.direct","+.msftncsi.com","+.msftconnecttest.com"],
    "use-hosts": true,
    "use-system-hosts": true,
    "respect-rules": true, // 遵循规则
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "nameserver-policy": {"+.internal.crop.com": ["10.0.0.1"], "geosite:cn": direct_dns},
    "nameserver": direct_dns, // 默认的域名解析服务器
    "fallback": proxy_dns, // 后备域名解析服务器
    "proxy-server-nameserver": direct_dns,
    "direct-nameserver": direct_dns,
    "direct-nameserver-follow-policy": false // 直连 DNS 是否遵循 nameserver-policy
  };

  // 覆盖 geodata 配置
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip-lite.dat",
    "geosite": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite-lite.dat",
    "mmdb": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country-lite.mmdb",
    "asn": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/GeoLite2-ASN.mmdb"
  };

  // 覆盖 sniffer 配置
  config["sniffer"] = {
    "enable": true,
    "force-dns-mapping": true, // 强制使用 DNS 映射
    "parse-pure-ip": false, // 是否解析纯 IP 地址
    "override-destination": true, // 是否覆盖目标地址
    "sniff": {
      "TLS":  { "ports": [443, 8443], },
      "HTTP": { "ports": [80, "8080-8880"], },
      "QUIC": { "ports": [443, 8443], },
    },
  };



// 定义常用的代理选项，用于select类型的代理组
  const commonProxies = ["🌏 全球直连", "🚫 广告过滤", "🇭🇰 自动选择", "🇭🇰 负载均衡", "🇸🇬 自动选择", "🇸🇬 负载均衡", "🇺🇸 自动选择", "🇺🇸 负载均衡"];
// 定义通用的排除过滤器，用于url-test和load-balance类型的代理组
  const commonExcludeFilter = "(?i)0\\.1倍|0\\.01倍";

//创建一个select类型的代理组。
function createSelectGroup(name, proxies, hidden = false) { return { name, type: "select", proxies, hidden }; }


function createSmartGroup(name, type, filter, hidden = false) {
  const baseGroup = { name, "include-all": true, type, filter };
  if (type === "url-test")
    Object.assign(baseGroup, {
      interval: 300,
      url: "http://www.gstatic.com/generate_204",
      tolerance: 50,
      "max-failed-times": 3,
    });
  else if (type === "load-balance")
    Object.assign(baseGroup, {
      strategy: "consistent-hashing",
      hidden,
    });
  return baseGroup;
}

//创建一个rule-provider配置。
function createRuleProvider(name, url, path) {
  return {
    type: "http",
    interval: 86400, // 每天更新一次
    behavior: "classical",
    format: "yaml",
    url: url,
    path: `./ruleset/classical/${path}`
  };
}

//生成proxy-groups配置。
config["proxy-groups"] = [
  {name: "✈️ 节点总览", "include-all": true, type: "select"},

  createSelectGroup("🔗 默认代理", commonProxies), // 引用外部常量
  createSelectGroup("🎶 音乐媒体", commonProxies),
  createSelectGroup("🔍 微软必应", commonProxies),
  createSelectGroup("☁️ 微软云盘", commonProxies),
  createSelectGroup("Ⓜ️ 微软商店", commonProxies),

  // 自动选择组
  createSmartGroup("🇭🇰 自动选择", "url-test", "(?i)港|🇭🇰|HongKong|Hong Kong"),
  createSmartGroup("🇸🇬 自动选择", "url-test", "(?i)新加坡|坡|狮城|🇸🇬|Singapore"),
  createSmartGroup("🇺🇸 自动选择", "url-test", "(?i)美|US|America|United States"),

  // 负载均衡组 (通常隐藏)
  createSmartGroup("🇭🇰 负载均衡", "load-balance", "(?i)港|🇭🇰|HongKong|Hong Kong", true),
  createSmartGroup("🇸🇬 负载均衡", "load-balance", "(?i)新加坡|坡|狮城|🇸🇬|Singapore", true),
  createSmartGroup("🇺🇸 负载均衡", "load-balance", "(?i)美|US|America|United States", true),

  // 直连和拒绝组 (通常隐藏)
  createSelectGroup("🌏 全球直连", ["DIRECT"], true),
  createSelectGroup("🚫 广告过滤", ["REJECT"], true)
];

  //生成rule-providers配置。
  config["rule-providers"] = {
    cn:        createRuleProvider("cn", "https://cdn.jsdelivr.net/gh/chuan0712/Utility-Room@main/Clash/cn.yaml", "cn.yaml"),
    Ads:       createRuleProvider("Ads", "https://cdn.jsdelivr.net/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.yaml", "Ads.yaml"),
    YouTube:   createRuleProvider("YouTube", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/YouTube/YouTube.yaml", "YouTube.yaml"),
    Spotify:   createRuleProvider("Spotify", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.yaml", "Spotify.yaml"),
    Openai:    createRuleProvider("Openai", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml", "OpenAI.yaml"),
    Gemini:    createRuleProvider("Gemini", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Gemini/Gemini.yaml", "Gemini.yaml"),
    Telegram:  createRuleProvider("Telegram", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram.yaml", "Telegram.yaml"),
    SteamCN:   createRuleProvider("SteamCN", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/SteamCN/SteamCN.yaml", "SteamCN.yaml"),
    GoogleFCM: createRuleProvider("GoogleFCM", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/GoogleFCM/GoogleFCM.yaml", "GoogleFCM.yaml"),
    Bing:      createRuleProvider("Bing", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Bing/Bing.yaml", "Bing.yaml")
}

  //生成rules配置。
  config["rules"] = [
    // 📦 基础规则
    "RULE-SET,cn,  🌏 全球直连",
    "RULE-SET,Ads, 🚫 广告过滤",
    "PROCESS-NAME, OneDrive.exe,☁️ 微软云盘",
    "PROCESS-NAME, WinStore.App.exe,Ⓜ️ 微软商店",

    // 🎬 影音娱乐
    "RULE-SET,YouTube, 🇺🇸 负载均衡",
    "RULE-SET,Spotify, 🎶 音乐媒体",

    // 🤖 人工智能
    "RULE-SET,Openai, 🇺🇸 负载均衡",
    "RULE-SET,Gemini, 🇺🇸 负载均衡",

    // 💬 社交平台
    "RULE-SET,Telegram, 🇸🇬 负载均衡",

    // 🎮 游戏平台
    "RULE-SET,SteamCN, 🌏 全球直连",

    // 🧰 工具服务
    "RULE-SET,GoogleFCM, 🌏 全球直连",
    "RULE-SET,Bing, 🔍 微软必应",

    // 🌐 GEO 规则
    "GEOSITE,private, 🌏 全球直连",
    "GEOSITE,cn, 🌏 全球直连",
    "GEOIP,private, 🌏 全球直连,no-resolve",
    "GEOIP,CN, 🌏 全球直连,no-resolve",

    // 默认规则
    "MATCH, 🔗 默认代理",
]


  // 返回修改后的配置
  return config;
}
