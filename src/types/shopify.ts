enum ApiVersion {
    "2023-01" = "2023-01",
    "2023-04" = "2023-04",
    "2023-07" = "2023-07",
    "2023-10" = "2023-10",
    "2024-01" = "2024-01",
    "unstable" = "unstable",
}

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
    eventVersion: ApiVersion;
    customerDataRequestEndpoint: string;
    customerDataErasureEndpoint: string;
    shopDataErasureEndpoint: string;
    appProxy: ShopifyAppProxy;
}

type PartialShopifyAppInfo = Partial<ShopifyAppInfo>;

export {
    ShopifyAppInfo,
    PartialShopifyAppInfo,
    ApiVersion,
    AppProxyPrefix,
};