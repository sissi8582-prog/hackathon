# Smart Admissions Pathologist

基于 React + Vite 前端和 FastAPI 后端的 AI 应用骨架，支持通过 Anthropic 兼容接口调用 MiniMax M2.7。

## 目录结构

```
hackathon/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── parser.py
│   │   ├── rag_engine.py
│   │   └── cv_generator.py
│   ├── data/
│   │   └── programs.json
│   └── requirements.txt
├── .gitignore
└── README.md
```

## 环境变量

- ANTHROPIC_API_KEY：你的 API Key（不要写入代码库）
- ANTHROPIC_BASE_URL：Anthropic 兼容基地址，例如 `https://api.minimaxi.com/anthropic`
  - 该根地址直接访问可能返回 404，属于正常现象；SDK 会请求其 `/v1/messages` 等路径。

## 后端运行

```bash
python -m venv .venv
source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
python -m pip install -U pip
python -m pip install -r backend/requirements.txt
export ANTHROPIC_API_KEY=你的Key
export ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
uvicorn backend.app.main:app --reload --port 8000
```

健康检查：访问 `http://localhost:8000/health`。

## 前端运行

```bash
cd frontend
npm install
npm run dev
```

开发环境下，前端会把以 `/api` 开头的请求代理到 `http://localhost:8000`（见 `vite.config.js`）。

## 可选：直接测试 MiniMax M2.7（Python）

```python
import os
import anthropic

os.environ["ANTHROPIC_API_KEY"] = "你的Key"
os.environ["ANTHROPIC_BASE_URL"] = "https://api.minimaxi.com/anthropic"

client = anthropic.Anthropic()

resp = client.messages.create(
    model="MiniMax-M2.7",
    max_tokens=200,
    system="You are a helpful assistant.",
    messages=[
        {"role": "user", "content": [{"type": "text", "text": "Hi, how are you?"}]}
    ],
)

texts = [b.text for b in resp.content if getattr(b, "type", None) == "text"]
print("\n".join(texts))
```

## 提示

- 不要把任何密钥写入仓库；`.gitignore` 已忽略常见 `.env` 文件。
- 如果前端调用 `/api/llm/chat` 出现 404，请确认后端已在 8000 端口运行。*** End Patch***}**/
