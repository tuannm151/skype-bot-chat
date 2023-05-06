import puppeteer from 'puppeteer-core';

const proxy = {};

const webAutomate = async (url) => {
    try {
        const options = [];

        let connectionString = process.env.BROWSER_WS_ENDPOINT;

        if (proxy && proxy.host && proxy.port) {
            options.push(`--proxy-server=${proxy.host}:${proxy.port}`);
        }

        connectionString = `${connectionString}?${options.join('&')}`;

        const browser = await puppeteer.connect({
            browserWSEndpoint: connectionString
        });

        const page = await browser.newPage();

        if (proxy && proxy.username && proxy.password) {
            await page.authenticate({
                username: proxy.username,
                password: proxy.password
            });
        };

        await page.goto(url);

        await page.type('#idcompany', 'mycompany');
        await page.type('#exampleInputidstaff1', 'myusername');
        await page.type('input[name=password]', 'mypassword');

        // Click the login button
        await page.click('#btnLogin');

        // Wait for the page to load after login
        await page.waitForNavigation();

        // check if the login was successful
        const isLoggedIn = await page.evaluate(() => {
            return localStorage.getItem('refresh_token') !== null;
        });
        console.log('isLoggedIn', isLoggedIn);
    } catch(e) {
        console.log(e);
    } finally {
        await browser.close();
    }
};

export default webAutomate;
