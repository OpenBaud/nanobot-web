"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.dashboard": "DASHBOARD",
    "nav.terminal": "TERMINAL",
    "nav.config": "CONFIG",
    "nav.channels": "CHANNELS",
    "nav.status": "SYS_ONLINE",
    
    "dashboard.title": "Core Dashboard",
    "dashboard.subtitle": "System Telemetry & Controls",
    "dashboard.monitor": "Process Monitor",
    "dashboard.active": "ACTIVE",
    "dashboard.inactive": "INACTIVE",
    "dashboard.service": "Service Unit",
    "dashboard.port": "Local Port",
    "dashboard.version": "Version Build",
    "dashboard.init": "ENGAGE START",
    "dashboard.initializing": "INITIALIZING...",
    "dashboard.halt": "TERMINATE",
    "dashboard.diag": "Diagnostics Output",
    "dashboard.awaiting": "AWAITING_TELEMETRY...",

    "chat.title": "Terminal Interface",
    "chat.session": "SECURE_SESSION",
    "chat.user": "GUEST_USER",
    "chat.agent": "SYS.AGENT",
    "chat.processing": "PROCESSING_INPUT...",
    "chat.placeholder": "ENTER COMMAND SEQUENCE...",
    "chat.execute": "EXECUTE",

    "config.title": "System Configuration",
    "config.subtitle": "Modify Core Operational Parameters",
    "config.refresh": "REFRESH",
    "config.commit": "COMMIT CHANGES",
    "config.committing": "COMMITTING...",
    "config.ai_core": "A.I. Core Defaults",
    "config.model": "Default Model",
    "config.provider": "Provider Routing",
    "config.temp": "Temperature",
    "config.tokens": "Max Tokens",
    "config.security": "Security Policies",
    "config.restrict": "Restrict Tools to Workspace",
    "config.restrict_desc": "If enabled, the agent is strictly prohibited from reading/writing files or executing commands outside the ~/.nanobot/workspace directory. Highly recommended for edge gateways.",
    "config.vault": "Credential Vault",
    "config.provider_keys": "Provider API Keys & Endpoints",
    "config.api_key": "API Key",
    "config.api_base": "Custom Base URL (Optional)",
    "config.custom": "Custom (OpenAI Compat)",
    "config.add_provider": "+ CONFIGURE PROVIDER",

    "channels.title": "Channel Integrations",
    "channels.subtitle": "Manage Chat Platform Connectivity",
    "channels.global": "Global Channel Settings",
    "channels.send_progress": "Stream Reasoning Progress",
    "channels.send_tool_hints": "Stream Tool Call Hints",
    "channels.enable": "ENABLE",
    "channels.disable": "DISABLE",
    "channels.active": "ONLINE",
    "channels.inactive": "OFFLINE",

    "auth.system_locked": "SYSTEM LOCKED",
    "auth.auth_required": "AUTHORIZATION REQUIRED FOR ACCESS",
    "auth.credentials": "CREDENTIALS",
    "auth.initialize": "INITIALIZE SESSION",
    "auth.authenticating": "AUTHENTICATING...",
    "auth.edge_secure": "EDGE SECURE LAYER",
    "auth.forgot": "FORGOT PASSWORD?",
    "auth.recovery_inst": "Recovery Instructions",
    "auth.recovery_desc": "To reset the system lock, access the host via SSH and remove the authentication config:",
    "auth.return": "RETURN TO LOGIN",

    "security.title": "SECURITY PROTOCOL",
    "security.locked_desc": "SYSTEM IS CURRENTLY LOCKED. AUTHENTICATION REQUIRED FOR ACCESS.",
    "security.unlocked_desc": "SYSTEM IS UNLOCKED. CONFIGURE CREDENTIALS TO SECURE LOCAL ACCESS.",
    "security.active": "ACCESS CONTROL: ACTIVE",
    "security.disabled": "ACCESS CONTROL: DISABLED",
    "security.enforced": "Authentication is currently enforced for all interfaces.",
    "security.recovery_email": "Recovery Email",
    "security.unspecified": "UNSPECIFIED",
    "security.reset_proc": "Reset Procedure",
    "security.new_pass": "NEW PASSWORD",
    "security.confirm_pass": "CONFIRM PASSWORD",
    "security.email_label": "RECOVERY EMAIL",
    "security.email_desc": "STORED LOCALLY FOR RECOVERY REFERENCE.",
    "security.init_sec": "INITIALIZE SECURITY",
    "security.committing": "COMMITTING...",
    "security.success": "SYSTEM SECURED SUCCESSFULLY."
  },
  zh: {
    "nav.dashboard": "仪表盘",
    "nav.terminal": "控制终端",
    "nav.config": "系统配置",
    "nav.channels": "渠道管理",
    "nav.status": "系统在线",

    "dashboard.title": "核心仪表盘",
    "dashboard.subtitle": "系统遥测与进程控制",
    "dashboard.monitor": "进程监控",
    "dashboard.active": "运行中",
    "dashboard.inactive": "已停止",
    "dashboard.service": "服务单元",
    "dashboard.port": "本地端口",
    "dashboard.version": "构架版本",
    "dashboard.init": "启动系统",
    "dashboard.initializing": "初始化中...",
    "dashboard.halt": "终止进程",
    "dashboard.diag": "诊断输出",
    "dashboard.awaiting": "等待遥测数据...",

    "chat.title": "终端接口",
    "chat.session": "安全会话",
    "chat.user": "访客",
    "chat.agent": "系统代理",
    "chat.processing": "处理指令中...",
    "chat.placeholder": "输入指令序列...",
    "chat.execute": "执行",

    "config.title": "系统配置",
    "config.subtitle": "修改核心运行参数",
    "config.refresh": "刷新参数",
    "config.commit": "提交更改",
    "config.committing": "提交中...",
    "config.ai_core": "AI 核心预设",
    "config.model": "默认模型",
    "config.provider": "供应商路由",
    "config.temp": "输出温度",
    "config.tokens": "最大令牌数",
    "config.security": "安全策略",
    "config.restrict": "限制工作区权限",
    "config.restrict_desc": "启用后，代理将被严格禁止读写或执行 ~/.nanobot/workspace 目录之外的任何文件或命令。强烈建议在边缘网关环境中开启。",
    "config.vault": "密钥金库",
    "config.provider_keys": "大模型服务商 API 密钥与代理端点",
    "config.api_key": "API 密钥",
    "config.api_base": "自定义代理地址 (可选)",
    "config.custom": "自定义服务 (OpenAI 兼容)",
    "config.add_provider": "+ 添加服务商配置",

    "channels.title": "渠道管理集成",
    "channels.subtitle": "管理外部聊天平台的连接配置",
    "channels.global": "全局渠道设置",
    "channels.send_progress": "流式传输思考进度",
    "channels.send_tool_hints": "流式传输工具调用提示",
    "channels.enable": "启用渠道",
    "channels.disable": "禁用渠道",
    "channels.active": "已启用",
    "channels.inactive": "未启用",

    "drivers.title": "通信驱动管理",
    "drivers.subtitle": "边缘协议接口",
    "drivers.active": "运行中",
    "drivers.inactive": "已停止",
    "drivers.interface": "绑定接口",
    "drivers.version": "驱动版本",
    "drivers.tx_rx": "发送 / 接收",
    "drivers.start": "启动进程",
    "drivers.stop": "终止进程",
    "drivers.details": "查看详情",
    "drivers.refresh": "刷新状态",

    "auth.system_locked": "系统已锁定",
    "auth.auth_required": "需要授权才能访问",
    "auth.credentials": "系统凭证",
    "auth.initialize": "初始化会话",
    "auth.authenticating": "身份验证中...",
    "auth.edge_secure": "边缘安全层",
    "auth.forgot": "忘记密码?",
    "auth.recovery_inst": "系统恢复指令",
    "auth.recovery_desc": "要重置系统锁，请通过 SSH 访问主机并移除身份验证配置文件:",
    "auth.return": "返回登录",

    "security.title": "安全协议",
    "security.locked_desc": "系统当前已锁定。需要身份验证才能访问。",
    "security.unlocked_desc": "系统未锁定。请配置系统凭证以保护本地访问。",
    "security.active": "访问控制：已激活",
    "security.disabled": "访问控制：未启用",
    "security.enforced": "当前系统已对所有访问接口强制执行身份验证。",
    "security.recovery_email": "恢复邮箱",
    "security.unspecified": "未指定",
    "security.reset_proc": "重置流程",
    "security.new_pass": "新密码",
    "security.confirm_pass": "确认密码",
    "security.email_label": "恢复邮箱",
    "security.email_desc": "在本地存储，仅作恢复参考之用。",
    "security.init_sec": "初始化安全配置",
    "security.committing": "提交中...",
    "security.success": "系统安全配置已成功应用。"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("nanobot_lang") as Language;
    if (savedLang === "en" || savedLang === "zh") {
      setLang(savedLang);
    }
  }, []);

  const toggleLang = () => {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("nanobot_lang", next);
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
