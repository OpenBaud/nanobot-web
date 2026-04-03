# 智能体驱动管理操作规范 (SPEC-AGENT-DRIVER-INTERACTION-005-ZH)
# 状态: 架构设计标准
# 风格: 工业化 / 全大写 / 严谨工程语言

## 01. 核心目标 (OBJECTIVE)
为了让智能体 (nanobot) 能够安全、独立且正确地管理边缘网关的底层硬件（网络接口）与工业协议进程，必须通过一套**三重组合策略 (Three-Tier Strategy)** 将专用的 `nanobot drivers` CLI 抽象层的使用方法和权限边界“灌输”给智能体。

这套策略确保智能体在任何情况下都不会尝试使用危险的、原生系统级命令（如 `ifconfig`, `ip`, `systemctl`），而是严格通过受控的抽象层 CLI 进行操作。

## 02. 第一重：全局认知注入 (GLOBAL PROMPT INJECTION)
智能体必须在启动的瞬间“先天”知道抽象层 CLI 的存在。这通过覆盖默认的系统提示词实现。

### 实现方式
在工作区 (Workspace) 中创建覆盖模板：`[WORKSPACE]/templates/SOUL.md` 或在 `[WORKSPACE]/templates/USER.md` 的前置设定中加入以下指令：

```markdown
# 硬件与进程控制约定 (HARDWARE & PROCESS CONTROL PROTOCOL)
你正运行在受限的边缘网关环境中（Ubuntu/Debian）。
**严禁**直接使用原生的系统命令（例如 `ifconfig`, `netplan apply`, `systemctl restart` 等）来修改网络或管理工业通信进程，因为你没有直接的 Root 权限，且这些命令的解析极不可靠。

你必须使用专门为你提供的安全抽象层 CLI：`nanobot drivers`。
1. 若要查询当前系统的网络或协议状态，请执行：`nanobot drivers --help`
2. 所有的配置文件修改必须在 `[WORKSPACE]/drivers/` 目录下完成。
```

## 03. 第二重：操作手册前置 (API DOCUMENTATION DEPLOYMENT)
当智能体面对复杂的配置任务时，需要一个详细的参考手册。它不能依靠猜测或“幻觉”来编写配置文件。

### 实现方式
在工作区的驱动目录下放置一个只读的说明文件：`[WORKSPACE]/drivers/README_API.md`。

```markdown
# NANOBOT DRIVERS 抽象层使用手册

## 1. 配置文件修改规则
* 系统网络配置：`drivers/system.yaml`
* 协议进程配置：`drivers/protocol.yaml`
修改这些 YAML 文件时，请使用 `edit_file` 或 `write_file` 工具。**保持缩进扁平化，不要删除顶部元数据。**

## 2. 抽象层 CLI 语法
* **网络应用**: 修改 `system.yaml` 后，必须执行 `run_shell_command("nanobot drivers system apply")` 使其生效。
* **协议控制**: 
  - `nanobot drivers protocol list --format=json` (查询所有进程状态)
  - `nanobot drivers protocol start <ID>` (启动在 protocol.yaml 中定义的特定进程)
  - `nanobot drivers protocol logs <ID> --lines=50` (读取进程崩溃日志)
```

## 04. 第三重：配置文件内嵌引导 (SELF-DOCUMENTING CONFIGS)
这是最后一道防线（Fail-safe）。当智能体使用 `read_file` 工具直接打开某个配置文件准备进行修改时，文件顶部的注释将提供最直接、最上下文相关的操作指令。

### 实现方式
在自动生成的 `[WORKSPACE]/drivers/system.yaml` 和 `protocol.yaml` 顶部，强制包含引导性注释块。

**示例：`system.yaml` 的顶部约束**
```yaml
# ==============================================================================
# NANOBOT SYSTEM DRIVER CONFIGURATION (NETPLAN ABSTRACTION)
# 
# [AGENT INSTRUCTIONS]:
# 1. To modify network interfaces (eth0, wlan0, wwan0), use the `edit_file` tool 
#    to surgically update specific keys (e.g., SSID or ADDRESS).
# 2. DO NOT execute `netplan apply` or `systemctl restart systemd-networkd`.
# 3. After saving this file, you MUST execute: 
#    `run_shell_command("nanobot drivers system apply")`
# ==============================================================================

VERSION: "1.0"
LAST_MODIFIED_BY: "admin"
LAST_MODIFIED_AT: "2024-11-20T10:00:00Z"

INTERFACES:
  # ... (具体配置)
```

## 05. 组合协同效应 (SYNERGY)
这三种方法的组合实现了对大语言模型 (LLM) 行为的完美闭环控制：
1. **系统提示词 (SOUL.md)** 建立了**不可逾越的边界约束**（“不准用原生命令，必须用 `nanobot drivers`”）。
2. **操作手册 (README_API.md)** 提供了**丰富的操作细节**（“如果需要高级语法，请查阅此文档”）。
3. **内嵌注释 (system.yaml)** 提供了**即时的操作反馈**（“当你看到这段配置时，请记得用 `system apply` 生效”）。

## 06. 文件路径与作用域说明 (FILE PATHS & SCOPE)
为了确保智能体能够正确读取上述设定，同时遵守安全沙箱规则（`restrict_to_workspace=True`），各配置与说明文件必须严格放置在以下约定路径中：

### A. 全局认知注入层
*   **路径:** `~/.nanobot/workspace/templates/SOUL.md` (或 `USER.md`)
*   **作用域:** 全局。智能体每次启动会话或被唤醒时，这些文件的内容将被作为最高优先级的系统提示词加载。它定义了智能体的底层行为逻辑和最严格的限制规则。

### B. 操作手册层
*   **路径:** `~/.nanobot/workspace/drivers/README_API.md` (或其他显眼命名的 Markdown)
*   **作用域:** 局部查询。智能体在遇到关于“网络”、“驱动”、“硬件”等需求时，可以自主使用 `read_file` 工具打开此文件查阅详细用法。它充当了系统动态 API 的查阅字典。

### C. 实际配置文件层
*   **路径:** `~/.nanobot/workspace/drivers/system.yaml` (系统网络驱动)
*   **路径:** `~/.nanobot/workspace/drivers/protocol.yaml` (协议进程驱动)
*   **作用域:** 局部配置。这些文件包含了内嵌的 YAML 注释和实际的业务状态。这是智能体执行变更时的最终落脚点。由于它们存放在 `workspace` 沙箱内部，智能体能够安全、自由地修改它们，而不用担心越权破坏系统核心配置。

