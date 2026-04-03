# 智能体扩展指令系统说明文档编写规范 (SPEC-AGENT-CMD-DOC-006-ZH)
# 状态: 架构设计标准
# 风格: 工业化 / 全大写 / 严谨工程语言

## 01. 核心目标 (OBJECTIVE)
当为边缘网关或 `nanobot` 开发了全新的系统级 CLI 指令（如 `nanobot drivers`、`nanobot diagnostics` 等）后，必须通过编写一份标准的 Markdown 说明文档（如 `README_API.md`），将这些新能力**“教会”**大模型。

由于阅读该文档的是 AI 智能体而非人类，文档的排版、措辞和结构必须遵循特定的心理引导学（Prompt Engineering）规范，以确保模型能够：
1. **精准定位**需要修改的配置文件。
2. **准确组合**复杂的长参数命令。
3. **避免幻觉**（如臆造出不存在的子命令）。

## 02. 文档结构规范 (DOCUMENT STRUCTURE)
一份合格的智能体扩展指令文档，必须严格包含以下四个部分，且顺序不可调换：

### A. 强制前置约束 (MANDATORY PREREQUISITES)
**目的:** 明确在执行任何新命令前，模型必须遵守的边界条件。
**规范:** 必须使用强烈的祈使句（如“必须首先”、“严禁”）。
**示例:**
```markdown
# [系统指令集名称] 操作手册

## 1. 强制约束
* **配置拦截:** 在调用任何 `apply` 或 `start` 命令前，你必须**首先**使用 `edit_file` 工具修改对应的配置文件。
* **文件路径:** 配置文件位于 `[WORKSPACE]/path/to/config.yaml`。
* **修改原则:** 保持原有的 YAML 扁平结构，不要删除或覆盖文件头部的元数据注释。
```

### B. 核心语法参考 (CLI SYNTAX REFERENCE)
**目的:** 枚举所有允许模型使用的子命令及其具体用法。
**规范:** 必须提供**可以直接复制粘贴执行**的具体命令示例，且严禁列出尚在开发中或容易导致崩溃的危险命令。
**示例:**
```markdown
## 2. 核心语法
所有操作均需通过 `run_shell_command` 执行。

### 网络应用 (Network)
* 使得配置生效: `nanobot drivers system apply`
* 诊断网络: `nanobot drivers system ping 8.8.8.8 --interface=wwan0`

### 进程控制 (Process)
* 查询状态: `nanobot drivers protocol list --format=json`
* 启动进程: `nanobot drivers protocol start <ID>` (注意: ID 必须完全匹配配置表中的 ID)
```

### C. 结构化数据解析 (DATA PARSING GUIDE)
**目的:** 如果新命令返回 JSON 或特定格式的输出，必须告诉模型如何解读这些数据。
**规范:** 提供一个微型的预期输出示例。
**示例:**
```markdown
## 3. 输出解析指南
当执行 `list --format=json` 时，返回的 JSON 结构如下：
`[{ "id": "modbus_01", "status": "running", "pid": 1024, "restarts": 0 }]`
* 如果 `status` 不是 `running`，你需要读取崩溃日志进行分析。
```

### D. 故障排查路径 (TROUBLESHOOTING PATH)
**目的:** 当模型执行新命令失败（返回非 0 状态码或抛出 Error）时，给它一个“台阶”下，防止它陷入盲目重试的死循环。
**规范:** 提供排查思路或回滚指令。
**示例:**
```markdown
## 4. 故障排查
* 如果 `apply` 命令返回 `YAML PARSE ERROR`，请重新使用 `read_file` 检查你的缩进。
* 如果进程无法启动，使用 `nanobot drivers protocol logs <ID> --lines=50` 查看报错详情。
```

## 03. 语言与格式要求 (LANGUAGE & FORMATTING)
为确保极高的 Token 解析效率，文档的措辞必须满足以下要求：

1.  **极简主义 (Minimalism):** 移除所有无意义的问候语或背景介绍，直接罗列规则和命令。
2.  **关键词高亮 (Keyword Highlighting):** 对于重要参数、文件路径和工具名称（如 `run_shell_command`, `edit_file`, `system.yaml`），必须使用反引号 `` ` `` 包裹，以提高模型的注意力权重。
3.  **绝对路径优先 (Absolute Paths):** 尽量使用基于工作区的绝对/相对路径引用（如 `[WORKSPACE]/drivers/...`），避免使用模糊的词汇（如“在这个文件夹下”）。

## 04. 部署与曝光 (DEPLOYMENT)
编写完成的 Markdown 说明文档，**必须部署在它所描述的功能配置所在的同一目录下**（例如，关于 `drivers` 的 API 说明，就应该放在 `[WORKSPACE]/drivers/README_API.md`）。

这利用了渐进曝光策略：当智能体被 `SOUL.md` 引导来寻找配置文件时，会“顺便”读取此手册，从而建立起完整的认知闭环。
