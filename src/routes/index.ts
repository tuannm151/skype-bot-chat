import generalRouter from "./general";
import shopifyRouter from "./shopify";
import { combineRouters } from "~/utils/router";

export default combineRouters([
    generalRouter,
    shopifyRouter
]);
