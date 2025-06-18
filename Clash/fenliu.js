/**
 * 生成DNS配置。
 * @returns {Object} - DNS配置对象。
 */
function generateDNSConfig() {
  return {
    enable: true,
    listen: ":1053",
    ipv6: true,
    // 统一使用 kebab-case 命名
    "respect-rules": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist", // 使用黑名单模式
    "fake-ip-filter": ["*", "+.lan", "+.local", "+.internal", "+.private", "time.*.com", "ntp.*.com", "localhost.ptlogin2.qq.com"], // 黑名单过滤器
    "nameserver-strategy": "prefer-dns",
    // 默认DNS服务器，通常用于直连流量的域名解析
    "default-nameserver": ["https://223.5.5.5/dns-query", "https://1.12.12.12/dns-query"],
    // 主要DNS服务器，通常用于需要代理的流量的域名解析
    "nameserver": ["https://dns.cloudflare.com/dns-query", "https://dns.google.com/dns-query"],
    // 代理服务器的DNS，用于通过代理节点进行域名解析
    "proxy-server-nameserver": ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
    // 直连DNS服务器，使用系统默认的DNS设置进行解析
    "direct-nameserver": ["223.5.5.5", "1.12.12.12"]
  };
}

/**
 * 生成Sniffer配置。
 * @returns {Object} - Sniffer配置对象。
 */
function generateSnifferConfig() {
  return {
    enable: true,
    'force-dns-mapping': true,
    'parse-pure-ip': false,
    'override-destination': true,
    sniff: {
      TLS:  { ports: [443, 8443], },
      HTTP: { ports: [80, '8080-8880'], },
      QUIC: { ports: [443, 8443], },
    },
    'skip-src-address': [
      '127.0.0.0/8',
      '192.168.0.0/16',
      '10.0.0.0/8',
      '172.16.0.0/12',
    ],
    'force-domain': [
      '+.google.com',
      '+.googleapis.com',
      '+.googleusercontent.com',
      '+.youtube.com',
      '+.facebook.com',
      '+.messenger.com',
      '+.fbcdn.net',
      'fbcdn-a.akamaihd.net',
    ],
    'skip-domain': ['Mijia Cloud', '+.oray.com'],
  };
}



// 定义常用的代理选项，用于select类型的代理组
const commonProxies = ["🌏 全球直连", "🚫 拒绝连接", "🇭🇰 自动选择", "🇭🇰 负载均衡", "🇸🇬 自动选择", "🇸🇬 负载均衡", "🇺🇸 自动选择", "🇺🇸 负载均衡"];

// 定义通用的排除过滤器，用于url-test和load-balance类型的代理组
 const commonExcludeFilter = "(?i)0\\.1倍|0\\.01倍";

/**
 * 创建一个select类型的代理组。
 * @param {string} name - 代理组的名称。
 * @param {Array<string>} proxies - 代理组包含的代理或子组列表。
 * @param {boolean} [hidden=false] - 是否隐藏该代理组。
 * @returns {Object} - select类型的代理组配置对象。
 */
function createSelectGroup(name, proxies, hidden = false) {
  return {
    name: name,
    type: "select",
    proxies: proxies,
    hidden: hidden // 添加hidden属性
  };
}

/**
 * 创建一个url-test或load-balance类型的代理组。
 * @param {string} name - 代理组的名称。
 * @param {string} type - 代理组的类型 ('url-test' 或 'load-balance')。
 * @param {string} filter - 用于过滤代理名称的正则表达式。
 * @param {boolean} [hidden=false] - 是否隐藏该代理组。
 * @returns {Object} - url-test或load-balance类型的代理组配置对象。
 */
function createSmartGroup(name, type, filter, hidden = false) {
  const baseGroup = {
    name: name,
    "include-all": true,
    type: type,
    //"exclude-filter": commonExcludeFilter, // 引用外部常量
    filter: filter
  };

  if (type === "url-test") {
    baseGroup.interval = 300;
    baseGroup.tolerance = 20;
  } else if (type === "load-balance") {
    baseGroup.strategy = "consistent-hashing";
    baseGroup.hidden = hidden;
  }
  return baseGroup;
}

/**
 * 创建一个rule-provider配置。
 * @param {string} name - 规则提供者的名称。
 * @param {string} url - 规则文件的URL。
 * @param {string} path - 规则文件在本地的路径。
 * @returns {Object} - rule-provider配置对象。
 */
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

/**
 * 生成proxy-groups配置。
 * @returns {Array<Object>} - proxy-groups数组。
 */
function generateProxyGroups() {
  return [
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
    createSelectGroup("🚫 拒绝连接", ["REJECT"], true)
  ];
}

/**
 * 生成rule-providers配置。
 * @returns {Object} - rule-providers对象。
 */
function generateRuleProviders() {
  return {
    China: createRuleProvider("China", "https://cdn.jsdelivr.net/gh/chuan0712/Utility-Room@main/Clash/cn.yaml", "China.yaml"),
    YouTube: createRuleProvider("YouTube", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/YouTube/YouTube.yaml", "YouTube.yaml"),
    Spotify: createRuleProvider("Spotify", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.yaml", "Spotify.yaml"),
    Openai: createRuleProvider("Openai", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml", "OpenAI.yaml"),
    Gemini: createRuleProvider("Gemini", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Gemini/Gemini.yaml", "Gemini.yaml"),
    Telegram: createRuleProvider("Telegram", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram.yaml", "Telegram.yaml"),
    SteamCN: createRuleProvider("SteamCN", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/SteamCN/SteamCN.yaml", "SteamCN.yaml"),
    GoogleFCM: createRuleProvider("GoogleFCM", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/GoogleFCM/GoogleFCM.yaml", "GoogleFCM.yaml"),
    Bing: createRuleProvider("Bing", "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Bing/Bing.yaml", "Bing.yaml")
  };
}

/**
 * 生成rules配置。
 * @returns {Array<string>} - rules数组。
 */
function generateRules() {
  return [
    // 📦 基础规则
    "RULE-SET,China, 🌏 全球直连",
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
  ];
}
/**
 * main函数用于生成Clash配置。
 * 它接收一个config对象，并向其中添加或修改DNS、Sniffer、proxy-groups、rule-providers和rules配置。
 * @param {Object} config - 初始的Clash配置对象。
 * @returns {Object} - 包含更新后的Clash配置的对象。
 */
function main(config) {
  // 在main函数中调用这些独立的模块化函数，并将DNS和Sniffer放在前面
  config["dns"] = generateDNSConfig(); // 新增DNS配置
  config["sniffer"] = generateSnifferConfig(); // 新增Sniffer配置
  config["proxy-groups"] = generateProxyGroups();
  config["rule-providers"] = generateRuleProviders();
  config["rules"] = generateRules();

  return config;
}
