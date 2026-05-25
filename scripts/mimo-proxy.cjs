/**
 * MiMo Proxy — 将 Claude Code (Anthropic 格式) 的请求转发到 MiMo API (OpenAI 格式)
 *
 * 用法：
 *   1. node mimo-proxy.js
 *   2. 新开终端: $env:ANTHROPIC_BASE_URL = "http://localhost:3456"
 *   3. 启动 Claude Code，对话就会走 MiMo
 */

const http = require('http');
const https = require('https');

const PORT = 3456;
const MIMO_API = 'token-plan-cn.xiaomimimo.com';
const MIMO_KEY = 'tp-c7sl6ew6qjfbjahtpie9or7im3uskenj67gexki5cc7ejxrz';
const MIMO_MODEL = 'mimo-v2.5-pro';

// Anthropic → OpenAI 消息转换
function convertMessages(anthropicMsg) {
  // Anthropic: {role, content} content可以是string或array
  // OpenAI: {role, content} content只能是string
  const content = Array.isArray(anthropicMsg.content)
    ? anthropicMsg.content.map(c => c.type === 'text' ? c.text : '').join('')
    : anthropicMsg.content || '';
  return { role: anthropicMsg.role, content };
}

// 处理请求
function handleRequest(anthropicBody) {
  const messages = (anthropicBody.messages || []).map(convertMessages);
  // 如果有 system，加在 messages 最前面
  if (anthropicBody.system) {
    messages.unshift({ role: 'system', content: anthropicBody.system });
  }

  const openaiBody = {
    model: MIMO_MODEL,
    messages: messages,
    max_tokens: anthropicBody.max_tokens || 4096,
    stream: anthropicBody.stream || false,
  };

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(openaiBody);
    const req = https.request({
      hostname: MIMO_API,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MIMO_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const oaiResp = JSON.parse(body);
          resolve(convertToAnthropic(oaiResp, anthropicBody));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}, body: ${body.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// OpenAI → Anthropic 响应转换
function convertToAnthropic(oaiResp, originalReq) {
  if (!oaiResp.choices || oaiResp.choices.length === 0) {
    return {
      id: 'mimo-proxy-error',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'MiMo returned empty response' }],
      model: MIMO_MODEL,
      stop_reason: 'error',
      usage: { input_tokens: 0, output_tokens: 0 },
    };
  }

  const choice = oaiResp.choices[0];
  return {
    id: oaiResp.id || 'mimo-proxy',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: choice.message?.content || '' }],
    model: MIMO_MODEL,
    stop_reason: choice.finish_reason === 'stop' ? 'end_turn' : choice.finish_reason || 'end_turn',
    usage: {
      input_tokens: oaiResp.usage?.prompt_tokens || 0,
      output_tokens: oaiResp.usage?.completion_tokens || 0,
    },
  };
}

// HTTP 服务器
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // 只处理 /v1/messages 路径
  if (req.method !== 'POST' || !req.url.includes('/messages')) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
    return;
  }

  req.setEncoding('utf8');
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const anthropicReq = JSON.parse(body);
      const resp = await handleRequest(anthropicReq);

      // 流式响应 — 暂不支持，返回非流式
      if (anthropicReq.stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        const event = `data: ${JSON.stringify({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } })}\n\n`;
        res.write(event);
        const text = resp.content[0]?.text || '';
        res.write(`data: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'message_stop' })}\n\n`);
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(resp));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, type: 'error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`MiMo Proxy running at http://localhost:${PORT}`);
  console.log(`Routing to ${MIMO_MODEL} @ ${MIMO_API}`);
  console.log(`Set: $env:ANTHROPIC_BASE_URL = "http://localhost:${PORT}"`);
});

// 优雅退出
process.on('SIGINT', () => { console.log('\nProxy stopped'); process.exit(0); });
