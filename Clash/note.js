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
    "enhanced-mode": "fake-ip",
    "fake-ip-filter": [
      "*",
      "+.lan",
      "+.local",
      "+.market.xiaomi.com"
    ],
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "proxy-server-nameserver": direct_dns,
    "nameserver": proxy_dns, // 默认的域名解析服务器
    "direct-nameserver": direct_dns,
  };

  // 覆盖 GeoX 配置
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat",
    "geosite": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    "mmdb": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb",
    "asn": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"
  };

  // 覆盖 sniffer 配置
  config["sniffer"] = {
    "enable": true,
    "sniff": {
      "HTTP": { "ports": [80, "8080-8880"], "override-destination": true},
      "TLS":  { "ports": [443, 8443],},
      "QUIC": { "ports": [443, 8443],}
    },
    "skip-domain": [
      "Mijia Cloud",
      "+.push.apple.com"
    ],
  };


  //建立常量
  const common = ["DIRECT","REJECT","🇭🇰 自动选择","🇭🇰 会话保持","🇸🇬 自动选择","🇸🇬 会话保持","🇺🇸 自动选择","🇺🇸 会话保持"];
  const auto   = {"include-all": true, type: "url-test", interval: 300, tolerance: 20};
  const lb     = {"include-all": true, type: "load-balance", strategy: "sticky-sessions"};

  //生成proxy-groups配置。
  config["proxy-groups"] = [
    {name: "✈️ 节点总览", "include-all": true, type: "select"},

    { name: "🔗 默认代理", type: "select", proxies: common }, // 引用外部常量
    { name: "🎶 音乐媒体", type: "select", proxies: common },
    { name: "📲 电报消息", type: "select", proxies: common },
    { name: "📹 油管视频", type: "select", proxies: common },
    { name: "💬 智能助理", type: "select", proxies: common },

    // 自动选择
    { name: "🇭🇰 自动选择", ...auto, filter: "(?i)港|🇭🇰|HongKong|Hong Kong" },
    { name: "🇸🇬 自动选择", ...auto, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore" },
    { name: "🇺🇸 自动选择", ...auto, filter: "(?i)美|🇺🇸|America|United States" },
    // 会话保持（通常隐藏）
    { name: "🇭🇰 会话保持", ...lb, filter: "(?i)港|🇭🇰|HongKong|Hong Kong", hidden: true },
    { name: "🇸🇬 会话保持", ...lb, filter: "(?i)新加坡|坡|狮城|🇸🇬|Singapore", hidden: true },
    { name: "🇺🇸 会话保持", ...lb, filter: "(?i)美|🇺🇸|America|United States", hidden: true },
  ];


  config["rule-providers"] = [
    ["cn",        "https://raw.githubusercontent.com/chuan0712/Utility-Room/main/Clash/cn.yaml", "cn.yaml"]
  ].reduce((acc, [name, url, path]) => (
    acc[name] = {
      type: "http",
      interval: 86400,
      behavior: "classical",
      format: "yaml",
      url,
      path: `./rule/classical/${path}`
    }, acc
  ), {});



  //生成rules配置。
  config["rules"] = [
    // 📦 基础规则
    "RULE-SET,cn,      DIRECT",

    // 🌐 GEO 规则
    "GEOIP,private,DIRECT,no-resolve",
    "GEOSITE,steam@cn,        DIRECT",
    "GEOSITE,googlefcm,       DIRECT",
    "GEOSITE,microsoft@cn,    DIRECT",
    "GEOSITE,category-ads,    REJECT",
    "GEOSITE,category-ai-cn,  DIRECT",
    "GEOSITE,category-ai-!cn, 💬 智能助理",
    "GEOSITE,google,     🔗 默认代理",
    "GEOSITE,youtube,    📹 油管视频",
    "GEOSITE,spotify,    🎶 音乐媒体",
    "GEOSITE,telegram,   📲 电报消息",
    "GEOSITE,private,     DIRECT",
    "GEOSITE,cn,          DIRECT",

    "GEOIP,telegram,    📲 电报消息,no-resolve",
    "GEOIP,CN,          DIRECT,no-resolve",

    // 漏网之鱼
    "MATCH, 🔗 默认代理",
]


  // 返回修改后的配置
  return config;
}
