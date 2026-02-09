# 云驿 API 查询（VS Code 扩展）

一个极简的 VS Code 扩展：从云驿 API 拉取额度/用量信息，并在状态栏展示已用比例；支持最多 3 个 API Token。

## 使用步骤
1. 打开设置，确认 `yunyi.baseUrl`（默认 `https://yunyi.cfd/user/api/v1/me`）指向你的云驿 API。
2. 在设置中填写 `yunyi.api-1 / yunyi.api-2 / yunyi.api-3`（任意一个即可），或仅填写 `yunyi.apiToken`（兼容旧版单 key）。
3. 调出命令面板（`Ctrl+Shift+P`），执行 `Yunyi: Check Balance` 立即刷新一次。
4. 如果开启自动刷新，扩展会按设定间隔在后台刷新状态栏显示。

## 配置项
- `yunyi.baseUrl`：云驿 API 地址，用于获取用户信息。
- `yunyi.apiToken`：云驿 API Bearer Token（单 key / 兼容旧版）。
- `yunyi.api-1`：api-1 的 Bearer Token（可选）。
- `yunyi.api-2`：api-2 的 Bearer Token（可选）。
- `yunyi.api-3`：api-3 的 Bearer Token（可选）。
- `yunyi.autoRefresh`：在状态栏自动刷新。
- `yunyi.refreshIntervalMinutes`：自动刷新间隔（分钟）。
- `yunyi.warningThresholdPercent`：任一 key 已用比例达到该值时显示警告。

状态栏显示示例：`yunyi：3%，1%`（按已配置 token 的数量展示；任一 key 达到阈值会显示警告图标）。
