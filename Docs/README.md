# Yunyi Balance Simple

这个扩展只做一件事：启动后自动拉取一次 Yunyi API 余额，并在状态栏以卡片化的方式展示最新数据——点击状态栏或命令面板里运行 `Yunyi: Check Balance` 都会刷新一次。

## 显示内容
- **状态栏**：展示 `Yunyi: 可用余额 $x， 总额度 $y · 已用 $z`，让你一眼看清余额与消耗。
- **Tooltip**（状态栏 hover）：显示“状态、服务、今日额度、重置时间、当前时间”，格式类似：
  ```text
  状态：已激活
  服务：claude
  今日额度：$200
  重置时间：00:00
  当前时间：10:21:46
  ```
- **命令输出**：当你主动运行 `Yunyi: Check Balance` 时，还会弹出一条通知，概述相同的核心数据。

## 配置
在 VS Code 设置中调整：
- `yunyi.baseUrl`（默认 `https://yunyi.cfd/user/api/v1/me`）：Yunyi API 接口。
- `yunyi.apiToken`：可选，如果空白会在首次拉取时提示你输入并保存到用户设置。

## 交互
1. 打开 VS Code，扩展会在激活时自动执行一次刷新，并在状态栏显示格式化后余额。
2. 需要再次拉取时，运行 Command Palette `Yunyi: Check Balance`，或直接点击状态栏。
3. 如果没有 token，会提示你输入，设置完成后再运行命令即可。
