// https://raw.githubusercontent.com/chuan0712/Utility-Room/main/Clash/note.js

// 程序入口
function main(config) {

  // 定义直连 DNS 和代理 DNS 的数组
  const direct_dns = ["quic://dns.alidns.com", "https://doh.pub/dns-query"];
  const proxy_dns  = ["https://cloudflare-dns.com/dns-query", "https://dns.google/dns-query"];

  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "ipv6": true,
    "listen": "0.0.0.0:1053",
    "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist", // 黑名单
    "fake-ip-filter": ["*","+.lan","+.local","time.*.com","ntp.*.com"],
    "respect-rules": true, // 遵循规则
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "proxy-server-nameserver": direct_dns,
    "nameserver": proxy_dns, // 默认的域名解析服务器
    "direct-nameserver": direct_dns,
  };

  // 覆盖 geodata 配置
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat",
    "geosite": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite-lite.dat",
    "mmdb": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb",
    "asn": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"
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
  };

  //建立常量
  const common = ["DIRECT","REJECT","🇭🇰 自动选择","🇭🇰 会话保持","🇸🇬 自动选择","🇸🇬 会话保持","🇺🇸 自动选择","🇺🇸 会话保持"];
  const auto   = {"include-all": true, type: "url-test", interval: 300, tolerance: 20};
  const lb     = {"include-all": true, type: "load-balance", strategy: "sticky-sessions"};

  //生成proxy-groups配置。
  config["proxy-groups"] = [
    {name: "✈️ 节点总览", "include-all": true, type: "select"},

    { name: "🔗 默认代理", type: "select", proxies: common }, // 引用外部常量
    { name: "🔍 微软必应", type: "select", proxies: common },
    { name: "Ⓜ️ 微软服务", type: "select", proxies: common },
    { name: "📲 电报消息", type: "select", proxies: common },
    { name: "📹 油管视频", type: "select", proxies: common },
    { name: "💬 智能助理", type: "select", proxies: common },
    { name: "🎶 音乐媒体", type: "select", proxies: common },

    // 自动选择
    { name: "🇭🇰 自动选择", ...auto, filter: "(?i)港|🇭🇰|HongKong|Hong Kong" },
    { name: "🇸🇬 自动选择", ...auto, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore" },
    { name: "🇺🇸 自动选择", ...auto, filter: "(?i)美|US|America|United States" },
    // 会话保持（通常隐藏）
    { name: "🇭🇰 会话保持", ...lb, filter: "(?i)港|🇭🇰|HongKong|Hong Kong", hidden: true },
    { name: "🇸🇬 会话保持", ...lb, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore", hidden: true },
    { name: "🇺🇸 会话保持", ...lb, filter: "(?i)美|US|America|United States", hidden: true },
  ];


  config["rule-providers"] = [
    ["cn",        "https://raw.githubusercontent.com/chuan0712/Utility-Room/main/Clash/cn.yaml", "cn.yaml"],
    ["Direct",    "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Direct/Direct.yaml", "Direct.yaml"],
    ["Bing",      "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Bing/Bing.yaml", "Bing.yaml"],
    ["Gemini",    "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Gemini/Gemini.yaml", "Gemini.yaml"],
    ["SteamCN",   "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/SteamCN/SteamCN.yaml", "SteamCN.yaml"],
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
    "RULE-SET,cn,      DIRECT",
    "RULE-SET,Direct,  DIRECT",
    "RULE-SET,SteamCN, DIRECT",
    "RULE-SET,Bing,    🔍 微软必应",
    "RULE-SET,Gemini,  💬 智能助理",


    // 🌐 GEO 规则
    "GEOSITE,microsoft,  Ⓜ️ 微软服务",
    "GEOSITE,google,     🔗 默认代理",
    "GEOSITE,youtube,    📹 油管视频",
    "GEOSITE,spotify,    🎶 音乐媒体",
    "GEOSITE,telegram,   📲 电报消息",
    "GEOSITE,openai,     💬 智能助理",
    "GEOSITE,cloudflare, 🔗 默认代理",
    "GEOSITE,private,    DIRECT",
    "GEOSITE,cn,         DIRECT",

    "GEOIP,google,      🔗 默认代理,no-resolve",
    "GEOIP,telegram,    📲 电报消息,no-resolve",
    "GEOIP,cloudflare,  🔗 默认代理,no-resolve",
    "GEOIP,private,     DIRECT,no-resolve",
    "GEOIP,CN,          DIRECT,no-resolve",

    // 漏网之鱼
    "MATCH, 🔗 默认代理",
]


  // 返回修改后的配置
  return config;
}
