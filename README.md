# █ NANOBOT WEB CONSOLE
### // INDUSTRIAL MANAGEMENT LAYER FOR EDGE AGENTS

<p align="center">
  <a href="README.md"><b>ENGLISH</b></a> | <a href="README_zh.md">简体中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ARCHITECTURE-DECOUPLED-white?style=for-the-badge&labelColor=black" alt="Decoupled" />
  <img src="https://img.shields.io/badge/UI_STYLE-INDUSTRIAL-white?style=for-the-badge&labelColor=black" alt="Industrial" />
  <img src="https://img.shields.io/badge/CORE-NON--INTRUSIVE-white?style=for-the-badge&labelColor=black" alt="Non-Intrusive" />
</p>

---

**[ Watch: High-Fidelity 1080p Interactive Demo ]**

https://github.com/OpenBaud/nanobot-web/raw/master/public/nanobot-web-hq.mp4

### 00 // OVERVIEW
**Nanobot Web Console** is a standalone, non-intrusive web-based control surface designed for the **[nanobot](https://github.com/HKUDS/nanobot)** agent engine and other CLI-driven intelligent systems. It transforms raw agentic power into a manageable, hardware-aware edge appliance.

---

### 01 // ARCHITECTURE & DECOUPLING
> **Principle:** Zero-Code Intrusion.

*   **Standalone Operation:** Operates independently from the core agent engine.
*   **Zero-Intrusion:** Deploying this console requires **no modifications** to original source code.
*   **CLI-Driven:** Interaction is handled exclusively via standard shell commands and configuration file parsing (`.yaml`, `.json`, `.md`).
*   **Extensible Base:** The core logic serves as a **Boilerplate** for secondary development of specialized UIs for any edge AI project.

---

### 02 // FUNCTIONAL MODULES

#### 📡 **DYNAMIC INTERFACE HUB**
A system-level network management suite interacting directly with the host OS (Ubuntu).
*   **ETH0:** Managed static/DHCP states for stable backhaul.
*   **WLAN0:** Advanced Wi-Fi station management and SSID scanning.
*   **WWAN0:** 4G/LTE modem integration for remote field connectivity.

#### 📟 **AGENT INTERACTIVE TERMINAL**
A visual wrapper for agent input/output streams.
*   Real-time markdown rendering of agent reasoning.
*   "Human-in-the-loop" command interface.
*   Tool-call visualization.

#### 🛠️ **SERVICE LIFECYCLE & DIAGNOSTICS**
Unified control over background processes.
*   Start/Stop/Restart agent services via CLI.
*   Live telemetry stream of system diagnostics.

#### 🔐 **CONFIGURATION VAULT**
Structured UI for editing engine-specific configurations.
*   Secure management of API keys and model parameters.
*   Channel setting synchronization.

#### 📊 **HARDWARE TELEMETRY**
Real-time monitoring of system-level drivers.
*   TX/RX throughput metrics.
*   Driver health status monitoring.

---

### 03 // DESIGN SPECIFICATIONS
*   **Geometry:** Sharp 90-degree edges (Zero-Radius).
*   **Palette:** High-contrast monochromatic (Pure Black & White).
*   **Typography:** Precision-aligned `JetBrains Mono`.
*   **Geometry:** Mathematically consistent responsive grid.

---

### 04 // DEPLOYMENT
```bash
# 1. Clone the repository
git clone https://github.com/OpenBaud/nanobot-web.git
cd nanobot-web

# 2. Initialize environment
npm install

# 3. Start the console
npm run dev
```

---
**Nanobot Web** is maintained by **[OpenBaud](https://github.com/OpenBaud)**. Empowering sovereign edge intelligence.

**LICENSE:** [MIT](LICENSE) | **AUTHOR:** OpenBaud Organization
