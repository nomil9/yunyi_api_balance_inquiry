# Yunyi Balance Simple

这个扩展用于查询云驿 API 的额度/用量信息，并在状态栏展示已用比例。支持最多 3 个 API Token；点击状态栏或命令面板里运行 `Yunyi: Check Balance` 都会刷新一次。

## 显示内容
- **状态栏**：展示已用比例，例如 `yunyi：3%，1%`；当任一 key 达到阈值会显示警告图标。
- **Tooltip**（状态栏 hover）：按 token 分块显示“服务、可用余额、总额度、已用余额、已用比例、状态、今日额度、重置时间、当前时间”，格式类似：
  ```text
  服务：api-1
  可用余额：100
  总额度：200 · 已用余额：100
  已用比例：50%
  状态：已激活
  今日额度：200
  重置时间：00:00
  当前时间：10:21:46
  ```
- **命令输出**：当你主动运行 `Yunyi: Check Balance` 时，还会弹出一条通知，概述相同的核心数据。

## 配置
在 VS Code 设置中调整：
- `yunyi.baseUrl`（默认 `https://yunyi.cfd/user/api/v1/me`）：云驿 API 接口。
- `yunyi.api-1 / yunyi.api-2 / yunyi.api-3`：最多 3 个 Bearer Token（任意一个即可）。
- `yunyi.apiToken`：兼容旧版单 key；当 api-1/2/3 都未填写时会回退使用该字段。
- `yunyi.autoRefresh`：是否自动刷新。
- `yunyi.refreshIntervalMinutes`：自动刷新间隔（分钟）。
- `yunyi.warningThresholdPercent`：任一 key 已用比例达到该值时显示警告。

## 交互
1. 打开 VS Code，扩展会在激活时自动执行一次刷新，并在状态栏显示已用比例。
2. 需要再次拉取时，运行 Command Palette `Yunyi: Check Balance`，或直接点击状态栏。
3. 如果未配置 token，会在状态栏提示你去设置中填写 token（或在手动刷新时提示输入旧版 `yunyi.apiToken`）。
