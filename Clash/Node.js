//https://raw.githubusercontent.com/chuan0712/Utility-Room/main/Clash/Node.js

// 程序入口
function main(config) {

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
    "fake-ip-filter": ["*","+.lan","+.local","+.msftncsi.com","+.msftconnecttest.com"],
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
      "skip-src-address": [
      "127.0.0.0/8",
      "192.168.0.0/16",
      "10.0.0.0/8",
      "172.16.0.0/12",
    ],
    "force-domain": [
      "+.google.com",
      "+.googleapis.com",
      "+.googleusercontent.com",
      "+.youtube.com",
      "+.facebook.com",
      "+.messenger.com",
      "+.fbcdn.net",
      "+.akamaihd.net",
    ],
    "skip-domain": ["Mijia Cloud", "+.oray.com"],
  };

  //建立常量
  const common = ["🇨🇳 国内直连", "🚫 丢弃连接", "🇭🇰 自动选择","🇭🇰 负载均衡","🇸🇬 自动选择","🇸🇬 负载均衡","🇺🇸 自动选择","🇺🇸 负载均衡"];
  const auto   = {"include-all": true, type: "url-test", interval: 300, tolerance: 50, "max-failed-times": 3};
  const lb     = {"include-all": true, type: "load-balance", strategy: "consistent-hashing"};

  //生成proxy-groups配置。
  config["proxy-groups"] = [
    {name: "✈️ 节点总览", "include-all": true, type: "select"},

    { name: "🔗 默认代理", type: "select", proxies: common }, // 引用外部常量
    { name: "🎶 音乐媒体", type: "select", proxies: common },
    { name: "🔍 微软必应", type: "select", proxies: common },
    { name: "☁️ 微软云盘", type: "select", proxies: common },

    // 自动选择组
    { name: "🇭🇰 自动选择", ...auto, filter: "(?i)港|🇭🇰|HongKong|Hong Kong" },
    { name: "🇸🇬 自动选择", ...auto, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore" },
    { name: "🇺🇸 自动选择", ...auto, filter: "(?i)美|US|America|United States" },

    // 负载均衡组（通常隐藏）
    { name: "🇭🇰 负载均衡", ...lb, filter: "(?i)港|🇭🇰|HongKong|Hong Kong", hidden: true },
    { name: "🇸🇬 负载均衡", ...lb, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore", hidden: true },
    { name: "🇺🇸 负载均衡", ...lb, filter: "(?i)美|US|America|United States", hidden: true },

    // 直连和丢弃组 (通常隐藏)
    { name: "🇨🇳 国内直连", type: "select", proxies: ["DIRECT"], hidden: true },
    { name: "🚫 丢弃连接", type: "select", proxies: ["REJECT"], hidden: true }
  ];


  config["rule-providers"] = [
    ["cn",        "https://cdn.jsdelivr.net/gh/chuan0712/Utility-Room@main/Clash/cn.yaml", "cn.yaml"],
    ["Ads",       "https://cdn.jsdelivr.net/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash-Classical.yaml", "Ads.yaml"],
    ["OneDrive",  "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OneDrive/OneDrive.yaml", "OneDrive.yaml"],
    ["YouTube",   "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/YouTube/YouTube.yaml", "YouTube.yaml"],
    ["Spotify",   "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.yaml", "Spotify.yaml"],
    ["Openai",    "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml", "OpenAI.yaml"],
    ["Gemini",    "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Gemini/Gemini.yaml", "Gemini.yaml"],
    ["Telegram",  "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram.yaml", "Telegram.yaml"],
    ["SteamCN",   "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/SteamCN/SteamCN.yaml", "SteamCN.yaml"],
    ["GoogleFCM", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/GoogleFCM/GoogleFCM.yaml", "GoogleFCM.yaml"],
    ["Bing",      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Bing/Bing.yaml", "Bing.yaml"]
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
    "RULE-SET,cn,  🇨🇳 国内直连",
    "RULE-SET,Ads, 🚫 丢弃连接",
    "RULE-SET,Bing,     🔍 微软必应",
    "RULE-SET,OneDrive, ☁️ 微软云盘",
    "RULE-SET,GoogleFCM, 🇨🇳 国内直连",


    // 🎬 影音娱乐
    "RULE-SET,YouTube, 🇺🇸 负载均衡",
    "RULE-SET,Spotify, 🎶 音乐媒体",

    // 🤖 人工智能
    "RULE-SET,Openai, 🇺🇸 负载均衡",
    "RULE-SET,Gemini, 🇺🇸 负载均衡",

    // 💬 社交平台
    "RULE-SET,Telegram, 🇸🇬 负载均衡",

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
