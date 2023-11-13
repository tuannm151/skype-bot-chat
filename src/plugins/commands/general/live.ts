import { MessageFactory } from 'botbuilder';
import puppeteer from 'puppeteer-core';
import logger from '~/logger';
import { CommandHandlerArgs, Config, LangData } from "~/types";

const config : Config = {
    name: 'live',
    description: 'See live match data by username',
    usage: '[message]',
    cooldown: 3
};

const langData : LangData = {
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

async function onCall({ context, params, getLang } : CommandHandlerArgs) {
    let browser;
    try {
        if (!params || !params.length) {
            return await context.sendActivity(getLang('noMessage'));
        }
        const input = params.join(' ');

        const connectionString = process.env.BROWSER_WS_ENDPOINT;

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
            return await context.sendActivity(getLang('noInfo'));
        }

        const boundingBox = await contentContainer.boundingBox();

        if (!boundingBox) {
            return await context.sendActivity(getLang('noInfo'));
        }

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
        logger.error(e);
        await context.sendActivity(`${getLang('error')} ${e.message}`);
    } finally {
        browser && await browser.close();
    }
}

export default {
    config,
    langData,
    onCall
};
