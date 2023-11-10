import { Server } from "restify";
import { handleReceiveMessage, handleSendMessage } from "./handler";

export default function(server : Server) {
    server.post('/api/send', handleSendMessage);
    server.post('/api/messages', handleReceiveMessage);
}