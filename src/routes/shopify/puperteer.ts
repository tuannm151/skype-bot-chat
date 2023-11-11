import {  PartialShopifyAppInfo } from "~/types/shopify";
import  { Page } from "puppeteer-core";

const chooseDistribution = async (page: Page, partnerId : string, appId : string) => {
    await page.goto(`https://partners.shopify.com/${partnerId}/apps/${appId}/distribution`);
    const publicInputSelector = "#AppFrameMain input.Polaris-RadioButton__Input[value='public']";
    await page.waitForSelector(publicInputSelector);
    await page.click(publicInputSelector);

    const selectDistributionSelector = "#AppFrameMain .Polaris-Button--primary";
    await page.waitForSelector(selectDistributionSelector);
    await page.click(selectDistributionSelector);

    const publicDistributionSubmitSelector = "div.Polaris-Modal-Dialog__Modal button.Polaris-Button--primary";
    await page.waitForSelector(publicDistributionSubmitSelector);
    await page.click(publicDistributionSubmitSelector);
};

const setupApiAccess = async (page: Page, partnerId: string, appId: string) => {
    await page.goto(`https://partners.shopify.com/${partnerId}/apps/${appId}/customer_data`);

    const protectedDataSelector = "#PROTECTED_CUSTOMER_DATA-reasons-selector-collapsible";
    await page.waitForSelector(protectedDataSelector);
    const protectedDataInput = await page.$$(`${protectedDataSelector} .Polaris-Checkbox__Input`);

    for (let i = 0; i < protectedDataInput.length - 1; i++) {
        await protectedDataInput[i].evaluate(node  => {
            if(!(node instanceof HTMLInputElement) || node.checked) {
                return;
            }
            node.click();
        });
    }

    const saveButtonSelector = "#PROTECTED_CUSTOMER_DATA-reasons-selector-collapsible .Polaris-Button--primary";
    await page.evaluate(async (selector) => {
        const button = document.querySelector(selector);
        if(button instanceof HTMLElement) {
            button.click();
        }
    }, saveButtonSelector);
    
    const menuSelector="#fields-section-collapsible";
    await page.waitForSelector(menuSelector);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const reasonCollapsibleSelectors = [
        "#NAME-reasons-selector-collapsible",
        "#EMAIL-reasons-selector-collapsible",
        "#PHONE-reasons-selector-collapsible",
        "#ADDRESS-reasons-selector-collapsible",
    ];

    for (const selector of reasonCollapsibleSelectors) {
        // scan all checkbox that has class Polaris-Checkbox__Input in selector
        const input = await page.$$(`${selector} .Polaris-Checkbox__Input`);
        for (let i = 0; i < input.length - 1; i++) {
            await input[i].evaluate(node => {
                if(!(node instanceof HTMLInputElement) || node.checked) {
                    return;
                }
                node.click();
            });
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        const saveButtonSelector = `${selector} .Polaris-Button--primary`;
        const saveButton = await page.$(saveButtonSelector);
        await page.evaluate((element) => {
            if(element instanceof HTMLElement) {
                element.click();
            }
        }, saveButton);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await page.goto(`${page.url()}/details`);

    const choiceSelector="#AppFrameMain .Polaris-Choice__Control";
    await page.waitForSelector(choiceSelector);

    // find all Polaris-RadioButton__Input that has value YES
    const choiceInput = await page.$$(`${choiceSelector} .Polaris-RadioButton__Input[value="YES"]`);
    for (let i = 0; i < choiceInput.length; i++) {
        await choiceInput[i].evaluate(node => {
            if(!(node instanceof HTMLInputElement) || node.checked) {
                return;
            }
            node.click();
        });
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    const saveDetailButtonSelector = ".Polaris-PageActions .Polaris-Button--primary";
    await page.waitForSelector(saveDetailButtonSelector);
    const saveDetailButton = await page.$(saveDetailButtonSelector);
    await page.evaluate((element) => {
        if(element instanceof HTMLElement) {
            element.click();
        }
    }
    , saveDetailButton);
};

const changeInputByLabel = async (page: Page, label: string, value: string) => {
    // find label with text using xpath
    const labelSelector = `//label[text()='${label}']`;
    const labelElement = await page.waitForXPath(labelSelector);
    if(!labelElement) {
        throw new Error(`Cannot find label ${labelSelector}`);
    }
    const targetId = await labelElement.evaluate(node => {
        if(!(node instanceof HTMLElement)) {
            return null;
        }
        return node.getAttribute("for");
    });
    if(!targetId) {
        throw new Error(`Cannot find target id of label ${label}`);
    }

    const targetSelector = `#${targetId}`;
    await page.waitForSelector(targetSelector);
    const target = await page.$eval(targetSelector, (el) => {
        if(el instanceof HTMLInputElement|| el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
            return {
                currentVal: el.value,
                tagName: el.tagName.toLowerCase(),
            };
        }
        return null;
       
    });
    if(!target) {
        throw new Error(`Cannot find target ${targetSelector}`);
    }

    if(target.currentVal === value) {
        return;
    }

    if(target.tagName === "input" || target.tagName === "textarea") {
        await page.click(targetSelector);
        await page.keyboard.down("Control");
        await page.keyboard.press("A");
        await page.keyboard.up("Control");
        await page.keyboard.press("Backspace");
        await page.keyboard.type(value);
    }
    if(target.tagName === "select") {
        await page.select(targetSelector, value);
    }
};

const setEmbedded = async (page: Page, partnerId: string, appId: string, embedded: boolean) => {
    await page.goto(`https://partners.shopify.com/${partnerId}/apps/${appId}/edit/embedded_app`);
    const buttonSelector = "#PolarisSettingToggle1";
    await page.waitForSelector(buttonSelector);
    const buttonValue = await page.$eval(buttonSelector, (el) => {
        if(el instanceof HTMLButtonElement) {
            return el.getAttribute("aria-checked");
        }
        return null;
    });
    if(!buttonValue) {
        throw new Error(`Cannot find button toggle embedded ${buttonSelector}`);
    }
    if(buttonValue === embedded.toString()) {
        return;
    }
    await page.click(buttonSelector);
    const confirmSelector = ".Polaris-Modal-Dialog__Modal .Polaris-Button--primary";
    await page.waitForSelector(confirmSelector);
    await page.click(confirmSelector);
    await new Promise(resolve => setTimeout(resolve, 1000));
};

const editAppInfo = async (page: Page, partnerId: string, appId: string, appInfo: PartialShopifyAppInfo) => {
    await page.goto(`https://partners.shopify.com/${partnerId}/apps/${appId}/edit`);
    if(appInfo.name) {
        await changeInputByLabel(page, "App name", appInfo.name);
    }
    if(appInfo.appUrl) {
        await changeInputByLabel(page, "App URL", appInfo.appUrl);
    }

    if(appInfo.redirectUrls) {
        await changeInputByLabel(page, "Allowed redirection URL(s)", appInfo.redirectUrls.join("\n"));
    }

    if(appInfo.eventVersion) {
        await changeInputByLabel(page, "Event version", appInfo.eventVersion);
    }
    if(appInfo.customerDataRequestEndpoint) {
        await changeInputByLabel(page, "Customer data request endpoint", appInfo.customerDataRequestEndpoint);
    }
    if(appInfo.customerDataErasureEndpoint) {
        await changeInputByLabel(page, "Customer data erasure endpoint", appInfo.customerDataErasureEndpoint);
    }
    if(appInfo.shopDataErasureEndpoint) {
        await changeInputByLabel(page, "Shop data erasure endpoint", appInfo.shopDataErasureEndpoint);
    }
    if(appInfo.appProxy) {
        await Promise.all([
            changeInputByLabel(page, "Subpath prefix", appInfo.appProxy.prefix),
            changeInputByLabel(page, "Subpath", appInfo.appProxy.subPath),
            changeInputByLabel(page, "Proxy URL", appInfo.appProxy.proxyUrl),
        ]);
    }
    if(appInfo.embedded) {
        await setEmbedded(page, partnerId, appId, appInfo.embedded);
    }

    try {
        const saveButtonSelector = ".Polaris-Frame__ContextualSaveBar .Polaris-Button--primary";
        await page.waitForSelector(saveButtonSelector);
        await page.click(saveButtonSelector);
    } catch (err) {
        console.log("Cannot find save button");
    }
};

const createNewApp = async (page: Page, partnerId: string, appInfo: PartialShopifyAppInfo) => {
    await page.goto(`https://partners.shopify.com/${partnerId}/apps/new`);
    const createAppSelector = "#AppFrameMain .Polaris-Layout__Section--secondary .Polaris-Button";
    await page.waitForSelector(createAppSelector);
    await page.click(createAppSelector);

    await page.waitForSelector("#AppNameInput");
    if(!appInfo.name) {
        throw new Error("App name is required");
    }
    await page.type("#AppNameInput", appInfo.name);
    const createAppButtonSelector = "#AppFrameMain button.Polaris-Button--primary[type='submit']";
    await page.click(createAppButtonSelector);
    
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    const regex = /\/apps\/(\d+)\//;
    const pageUrl = page.url();
    const appId = pageUrl.match(regex)?.[1];
    if(!appId) {
        throw new Error(`Cannot get app id from url ${pageUrl}`);
    }

    await chooseDistribution(page, partnerId, appId);
    await setupApiAccess(page, partnerId, appId);
    await editAppInfo(page, partnerId, appId, appInfo);
};

export {
    createNewApp,
    setupApiAccess,
    editAppInfo,
};