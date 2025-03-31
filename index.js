import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// 设置全局 fetch
globalThis.fetch = fetch;

// 加载环境变量
dotenv.config();

// 获取当前文件的目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 加载 MCP 配置
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 初始化 Google Generative AI 客户端
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function takeScreenshotAndInvertColors(url) {
  try {
    console.log(`开始处理网站: ${url}`);
    
    // 创建一个 Gemini 会话
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 8192,
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: "puppeteer_navigate",
              description: "导航到指定的 URL",
              parameters: {
                type: "OBJECT",
                properties: {
                  url: {
                    type: "STRING",
                    description: "要导航到的 URL"
                  }
                },
                required: ["url"]
              }
            },
            {
              name: "puppeteer_setViewport",
              description: "设置浏览器视口大小",
              parameters: {
                type: "OBJECT",
                properties: {
                  width: {
                    type: "NUMBER",
                    description: "视口宽度"
                  },
                  height: {
                    type: "NUMBER",
                    description: "视口高度"
                  }
                },
                required: ["width", "height"]
              }
            },
            {
              name: "puppeteer_screenshot",
              description: "截取页面或元素的截图",
              parameters: {
                type: "OBJECT",
                properties: {
                  fullPage: {
                    type: "BOOLEAN",
                    description: "是否截取整个页面"
                  },
                  selector: {
                    type: "STRING",
                    description: "要截图的元素选择器"
                  }
                }
              }
            },
            {
              name: "puppeteer_evaluate",
              description: "在浏览器中执行 JavaScript 代码",
              parameters: {
                type: "OBJECT",
                properties: {
                  script: {
                    type: "STRING",
                    description: "要执行的 JavaScript 代码"
                  }
                },
                required: ["script"]
              }
            },
            {
              name: "puppeteer_waitForNetworkIdle",
              description: "等待网络空闲",
              parameters: {
                type: "OBJECT",
                properties: {
                  timeout: {
                    type: "NUMBER",
                    description: "超时时间（毫秒）"
                  }
                }
              }
            }
          ]
        }
      ]
    });

    // 发送请求，让 Gemini 使用 Puppeteer 工具
    const result = await chat.sendMessage(`请使用 Puppeteer 工具完成以下任务:
    1. 导航到网站: ${url}
    2. 设置浏览器窗口大小为 1280x800
    3. 等待页面加载完成
    4. 截取整个页面的截图，命名为 "original_screenshot"
    5. 使用 JavaScript 在浏览器中执行代码，反转截图的颜色
    6. 将反转颜色后的结果截图，命名为 "inverted_screenshot"
    7. 返回两张截图的链接`);

    console.log('处理完成！');
    console.log('Gemini 的回复:');
    console.log(JSON.stringify(result.response, null, 2));
    
    // 提取截图资源信息
    const parts = result.response.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        const imageName = part.inlineData.name || 'screenshot';
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        const filePath = path.join(__dirname, `${imageName}.png`);
        fs.writeFileSync(filePath, imageData);
        console.log(`截图已保存: ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error('发生错误:', error);
    if (error.response) {
      console.error('API 错误:', error.response);
    }
  }
}

// 使用示例
const websiteUrl = 'https://aliexpress.com';
takeScreenshotAndInvertColors(websiteUrl); 