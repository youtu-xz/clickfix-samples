# ClickFix Adversarial Samples — 79 个对抗样本

## 完整 ClickFix 运行（本地）

```bash
cd clickfix-samples
python server.py
```

然后打开 `http://localhost:8088`，点击任意样本→点击按钮→粘贴查看剪贴板内容。

## GitHub Pages（静态展示）

`https://youtu-xz.github.io/clickfix-samples/`

在线浏览样本页面，但 ClickFix API 需要本地 server.py 配合才能触发。

## 目录结构

```
clickfix-samples/
├── server.py          # 本地 API 服务器（双面响应）
├── index.html         # 导航页
├── openai_dev/        # 79 个样本目录
│   ├── index.html
│   └── api/
├── deepseek_api_leak/
├── ...
└── README.md
```

## 安全声明

所有样本中的 payload 均为 SAFE_TOKEN（`echo CLICKFIX_VERIFY`），不会下载、安装或执行任何实际恶意代码。仅供安全研究使用。
