import authenticateMiddleware from "~/middlewares/authentication";
import { handleReceiveMessage, handleSendMessage } from "./handler";
import { Router } from "~/utils/router";

const router = new Router({
    prefix: "/api"
});

router.post('/send', authenticateMiddleware, handleSendMessage);
router.post('/messages', handleReceiveMessage);

export default router;