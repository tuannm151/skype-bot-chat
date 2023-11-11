enum AppProxyPrefix {
    apps = "apps",
    a = "a",
    community = "community",
    tools = "tools",
}

interface ShopifyAppProxy {
    prefix: AppProxyPrefix;
    subPath: string;
    proxyUrl: string;
}

interface ShopifyAppInfo {
    id: string;
    name: string;
    clientId: string;
    clientSecret: string;
    embedded: boolean;
    appUrl: string;
    redirectUrls: string[];
    eventVersion: string;
    customerDataRequestEndpoint: string;
    customerDataErasureEndpoint: string;
    shopDataErasureEndpoint: string;
    appProxy: ShopifyAppProxy;
}

type PartialShopifyAppInfo = Partial<ShopifyAppInfo>;

export {
    ShopifyAppInfo,
    PartialShopifyAppInfo,
    AppProxyPrefix,
};