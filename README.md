## 调试mcp
`npx @modelcontextprotocol/inspector node mcp_server.js`  

## 网站截图与颜色反转工具

这个项目使用 Model Context Protocol (MCP) 和 Puppeteer 服务器来截取网站截图并反转颜色。

## 前提条件

- Node.js (v14+)
- Docker
- Google API 密钥

## 安装

1. 克隆此仓库
2. 安装依赖：`npm install`
3. 在 `.env` 文件中设置你的 Google API 密钥
4. 构建 Puppeteer Docker 镜像：
   ```
   docker build -t mcp/puppeteer -f src/puppeteer/Dockerfile .
   ```

## 使用方法

1. 在 `index.js` 中修改 `websiteUrl` 变量为你想要截图的网站
2. 运行程序：`npm start`
3. 查看生成的截图文件

## 工作原理

1. 程序使用 Google Gemini API 创建一个会话
2. Gemini 通过 MCP 协议调用 Puppeteer 服务器
3. Puppeteer 在 Docker 容器中运行，打开网站并截图
4. 使用 JavaScript 在浏览器中反转截图颜色
5. 保存原始和反转颜色后的截图 