import { MessageFactory } from 'botbuilder';
import puppeteer from 'puppeteer-core';

const config = {
    name: 'live',
    description: 'See live match data by username',
    usage: '[message]',
    cooldown: 3
};

const langData = {
    en_US: {
        error: 'Error, try again later.',
        noMessage: 'Please enter a message.',
        noInfo: 'Not in a match or user not found'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...',
        noMessage: 'Vui lòng nhập nội dung.',
        noInfo: 'Người dùng không đang trong trận hoặc không tìm thấy'
    }
};

const proxy = {};

async function onCall({ context, params, getLang }) {
    let browser;
    try {
        if (!params || !params.length) {
            return context.sendMessage(getLang('noMessage'));
        }
        const input = params.join(' ');

        const options = [];

        let connectionString = process.env.BROWSER_WS_ENDPOINT;

        if (proxy && proxy.host && proxy.port) {
            options.push(`--proxy-server=${proxy.host}:${proxy.port}`);
        }

        connectionString = `${connectionString}?${options.join('&')}`;

        browser = await puppeteer.connect({
            browserWSEndpoint: connectionString
        });

        const page = await browser.newPage();

        const nameEncodeURI = encodeURI(input);

        const url = `https://www.op.gg/summoners/vn/${nameEncodeURI}/ingame`;

        await page.goto(url, {
            waitUntil: 'networkidle0'
        });

        // find id content-container
        const contentContainer = await page.$('#content-container');
        if (!contentContainer) {
            return context.sendMessage(getLang('noInfo'));
        };

        const boundingBox = await contentContainer.boundingBox();

        const base64String = await page.screenshot({
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height
            },
            encoding: 'base64'
        });

        const message = MessageFactory.attachment({
            contentType: 'image/png',
            contentUrl: `data:image/png;base64,${base64String}`
        });

        await context.sendActivity(message);
    } catch (e) {
        console.error(e);
        context.sendMessage(`${getLang('error')} ${e.message}`);
    } finally {
        browser && await browser.close();
    }
};

export default {
    config,
    langData,
    onCall
};
