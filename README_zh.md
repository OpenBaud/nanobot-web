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






### 00 // 项目概述
**Nanobot Web Console** 是一个独立的、无侵入式的 Web 控制面板，适配 **[nanobot](https://github.com/HKUDS/nanobot)** 智能体引擎及各类基于 CLI 驱动的智能系统。它将底层原始的代理能力转化为了可管理的、具备硬件感知的边缘计算设备。

---

### 01 // 架构与解耦说明
> **核心原则：** 零代码入侵 (Zero-Code Intrusion)。

*   **独立运行：** 与核心智能体引擎完全解耦，独立部署。
*   **无侵入性：** 部署本控制台 **无需修改** 引擎的任何原始代码。
*   **指令驱动：** 所有的交互均通过标准的 **CLI 指令** 和 **配置文件解析** (`.yaml`, `.json`, `.md`) 完成。
*   **开发底座：** 控制台的 UI 逻辑可以作为 **脚手架 (Boilerplate)** 进行二次开发，用于快速构建其他边缘 AI 项目的专用 UI。

---

### 02 // 核心功能模块

#### 📡 **动态接口中枢 (网关专用)**
通过 CLI 直接与宿主操作系统 (Ubuntu) 交互的系统级网络管理套件。
*   **ETH0:** 在不触及智能体逻辑的情况下管理静态 IP/DHCP 状态。
*   **WLAN0:** 支持无线基站管理与 SSID 扫描。
*   **WWAN0:** 深度集成 4G/LTE 调制解调器，提供远程野外连接。

#### 📟 **智能体交互终端**
智能体输入/输出流的可视化封装。
*   实时渲染智能体的推理思考过程。
*   支持 Markdown 格式与工具调用可视化。
*   “人机协作”式的命令行交互界面。

#### 🛠️ **服务生命周期与诊断**
提供对后台进程的统一视图与管控。
*   通过 CLI 远程启动、停止或重启引擎服务。
*   实时流式输出系统诊断遥测数据。

#### 🔐 **配置保险库**
用于编辑智能体引擎特定配置文件的专用界面。
*   结构化 UI 管理 API 密钥、模型参数及频道设置。
*   配置文件的安全实时同步。

#### 📊 **硬件遥测监测**
监测系统级驱动程序的吞吐量与健康状态。
*   实时监测 TX/RX 数据流向指标。
*   确保硬件基础设施处于最优 AI 任务承载状态。

---

### 03 // 设计规范
*   **几何形式：** 锋利的 90 度直角结构 (零圆角)。
*   **色彩体系：** 极简单色调 (极致黑白对比)。
*   **字体排版：** 采用 `JetBrains Mono` 字体实现精确的等宽对齐。
*   **布局逻辑：** 数学般严密的响应式网格系统。

---

### 04 // 快速部署
```bash
# 1. 克隆独立控制台
git clone https://github.com/OpenBaud/nanobot-web.git
cd nanobot-web

# 2. 初始化 UI 环境
npm install

# 3. 启动控制台
npm run dev
```

---
**Nanobot Web** 由 **[OpenBaud](https://github.com/OpenBaud)** 开发并维护。让边缘智能更触手可及。

**LICENSE:** [MIT](LICENSE) | **AUTHOR:** OpenBaud Organization
