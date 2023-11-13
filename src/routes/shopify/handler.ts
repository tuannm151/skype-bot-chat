import { Request, Response } from "restify";
import { createNewApp, editAppInfo, setupApiAccess } from "./puperteer";
import puppeteer from "puppeteer-core";
import { PartialShopifyAppInfo } from "~/types/shopify";
import logger from "~/logger";
import { CreateShopifyAppBodySchema, UpdateShopifyAppBodySchema } from "./validation";
const { BROWSER_WS_ENDPOINT } = process.env;

interface RequestShopifyAppBody {
    partnerId: string,
    appInfo: PartialShopifyAppInfo
}
 
const handleCreateShopifyApp = async (req: Request, res: Response) => {
    try {
        const createShopifyApp = CreateShopifyAppBodySchema.parse(req.body);
        const { partnerId, appInfo } = createShopifyApp as RequestShopifyAppBody;
        res.send(200);
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS_ENDPOINT,
        });
    
        const page = await browser.newPage();

        if(!partnerId || !appInfo || !appInfo.name) {
            res.send(400, {
                message: 'Missing required fields (partnerId, appInfo)'
            });
            return;
        }
            
        await createNewApp(page, partnerId, appInfo);
    
        await browser.close();
    } catch (err) {
        logger.error(err);
        res.send(500);
    }
};

const handleUpdateShopifyApp = async (req: Request, res: Response) => {
    try {
        const createShopifyApp = UpdateShopifyAppBodySchema.parse(req.body);
        const { partnerId, appInfo } = createShopifyApp as RequestShopifyAppBody;

        res.send(200);
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS_ENDPOINT,
        });
    
        const page = await browser.newPage();

        const appId = req.params.appId;

        if(!appId || typeof appId !== 'string') {
            res.send(400, {
                message: 'Missing required fields (appId)'
            });
            return;
        }
    
        await editAppInfo(page, partnerId, appId, appInfo);
    
        await browser.close();
    } catch (err) {
        logger.error(err);
        res.send(500);
    }
};

const handleUpdateApiAccess = async (req: Request, res: Response) => {
    try {
        const partnerId = req.body.partnerId;
        const appId = req.params.appId;
        if(!partnerId || !appId || typeof partnerId !== 'string' || typeof appId !== 'string') {
            res.send(400, {
                message: 'Missing required fields (partnerId, appId)'
            });
            return;
        }
        res.send(200);
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS_ENDPOINT,
        });
    
        const page = await browser.newPage();

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