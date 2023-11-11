import authenticateMiddleware from "~/middlewares/authentication";
import { handleCreateShopifyApp, handleUpdateApiAccess, handleUpdateShopifyApp } from "./handler";
import { Router } from "~/utils/router";

const router = new Router({
    prefix: "/api/shopify"
});

router.use(authenticateMiddleware);

router.post('/app', handleCreateShopifyApp);
router.put('/app/:appId', handleUpdateShopifyApp);
router.put('/app/:appId/api-access', handleUpdateApiAccess);

export default router;