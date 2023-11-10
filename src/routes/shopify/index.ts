import { Server } from "restify";
import { handleCreateShopifyApp, handleUpdateApiAccess, handleUpdateShopifyApp } from "./handler";

export default function(server : Server) {
    server.post('/api/shopify/app', handleCreateShopifyApp);
    server.put('/api/shopify/app/:appId', handleUpdateShopifyApp);
    server.put('/api/shopify/app/:appId/api-access', handleUpdateApiAccess);
}