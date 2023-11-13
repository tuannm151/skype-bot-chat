import { MessageFactory } from 'botbuilder';
import puppeteer from 'puppeteer-core';
import logger from '~/logger';
import { CommandHandlerArgs, Config, LangData } from "~/types";
const { BROWSER_WS_ENDPOINT } = process.env;

const config : Config = {
    name: 'match',
    description: 'See live match data by username',
    usage: '[message]',
    cooldown: 3
};

const langData : LangData = {
    en_US: {
        error: 'Error, try again later.',
        noMessage: 'Please enter a message.',
        noInfo: 'Match history not found',
        invalidParam: 'Invalid Parameter. Please type "[username],[match history number]"'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...',
        noMessage: 'Vui lòng nhập nội dung.',
        noInfo: 'Không tìm thấy lịch sử đấu',
        invalidParam: 'Tham số không hợp lệ. Vui lòng nhập "[tên người dùng],[số lịch sử đấu]"'
    }
};

async function onCall({ context, params, getLang } : CommandHandlerArgs) {
    let browser;
    try {
        if (!params || !params.length) {
            return await context.sendActivity(getLang('noMessage'));
        }
        const input = params.join(' ');
        const [username, number] = input.split(',');
        const matchNumber = Number(number);

        // validate username and match number, match number must be a number
        if (!username || isNaN(matchNumber)) {
            return await context.sendActivity(getLang('invalidParam'));
        }
        browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS_ENDPOINT
        });

        const page = await browser.newPage();

        const nameEncodeURI = encodeURI(username);

        const url = `https://www.op.gg/summoners/vn/${nameEncodeURI}`;

        await page.setViewport({
            width: 1920,
            height: 1080
        });
        await page.goto(url, {
            waitUntil: 'networkidle0'
        });

        await page.waitForSelector('button.detail');
        const detailButtons = await page.$$('button.detail');

        if (!detailButtons.length || detailButtons.length < matchNumber) {
            return await context.sendActivity(getLang('noInfo'));
        }

        // click to match number button
        await detailButtons[matchNumber - 1].click();
        const table = await page.waitForSelector('table[result]');
        if(!table) {
            throw new Error('Table result not found');
        }
        const parentTable = (await table.$x('..'))[0];
        const boundingBox = await parentTable.boundingBox();
        if(!boundingBox) {
            throw new Error('Cannot get bounding box of table element');
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
