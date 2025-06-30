// https://raw.githubusercontent.com/chuan0712/Utility-Room/main/Clash/Note.js

// 程序入口
function main(config) {

  // 定义直连 DNS 和代理 DNS 的数组
  const direct_dns = ["quic://dns.alidns.com", "https://doh.pub/dns-query"];
  const proxy_dns  = ["quic://cloudflare-dns.com", "https://dns.google/dns-query"];

  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "ipv6": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist", // 黑名单
    "fake-ip-filter": ["*","+.lan","+.local","+.msftncsi.com","+.msftconnecttest.com"],
    "use-hosts": true,
    "use-system-hosts": true,
    "respect-rules": true, // 遵循规则
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "proxy-server-nameserver": direct_dns,
    "nameserver-policy": {"+.arpa": ["10.0.0.1"]},
    "nameserver": proxy_dns, // 默认的域名解析服务器
    "direct-nameserver": direct_dns,
    "direct-nameserver-follow-policy": false // 直连 DNS 是否遵循 nameserver-policy
  };

  // 覆盖 sniffer 配置
  config["sniffer"] = {
    "enable": true,
    "force-dns-mapping": true, // 强制使用 DNS 映射
    "parse-pure-ip": true, // 是否解析纯 IP 地址
    "override-destination": true, // 是否覆盖目标地址
    "sniff": {
      "TLS":  { "ports": [443, 8443], },
      "HTTP": { "ports": [80, "8080-8880"], },
      "QUIC": { "ports": [443, 8443], },
    },
      "skip-src-address": [ //对于目标ip跳过嗅探
      "127.0.0.0/8",
      "192.168.0.0/16",
      "10.0.0.0/8",
      "172.16.0.0/12",
    ],
    "force-domain": ["+.v2ex.com"],
    "skip-domain":  ["Mijia Cloud", "+.oray.com"],
  };

  //建立常量
  const common = ["🇨🇳 国内直连", "🚫 拒绝连接", "🇭🇰 自动选择","🇭🇰 负载均衡","🇸🇬 自动选择","🇸🇬 负载均衡","🇺🇸 自动选择","🇺🇸 负载均衡"];
  const auto   = {"include-all": true, type: "url-test", interval: 300, tolerance: 50, "max-failed-times": 3};
  const lb     = {"include-all": true, type: "load-balance", strategy: "consistent-hashing"};

  //生成proxy-groups配置。
  config["proxy-groups"] = [
    {name: "✈️ 节点总览", "include-all": true, type: "select"},

    { name: "🔗 默认代理", type: "select", proxies: common }, // 引用外部常量
    { name: "🔍 微软必应", type: "select", proxies: common },
    { name: "Ⓜ️ 微软服务", type: "select", proxies: common },
    { name: "📲 社交平台", type: "select", proxies: common },
    { name: "📹 油管视频", type: "select", proxies: common },
    { name: "🗨️ 智能助理", type: "select", proxies: common },
    { name: "🎶 音乐媒体", type: "select", proxies: common },



    // 自动选择组
    { name: "🇭🇰 自动选择", ...auto, filter: "(?i)港|🇭🇰|HongKong|Hong Kong" },
    { name: "🇸🇬 自动选择", ...auto, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore" },
    { name: "🇺🇸 自动选择", ...auto, filter: "(?i)美|US|America|United States" },

    // 负载均衡组（通常隐藏）
    { name: "🇭🇰 负载均衡", ...lb, filter: "(?i)港|🇭🇰|HongKong|Hong Kong" },
    { name: "🇸🇬 负载均衡", ...lb, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore" },
    { name: "🇺🇸 负载均衡", ...lb, filter: "(?i)美|US|America|United States", "exclude-filter": "(?i)0\\.1倍|0\\.01倍" },
    
    // 直连和拒绝组 (通常隐藏)
    { name: "🇨🇳 国内直连", type: "select", proxies: ["DIRECT"], hidden: true },
    { name: "🚫 拒绝连接", type: "select", proxies: ["REJECT"], hidden: true }
  ];


  config["rule-providers"] = [
    ["cn",        "https://cdn.jsdelivr.net/gh/chuan0712/Utility-Room@main/Clash/cn.yaml", "cn.yaml"],
    ["BanAD",     "https://cdn.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/BanAD.yaml", "BanAD.yaml"],
    ["Direct",    "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Direct/Direct.yaml", "Direct.yaml"],
    ["Bing",      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Bing/Bing.yaml", "Bing.yaml"],
    ["Microsoft", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Microsoft/Microsoft.yaml", "Microsoft.yaml"],
    ["YouTube",   "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/YouTube/YouTube.yaml", "YouTube.yaml"],
    ["Spotify",   "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.yaml", "Spotify.yaml"],
    ["Openai",    "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml", "OpenAI.yaml"],
    ["Gemini",    "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Gemini/Gemini.yaml", "Gemini.yaml"],
    ["Telegram",  "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram.yaml", "Telegram.yaml"],
    ["SteamCN",   "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/SteamCN/SteamCN.yaml", "SteamCN.yaml"],
  ].reduce((acc, [name, url, path]) => (
    acc[name] = {
      type: "http",
      interval: 86400,
      behavior: "classical",
      format: "yaml",
      url,
      path: `./ruleset/classical/${path}`
    }, acc
  ), {});


  //生成rules配置。
  config["rules"] = [
    // 📦 基础规则
    "RULE-SET,cn,     🇨🇳 国内直连",
    "RULE-SET,Direct, 🇨🇳 国内直连",
    "RULE-SET,BanAD,     🚫 拒绝连接", //仅常见广告域名,理论无影响
    "RULE-SET,Bing,      🔍 微软必应",
    "RULE-SET,Microsoft, Ⓜ️ 微软服务",


    // 🎬 影音视听
    "RULE-SET,YouTube, 📹 油管视频",
    "RULE-SET,Spotify, 🎶 音乐媒体",

    // 🤖 人工智能
    "RULE-SET,Openai,   🗨️ 智能助理",
    "RULE-SET,Gemini,   🗨️ 智能助理",

    // 📲 社交平台
    "RULE-SET,Telegram, 📲 社交平台",

    // 🎮 游戏平台
    "RULE-SET,SteamCN, 🇨🇳 国内直连",


    // 🌐 GEO 规则
    "GEOSITE,private, 🇨🇳 国内直连",
    "GEOSITE,cn,      🇨🇳 国内直连",
    "GEOIP,private, 🇨🇳 国内直连,no-resolve",
    "GEOIP,CN,      🇨🇳 国内直连,no-resolve",

    // 默认规则
    "MATCH, 🔗 默认代理",
]


  // 返回修改后的配置
  return config;
}
