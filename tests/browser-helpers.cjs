const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');

const root = path.resolve(__dirname, '..');
const storageKey = 'daily-english-lab-state-v1';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

function appFile(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root + path.sep)) return null;
  try { return { body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' }; }
  catch { return null; }
}

async function startApp() {
  let playwright;
  try { playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
  catch { playwright = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright')); }
  const offline = process.env.TEST_OFFLINE_FIXTURE === '1';
  const server = http.createServer((req, res) => {
    const file = appFile(req.url);
    if (!file) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', file.contentType);
    res.end(file.body);
  });
  let browser;
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const url = `http://127.0.0.1:${server.address().port}`;
    let launch = { headless: true };
    if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) launch.executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
    if (process.env.CHROMIUM_MODULE) {
      const imported = require(process.env.CHROMIUM_MODULE);
      const chromium = imported.default || imported;
      launch = { ...launch, executablePath: await chromium.executablePath(), args: chromium.args };
    }
    browser = await playwright.chromium.launch(launch);
    const newContext = async (options) => {
      const context = await browser.newContext(options);
      // Fixture mode exercises the same files and origin-backed storage without live loopback networking.
      if (offline) await context.route(`${url}/**`, (route) => {
        const file = appFile(route.request().url());
        return route.fulfill(file || { status: 404, body: '' });
      });
      await context.route('http://127.0.0.1:8765/**', (route) => route.abort());
      return context;
    };
    return { browser, newContext, url, async close() { await browser.close(); server.close(); } };
  } catch (error) { if (browser) await browser.close(); server.close(); throw error; }
}

async function navigate(page, view) {
  if (['library', 'foundations', 'scenarios', 'market'].includes(view)) await page.locator('[data-nav-group="learn"]').click();
  if (['progress', 'favorites'].includes(view)) await page.locator('[data-nav-group="personal"]').click();
  await page.locator(`[data-view="${view}"]`).click();
}

module.exports = { startApp, navigate, storageKey };
