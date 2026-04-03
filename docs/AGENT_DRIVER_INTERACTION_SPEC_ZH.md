# 智能体驱动管理操作规范 (SPEC-AGENT-DRIVER-INTERACTION-005-ZH)
# 状态: 架构设计标准
# 风格: 工业化 / 全大写 / 严谨工程语言

## 01. 核心目标 (OBJECTIVE)
为了让智能体 (nanobot) 能够安全、独立且正确地管理边缘网关的底层硬件（网络接口）与工业协议进程，必须通过一套**三重组合策略 (Three-Tier Strategy)** 将专用的 `nanobot drivers` CLI 抽象层的使用方法和权限边界“灌输”给智能体。

这套策略确保智能体在任何情况下都不会尝试使用危险的、原生系统级命令（如 `ifconfig`, `ip`, `systemctl`），而是严格通过受控的抽象层 CLI 进行操作。

## 02. 第一重：全局认知强制注入 (GLOBAL PROMPT INJECTION)
智能体必须在每次会话启动的瞬间“先天”知道抽象层 CLI 的存在。由于核心引擎的限制，这必须通过覆写工作区根目录下系统硬编码加载的 Bootstrap 文件来实现。

### 实现方式
在工作区根目录修改或追加写入 `[WORKSPACE]/SOUL.md` 或 `[WORKSPACE]/USER.md`（引擎每次启动会将其内容直接注入 System Prompt）：

```markdown
# [CRITICAL] 硬件与系统控制约定
你正运行在受限的边缘网关环境中（Ubuntu/Debian）。
**严禁**使用原生的系统命令（例如 `ifconfig`, `ip link`, `netplan apply`, `systemctl restart` 等）来尝试修改网络或管理底层后台进程，因为你没有不受限的 root 权限。

作为替代，系统为你提供了专属的安全控制层 CLI 工具：`nanobot drivers`。
它封装了所有必需的特权操作并提供 JSON 输出。
1. 在尝试解决任何网络、通信或驱动进程问题前，请务必先执行：`run_shell_command("nanobot drivers --help")`
2. 所有的驱动配置文件（YAML）仅允许在 `drivers/` 目录下进行修改。
```

## 03. 第二重：按需发现的 API 手册 (ON-DEMAND API DOCUMENTATION)
当智能体面对复杂的配置任务时，不能依靠猜测或大模型的“幻觉”来编写文件或调用 CLI。我们需要提供一个可被搜索到的标准参考手册。

### 实现方式
在工作区的 `drivers` 子目录下放置一个只读的说明文件：`[WORKSPACE]/drivers/README_API.md`。

> 为什么放在这里？当智能体在第一步执行 `run_shell_command("ls -la drivers/")` 试图寻找要修改的配置文件时，它会**极其自然地**发现并读取这个以 `README` 命名的官方 API 手册。

```markdown
# NANOBOT DRIVERS 抽象层使用手册

## 1. 必须修改的配置文件 (REQUIRED CONFIG FILES)
智能体必须**首先**使用 `read_file` 和 `edit_file` 工具修改以下 YAML 配置文件，然后才能调用对应的 CLI 命令使其生效。
*   **系统网络拓扑 (eth0/wlan0 等):** `[WORKSPACE]/drivers/system.yaml`
*   **协议守护进程 (Modbus/CAN 等):** `[WORKSPACE]/drivers/protocol.yaml`

> **注意:** 保持 YAML 缩进扁平化，不要删除顶部的元数据。

## 2. 抽象层 CLI 核心语法 (CLI COMMANDS)
所有操作均需通过 `run_shell_command` 执行。

### 网络应用 (Network Apply)
*   每次修改 `system.yaml` 后，**必须**执行: `nanobot drivers system apply` 才能使配置下发到宿主机网卡。
*   网络诊断: `nanobot drivers system ping 8.8.8.8 --interface=wwan0`

### 协议控制 (Protocol Control)
*   查询状态: `nanobot drivers protocol list --format=json`
*   启动进程: `nanobot drivers protocol start <ID>` (ID 必须是你在 `protocol.yaml` 中定义的)
*   抓取崩溃日志: `nanobot drivers protocol logs <ID> --lines=50`
```

## 04. 第三重：配置文件零距离防呆 (SELF-DOCUMENTING CONFIGS)
这是最后一道防线。当智能体使用 `read_file` 直接打开某个配置文件（如 `system.yaml`）准备进行修改时，文件顶部的注释将提供最即时、最不可忽视的操作警告。

### 实现方式
在自动生成的 `[WORKSPACE]/drivers/system.yaml` 和 `protocol.yaml` 顶部，强制包含引导性的大写注释块。

**示例：`[WORKSPACE]/drivers/system.yaml` 的顶部约束**
```yaml
# ==============================================================================
# NANOBOT SYSTEM DRIVER CONFIGURATION (NETPLAN ABSTRACTION)
# 
# [WARNING FOR AI AGENT]:
# 1. To modify interfaces (eth0, wlan0, wwan0), use the `edit_file` tool.
# 2. DO NOT execute raw `netplan` or `systemctl` commands in the shell.
# 3. VERY IMPORTANT: After editing and saving this file, you MUST run:
#    `run_shell_command("nanobot drivers system apply")` to take effect.
# ==============================================================================

VERSION: "1.0"
LAST_MODIFIED_BY: "admin"
LAST_MODIFIED_AT: "2024-11-20T10:00:00Z"
```

## 05. 组合协同效应 (SYNERGY & EXPOSURE PATH)
这种设计完美契合了 LLM 解决问题的心理路径（Exposure Path）：
1. **拦截阶段**: `SOUL.md` 在 System Prompt 阶段拦截了模型直接使用 `ifconfig` 的原始冲动，并告知它有一个名为 `nanobot drivers` 的超级工具。
2. **发现阶段**: 模型通过 `run_shell_command` 探索 `drivers/` 目录时，发现了 `README_API.md`，从而学习了如何启动进程或应用网卡配置的正确姿势。
3. **执行阶段**: 模型打开 `system.yaml` 准备修改时，顶部的内嵌注释再次强化记忆（“记得修改后要 run apply 喔！”），彻底杜绝了模型“光改文件、忘了重启服务”的常见幻觉。

## 06. 文件路径与作用域说明 (FILE PATHS & SCOPE)
为了确保智能体能够正确读取上述设定，同时遵守核心引擎的硬编码加载逻辑与沙箱安全边界，文件必须严格部署在以下路径：

### A. 全局认知注入层
*   **绝对路径:** `~/.nanobot/workspace/SOUL.md` (或 `USER.md`)
*   **机制解释:** 核心引擎在启动时，会直接寻找 workspace **根目录**下的这四个硬编码文件。内容会被完整前置到模型的每一次系统对话上下文中。这是最高维度的强制规则。

### B. 按需发现的操作手册层
*   **绝对路径:** `~/.nanobot/workspace/drivers/README_API.md`
*   **机制解释:** 该文件位于驱动专用的子目录下，不占用宝贵的全局上下文 Token，而是作为一种“按需调阅”的局部知识库存在。

### C. 实际配置文件层
*   **绝对路径:** `~/.nanobot/workspace/drivers/system.yaml` 和 `protocol.yaml`
*   **机制解释:** 必须放置在 `workspace` 沙箱内部（受 `restrict_to_workspace=True` 保护）。这使得智能体能安全、合法地读写它们，但无法越权去修改外层的全局 `config.json` 或系统原生的 `/etc/netplan/` 目录。


