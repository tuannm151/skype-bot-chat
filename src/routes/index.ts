import { Server } from "restify";
import generalRouter from "./general";
import shopifyRouter from "./shopify";

export default function(server: Server) {
    generalRouter(server);
    shopifyRouter(server);
}
