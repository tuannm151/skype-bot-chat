import { Request, Response } from "restify";
import { createNewApp, editAppInfo, setupApiAccess } from "./puperteer";
import puppeteer from "puppeteer-core";
import { PartialShopifyAppInfo } from "~/types/shopify";
import logger from "~/logger";
const { BROWSER_WS_ENDPOINT } = process.env;

const handleCreateShopifyApp = async (req: Request, res: Response) => {
    try {
        res.send(200);
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS_ENDPOINT,
        });
    
        const page = await browser.newPage();

        const partnerId : string = req.body.partnerId;
        const appInfo : PartialShopifyAppInfo = req.body.appInfo;
    
        await createNewApp(page, partnerId, appInfo);
    
        await browser.close();
    } catch (err) {
        logger.error(err);
        res.send(500);
    }
};

const handleUpdateShopifyApp = async (req: Request, res: Response) => {
    try {
        res.send(200);
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS_ENDPOINT,
        });
    
        const page = await browser.newPage();

        const partnerId : string = req.body.partnerId;
        const appId : string = req.params.appId;
        const appInfo : PartialShopifyAppInfo = req.body.appInfo;
    
        await editAppInfo(page, partnerId, appId, appInfo);
    
        await browser.close();
    } catch (err) {
        logger.error(err);
        res.send(500);
    }
};

const handleUpdateApiAccess = async (req: Request, res: Response) => {
    try {
        res.send(200);
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS_ENDPOINT,
        });
    
        const page = await browser.newPage();

        const partnerId : string = req.body.partnerId;
        const appId : string = req.params.appId;
    
        await setupApiAccess(page, partnerId, appId);
    
        await browser.close();
    } catch (err) {
        logger.error(err);
    }
};


export {
    handleCreateShopifyApp,
    handleUpdateShopifyApp,
    handleUpdateApiAccess,
};