// https://raw.githubusercontent.com/chuan0712/Utility-Room/main/Clash/Note.js

// 程序入口
function main(config) {

  // 定义直连 DNS 和代理 DNS 的数组
  const direct_dns = ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"];
  const proxy_dns  = ["https://cloudflare-dns.com/dns-query", "https://dns.google/dns-query"];

  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "ipv6": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist", // 黑名单
    "fake-ip-filter": ["*","+.lan","+.local"],
    "respect-rules": true, // 遵循规则
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "proxy-server-nameserver": direct_dns,
    "nameserver-policy": {"+.arpa": ["10.0.0.1"]},
    "nameserver": proxy_dns, // 默认的域名解析服务器
    "direct-nameserver": direct_dns,
    "direct-nameserver-follow-policy": true // 直连 DNS 是否遵循 nameserver-policy
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
  const common = ["🇨🇳 国内直连", "🚫 拒绝连接", "🇭🇰 自动选择","🇭🇰 负载均衡","🇸🇬 自动选择","🇸🇬 负载均衡","🇺🇸 自动选择","🇺🇸 负载均衡"];
  const auto   = {"include-all": true, type: "url-test", interval: 300, tolerance: 20, "max-failed-times": 3};
  const lb     = {"include-all": true, type: "load-balance", strategy: "consistent-hashing"};

  config["proxies"].push(
    { name: "🇨🇳 国内直连", type: "direct", udp: true },
    { name: "🚫 拒绝连接", type: "reject" }
  );



  //生成proxy-groups配置。
  config["proxy-groups"] = [
    {name: "✈️ 节点总览", "include-all": true, type: "select"},

    { name: "🔗 默认代理", type: "select", proxies: common }, // 引用外部常量
    { name: "Bing", type: "select", proxies: common },
    { name: "Google Gemini", type: "select", proxies: common },
    { name: "OpenAI ChatGPT", type: "select", proxies: common },
    { name: "GitHub", type: "select", proxies: common },
    { name: "Microsoft", type: "select", proxies: common },
    { name: "Telegram", type: "select", proxies: common },
    { name: "YouTube", type: "select", proxies: common },
    { name: "Spotify", type: "select", proxies: common },
    { name: "SSH(22端口)", type: "select", proxies: common },



    // 自动选择组
    { name: "🇭🇰 自动选择", ...auto, filter: "(?i)港|🇭🇰|HongKong|Hong Kong" },
    { name: "🇸🇬 自动选择", ...auto, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore" },
    { name: "🇺🇸 自动选择", ...auto, filter: "(?i)美|US|America|United States" },

    // 负载均衡组（通常隐藏）
    { name: "🇭🇰 负载均衡", ...lb, filter: "(?i)港|🇭🇰|HongKong|Hong Kong", hidden: true },
    { name: "🇸🇬 负载均衡", ...lb, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore", hidden: true },
    { name: "🇺🇸 负载均衡", ...lb, filter: "(?i)美|US|America|United States", hidden: true },

    // 直连和拒绝组 (通常隐藏)
    { name: "🇨🇳 国内直连", type: "select", proxies: ["DIRECT"], hidden: true },
    { name: "🚫 拒绝连接", type: "select", proxies: ["REJECT"], hidden: true }
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
      url，
      path: `./ruleset/classical/${path}`
    }， acc
  )， {});



  //生成rules配置。
  config["rules"] = [
    // 📦 基础规则
    "DST-PORT,22,      SSH(22端口)"，         // 所有 ssh 连接默认端口
    "RULE-SET,cn,      DIRECT",
    "RULE-SET,Direct,  DIRECT",
    "RULE-SET,SteamCN, DIRECT",
    "RULE-SET,Bing,    Bing"，
    "RULE-SET,Gemini,  Google Gemini"，


    // 🌐 GEO 规则

    "GEOSITE,github,    GitHub"， // GitHub GEO 规则
    "GEOSITE,microsoft, Microsoft"，
    "GEOSITE,youtube,   YouTube"，
    "GEOSITE,spotify,   Spotify",
    "GEOSITE,telegram,  Telegram",
    "GEOSITE,openai,    OpenAI ChatGPT",
    "GEOSITE,private,   DIRECT",
    "GEOSITE,cn,        DIRECT",

    "GEOIP,telegram,    Telegram,no-resolve",
    "GEOIP,private,     DIRECT,no-resolve",
    "GEOIP,CN,          DIRECT,no-resolve",



    // 漏网之鱼
    "MATCH, 🔗 默认代理",
]


  // 返回修改后的配置
  return config;
}
