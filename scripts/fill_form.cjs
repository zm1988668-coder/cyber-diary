const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto('https://100t.xiaomimimo.com/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Click "立即申请"
  const btn = await page.$('button.styles_waitlistBtn__b115ff05');
  if (btn) {
    await btn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  // === 01 邮箱 ===
  const emailInput = await page.$('input.styles_emailInput__d1719d4f');
  if (emailInput) {
    await emailInput.click();
    await emailInput.type('sales2@hfautoparts.com', { delay: 20 });
  }

  // === 02 AI工具 (多选) ===
  const toolBtns = await page.$$('button.styles_button__df59090b');
  const toolsToSelect = ['Claude Code', 'Cursor', 'OpenClaw', '其他'];
  for (const tb of toolBtns) {
    const text = await page.evaluate(el => el.textContent, tb);
    if (toolsToSelect.includes(text)) {
      await tb.click();
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // === 03 底层模型 (多选) ===
  for (const tb of toolBtns) {
    const text = await page.evaluate(el => el.textContent, tb);
    if (['DeepSeek 系列', 'MiMo 系列', 'Claude 系列'].includes(text)) {
      await tb.click();
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // === 04 项目描述 ===
  const textarea = await page.$('textarea');
  if (textarea) {
    const description = `我是一名外贸汽配行业的独立开发者，基于 DeepSeek + Claude + MiMo 构建了完整的业务自动化体系，月均 Token 消耗约 21.8 亿（API请求超 21,000 次），月消费 ¥203。

【已上线项目】

1. **KITLAMT B2B 独立站**（Next.js + Tailwind + PostgreSQL + Nginx）
汽配转向机领域的外贸独立站，集成产品数据库、在线订购模块、SSL 证书，部署于香港 VPS。AI 辅助完成从 UI 设计、后端开发到部署运维全流程。

2. **全品类车型数据库**（Python + openpyxl + Wikipedia API）
覆盖 51 个汽车品牌、1814 行车型数据，AI 自动收集 → 清洗 → 双语翻译 → Excel 格式化输出。后续扩展为 SA 方向机目录（从 228MB 源数据中筛选南美品牌，提取 1000+ 产品图片，正则年份提取，品牌色格式化）。

3. **AI 驱动外贸获客系统**（Chrome CDP + Puppeteer MCP）
5 渠道获客体系（社媒/谷歌地图/展会名录/行业协会/海关数据），通过真实浏览器自动化实现客户搜索、背调、WhatsApp 采集全流程，Multi-Agent 并行作业。

4. **赛博日记知识库**（Quartz + GitHub Pages）
每日自动生成的个人技术博客，四维一体格式（工作日报/技术博客/知识库/复盘），GitHub Actions CI/CD 自动部署，Windows Task Scheduler 每日自动化。

5. **股票分析模拟交易系统**（React + Node.js + PostgreSQL）
AI 驱动的短线股票分析与模拟交易 App，Multi-Agent 协作（PM→架构→实现→审核→验收 五步流程）。

【技术特色】
- Multi-Agent 协作体系：每个任务拆分为 PM/架构/实现/审核/测试 五个 Agent，自动编排执行
- 浏览器自动化：Puppeteer MCP + Chrome CDP 真实浏览器驱动，不走 API/爬虫
- 大文件处理：openpyxl 操作 228MB Excel，图片层模型处理 1000+ 产品图片
- SSH 替代方案：公司网络限制 SSH，自建 deploy.php HTTP 代理通道部署 VPS

【用量证明可提供】
- DeepSeek 月度账单截图：21.8 亿 Token / ¥203
- GitHub 仓库活跃提交记录
- 独立站线上地址可直接访问验证`;

    await textarea.click();
    await textarea.type(description, { delay: 5 });
  }

  // === 05 GitHub链接 ===
  const urlInputs = await page.$$('input[type="url"]');
  for (const u of urlInputs) {
    const ph = await page.evaluate(el => el.placeholder, u);
    if (ph.includes('GitHub')) {
      await u.click();
      await u.type('https://github.com/zm1988668-coder/cyber-diary', { delay: 10 });
      break;
    }
  }

  console.log('=== Form filled! ===');
  console.log('Email: sales2@hfautoparts.com');
  console.log('Tools: Claude Code, Cursor, OpenClaw');
  console.log('Models: DeepSeek, MiMo, Claude');
  console.log('Monthly tokens: 21.8亿');
  console.log('Browser stays open for you to review and submit.');
})();
