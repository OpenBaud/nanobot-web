# 驱动抽象层设计规范 (SPEC-DRIVER-ABSTRACTION-003-ZH)
# 状态: 架构设计标准
# 风格: 工业化 / 全大写 / 严谨工程语言

## 01. 引入抽象层的动机 (MOTIVATION)
边缘网关部署在高度异构的工业现场环境中（如 Ubuntu, Debian 等），底层网络与硬件子系统（systemd-networkd, NetworkManager, 原生 iproute）差异巨大。
如果直接将原生的系统命令（例如 `ip link`, `netplan`, `systemctl`）暴露给智能体（nanobot）使用，将带来严重的系统风险与不稳定性：
1. **解析脆弱性 (FRAGILE PARSING):** 跨操作系统版本解析原生的 `ifconfig` 或 `journalctl` 纯文本输出是极不可靠的，会导致智能体产生“幻觉”。
2. **权限越界 (PRIVILEGE ESCALATION):** 智能体需要广泛的 `sudo` (root) 权限才能执行这些命令，一旦指令出错或遭到注入，将引发灾难性后果。
3. **命令式 vs 声明式 (IMPERATIVE VS DECLARATIVE):** 智能体更擅长声明式思维（“将网卡 eth0 设置为静态 IP 192.168.1.100”）。而原生系统命令往往需要多步、复杂的执行序列。

因此，**抽象层充当了智能体与宿主机操作系统之间的一个安全、标准化、幂等的 API 桥梁。**

## 02. 架构设计 (ARCHITECTURAL DESIGN)
抽象层应当被设计为一个独立的、编译型或带严格类型检查的 CLI 工具（例如独立编译的 `nanobot-cli` 或内置子命令 `nanobot drivers`）。

### A. 契约层（智能体视角）
智能体**仅被允许**与抽象层 CLI 进行交互。
*   **输入:** 结构化的 CLI 命令，以及存放在受控工作区内的配置文件（如 `~/.nanobot/workspace/drivers/system.yaml`）。
*   **输出:** 严格强制返回 JSON 格式（便于程序解析）或等宽表格（便于查阅）。**绝对禁止**返回底层操作系统的原生标准输出 (stdout)。
*   **执行:** 原子性。如果配置失败（例如提供的 IP 地址格式错误），抽象层必须负责自动回滚，智能体只需接收“成功”或“失败”的明确结果。

### B. 实现层（操作系统视角）
抽象层的“编译器”负责将高阶配置转化为对应操作系统的实际动作。
1.  **系统驱动 (网络环境):**
    *   读取工作区内的 `system.yaml`。
    *   将其编译为目标系统所需的文件（如 Ubuntu 下的 `netplan` 配置 `.yaml`，或树莓派下的 `wpa_supplicant.conf`）。
    *   通过极其受限的 `sudoers.d` 例外规则，执行 `sudo netplan apply` 等特权指令。
2.  **协议驱动 (C 语言工业二进制程序):**
    *   读取工作区内的 `protocol.yaml`。
    *   为 `systemd` 生成或更新对应的 `.service` 单元文件。
    *   执行受限的 `sudo systemctl daemon-reload` 和 `restart` 命令。

## 03. 安全与权限边界 (SECURITY & PRIVILEGE BOUNDARIES)
抽象层是系统中**唯一**允许进行权限提升的组件。
1.  智能体主进程必须以 `nanobot-user`（非 root 用户）的低权限身份运行。
2.  通过配置 `/etc/sudoers.d/nanobot`，仅允许该低权限用户无密码执行特定的抽象层命令。
    示例: `nanobot-user ALL=(root) NOPASSWD: /usr/local/bin/nanobot drivers apply *`
3.  抽象层必须对所有输入参数和配置文件进行严格的正则或词法校验。彻底防范命令注入攻击（例如，拒绝包含 `; rm -rf /` 的恶意 SSID 名称）。

## 04. 智能体标准化 CLI 接口 (STANDARDIZED CLI INTERFACE)

### 系统驱动 (SYSTEM DRIVERS - 网络与硬件)
*   **查询状态:** `nanobot drivers system get <eth0|wlan0|wwan0> --format=json`
    *   *智能体接收:* `{ "status": "UP", "ip": "192.168.1.100", "gateway": "192.168.1.1" }`
*   **应用配置:** `nanobot drivers system apply --config=~/.nanobot/workspace/drivers/system.yaml`
    *   *底层动作:* 将 YAML 转换为系统原生配置并应用。
*   **网络诊断:** `nanobot drivers system ping 8.8.8.8 --interface=wwan0`
    *   *底层动作:* 封装 `ping -I wwan0`，用于检查特定接口的连通性。

### 协议驱动 (PROTOCOL DRIVERS - C 二进制服务)
*   **查询状态:** `nanobot drivers protocol list --format=json`
    *   *智能体接收:* `[{ "id": "modbus_01", "status": "running", "pid": 1024, "restarts": 0 }]`
*   **生命周期管理:** `nanobot drivers protocol <start|stop|restart> <driver_id>`
    *   *底层动作:* 映射并封装 `systemctl <action> nanobot-protocol-<driver_id>.service`。
*   **查看日志:** `nanobot drivers protocol logs <driver_id> --lines=50`
    *   *底层动作:* 映射并封装 `journalctl -u nanobot-protocol-<driver_id>.service`，并清理输出格式。

## 05. 故障模式与灾难恢复 (FAILURE MODES & RECOVERY)
抽象层必须实现工业级的失效安全（Fail-safe）机制：
1.  **网络配置回滚:** 如果智能体（AI 代理）错误地修改了网络配置导致设备断网，抽象层必须具备内置的超时回滚机制（例如在应用配置 60 秒后如果无法连接外部网络，则自动还原为上一个正常的 `system.yaml` 配置），防止设备永久失联（变砖）。
2.  **协议进程守护:** 抽象层不应自己实现复杂的进程守护循环，而应将协议进程注册为 `systemd` 服务，利用其原生的 `Restart=on-failure` 机制进行自动恢复。抽象层只需向智能体报告崩溃和重启次数。

## 06. 知识与权限“灌输”策略 (PROMPT & PERMISSION INJECTION)
为了确保智能体能够主动且正确地使用这套抽象层，必须在配置层面进行知识约束：
1. **全局提示词覆盖**: 修改 `~/.nanobot/workspace/templates/SOUL.md`，显式告知智能体它运行在受限环境中，禁止使用原生命令，并指导其使用 `nanobot drivers --help` 查阅抽象层用法。
2. **配置文件隔离**: 所有需要智能体读取或修改的驱动配置文件（如 `system.yaml`, `protocol.yaml`）**必须**存放在 `~/.nanobot/workspace/drivers/` 目录下。这是因为在边缘安全模式（`restrict_to_workspace=True`）下，智能体只能访问工作区以内的文件。
