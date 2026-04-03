# █ NANOBOT WEB CONSOLE
### // 解耦式边缘智能体工业管理中台

<p align="center">
  <a href="README.md">English</a> | <a href="README_zh.md"><b>简体中文</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/架构-完全解耦-white?style=for-the-badge&labelColor=black" alt="Architecture" />
  <img src="https://img.shields.io/badge/设计-工业美学-white?style=for-the-badge&labelColor=black" alt="Design" />
  <img src="https://img.shields.io/badge/特性-无侵入性-white?style=for-the-badge&labelColor=black" alt="Core" />
</p>

---




https://github.com/user-attachments/assets/e42de1e8-ff1b-4a14-be2b-f5685c81abe0






---

### 00 // 项目概述
**Nanobot Web Console** 是一个独立的、无侵入式的 Web 控制面板，专为 **[nanobot](https://github.com/HKUDS/nanobot)** 智能体引擎及其他基于 CLI 驱动的智能系统设计。它将底层原始的代理能力转化为了可管理的、具备硬件感知的边缘计算设备。

---

### 01 // 架构与解耦说明
> **核心原则：** 零代码入侵 (Zero-Code Intrusion)。

*   **独立运行：** 与核心智能体引擎完全解耦，独立部署。
*   **无侵入性：** 部署本控制台 **无需修改** 引擎的任何原始代码。
*   **指令驱动：** 所有的交互均排他性地通过标准 Shell 指令和配置文件解析 (`.yaml`, `.json`, `.md`) 完成。
*   **开发底座：** 控制台的核心逻辑可作为 **脚手架 (Boilerplate)**，用于快速构建其他边缘 AI 项目的专用 UI。

---

### 02 // 核心功能模块

#### 📡 **动态接口中枢 (网关专用)**
通过 CLI 直接与宿主操作系统 (Ubuntu) 交互的系统级网络管理套件。
*   **ETH0:** 管理静态 IP/DHCP 状态，确保稳定的回程链路。
*   **WLAN0:** 进阶的无线基站管理与 SSID 扫描。
*   **WWAN0:** 深度集成 4G/LTE 调制解调器，提供远程野外连接。

#### 📟 **智能体交互终端**
智能体输入/输出流的可视化封装。
*   实时渲染智能体推理思考的 Markdown 过程。
*   “人机协作”式的命令行交互界面。
*   工具调用（Tool-call）过程可视化。

#### 🛠️ **服务生命周期与诊断**
提供对后台进程的统一管控。
*   通过 CLI 远程启动、停止或重启引擎服务。
*   实时流式输出系统诊断遥测数据。

#### 🔐 **配置保险库**
用于编辑智能体引擎特定配置文件的结构化 UI 界面。
*   安全管理 API 密钥与模型参数。
*   频道 (Channel) 状态与配置同步。

#### 📊 **硬件遥测监测**
系统级驱动程序的实时监控。
*   实时监测 TX/RX 吞吐量指标。
*   驱动程序健康状态监控。

---

### 03 // 设计规范
*   **几何结构：** 锋利的 90 度直角边缘 (零圆角)。
*   **色彩体系：** 高对比单色调 (纯粹黑白)。
*   **排版样式：** 采用 `JetBrains Mono` 字体实现精确的等宽对齐。
*   **网格系统：** 数学般严密一致的响应式网格布局。

---

### 04 // 部署运行环境与依赖

> **[!IMPORTANT]**
> 为了保持零延迟的系统遥测和直接的硬件控制能力，**Nanobot Web Console 必须与 nanobot 引擎部署在同一台物理或虚拟机上。**

**前置条件：**
*   Node.js >= 18.x (用于支持 Next.js App Router)。
*   `nanobot` CLI 工具已安装并存在于系统的 `PATH` 环境变量中。
*   已存在的配置目录 `~/.nanobot/` (需运行过至少一次 `nanobot onboard` 生成)。

---

### 05 // 运行机制 (零侵入层)

Web 控制台并非直接修改核心引擎代码，而是作为本地的一个高权限观察者：
*   **进程监督**：通过原生的操作系统进程指令 (`ps`, `kill`, `start`) 直接调用并跟踪 `nanobot gateway` 守护进程。
*   **智能体交互**：封装 `nanobot agent -m "<message>"` 指令，提供交互式终端体验。
*   **配置注入**：直接在文件系统层面上，对外科手术式地读取并覆写 `~/.nanobot/config.json`。

---

### 06 // 支持的生态系统

因为 Web 控制台直接解析底层的 `config.json`，它原生继承了 nanobot 所有的强大能力：

**🤖 LLM 提供商 (多模型路由)**
全面支持在 20+ 款大模型间进行热切换，包括：
*   **全球模型**：OpenAI, Anthropic (Claude), Google Gemini, Groq, Mistral.
*   **中国大陆**：DeepSeek, 智谱 (Zhipu), 月之暗面 (Moonshot/Kimi), 阿里云百炼 (DashScope), MiniMax, 火山引擎 (Volcengine).
*   **本地与边缘**：Ollama, vLLM, OpenVINO Model Server (OVMS).
*   **开发者向**：GitHub Copilot, OpenAI Codex.

**💬 聊天频道 (网关集成)**
直接在 UI 面板上管理各类长连接平台的运行状态：
*   **社交与即时通讯**：Telegram, Discord, WhatsApp.
*   **企业办公**：钉钉 (DingTalk), 飞书 (Feishu), 企业微信 (WeCom), Slack, 微信 (WeChat).
*   **协议级**：Email (IMAP/SMTP), Mochat.

---

### 07 // 快速部署
```bash
# 1. 克隆代码仓库
git clone https://github.com/OpenBaud/nanobot-web.git
cd nanobot-web/web

# 2. 初始化环境
npm install

# 3. 启动控制台
npm run dev
```

---
**Nanobot Web** 由 **[OpenBaud](https://github.com/OpenBaud)** 开发并维护。致力于让主权边缘智能触手可及。

**LICENSE:** [MIT](LICENSE) | **AUTHOR:** OpenBaud Organization
