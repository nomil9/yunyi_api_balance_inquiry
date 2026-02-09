# Yunyi Balance VSCode Extension

一个极简的 VS Code 扩展，只在你执行命令时一次性从 Yunyi API 拉取余额，并在状态栏显示结果。

## 使用步骤
1. 打开设置，确认 `yunyi.baseUrl`（默认 `https://yunyi.cfd/user/api/v1/me`）指向你的 Yunyi API。
2. 在设置中填写 `yunyi.apiToken`，或者第一次运行命令时根据提示输入并保存。
3. 调出命令面板（`Ctrl+Shift+P`），执行 `Yunyi: Check Balance`。完成后状态栏会展示余额，并弹出一条通知。

## 配置项
- `yunyi.baseUrl`：Yunyi API 的 GET 接口地址，默认指向 `https://yunyi.cfd/user/api/v1/me`。
- `yunyi.apiToken`：Bearer token，建议在设置中配置以免每次手动输入。

命令本身不会自动刷新，也不会持续弹窗，仅在你主动运行时才会发起请求。欢迎后续扩展更多功能。
