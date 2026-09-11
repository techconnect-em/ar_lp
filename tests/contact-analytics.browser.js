// Run via Playwright browser_run_code_unsafe with this file as filename.
// Start: python3 -m http.server 8769 --bind 127.0.0.1 (repository root).
// Loads the real GA tag to catch duplication with enhanced form measurement.
// Collection requests are intercepted; every POST is mocked, never delivered.
async (page) => {
    const results = [];
    for (const path of ['/', '/event-ar/', '/print-ar/']) {
        const context = await page.context().browser().newContext();
        try {
            const tab = await context.newPage();
            const events = [];
            let submissions = 0;
            await context.route('**/*', async route => {
                const request = route.request();
                const url = request.url();
                if (/\/(g\/)?collect(?:\?|$)/.test(url)) {
                    const payload = url + '&' + (request.postData() || '');
                    for (const match of payload.matchAll(/[?&\n]en=([^&\n]*)/g)) {
                        events.push(decodeURIComponent(match[1]));
                    }
                    return route.fulfill({ status: 204, body: '' });
                }
                if (request.method() === 'POST') {
                    if (url === 'http://127.0.0.1:8769/') submissions++;
                    return route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
                }
                return route.continue();
            });
            await tab.goto('http://127.0.0.1:8769' + path, { waitUntil: 'networkidle', timeout: 30000 });
            await tab.locator('#c-name').fill('計測テスト');
            await tab.locator('#c-mail').fill('measurement-test@example.invalid');
            await tab.locator('#contact-form textarea').fill('外部への送信を遮断した自動テスト');
            await tab.locator('#c-agree').check();
            await tab.locator('#c-submit').click();
            await tab.waitForFunction(() => !document.getElementById('contact-success').classList.contains('is-hidden'));
            await tab.waitForTimeout(5000);
            const starts = events.filter(event => event === 'form_start').length;
            const leads = events.filter(event => event === 'generate_lead').length;
            results.push({ path, starts, leads, submissions, pass: starts === 1 && leads === 1 && submissions === 1 });
        } finally {
            await context.close();
        }
    }
    if (results.some(result => !result.pass)) throw new Error(JSON.stringify(results));
    return results;
}
