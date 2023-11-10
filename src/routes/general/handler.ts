import { Request, Response } from "restify";
import keyv from "~/connector/keyv";
import { MessageFactory } from "botbuilder";
import { adapter } from "~/connector/adapter";
import { messageBot } from "~/bots";

const { MicrosoftAppId } = process.env;

const handleSendMessage = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const { text, conversationId } = body;
        const conversationReference = await keyv.get(conversationId);
        if (!conversationReference) {
            res.send(404);
            return;
        }
    
        await adapter.continueConversationAsync(MicrosoftAppId, conversationReference, async (context) => {
            await context.sendActivity(MessageFactory.text(text));
        });
        res.send(200);
    } catch (err) {
        if(err instanceof Error) {
            console.error(err.message);
        }
    }
};

const handleReceiveMessage = async (req: Request, res: Response) => {
    await adapter.process(req, res, (context) => messageBot.run(context));
};

export {
    handleSendMessage,
    handleReceiveMessage
};