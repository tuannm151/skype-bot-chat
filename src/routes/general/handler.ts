import { Request, Response } from "restify";
import { ConversationReference, MessageFactory } from "botbuilder";
import { adapter } from "~/connector/adapter";
import { messageBot } from "~/bots";
import prisma from "~/connector/prisma";
import logger from "~/logger";
import { SendMessageBody, SendMessageBodySchema } from "./validation";

const { MicrosoftAppId } = process.env;

const handleSendMessage = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const messageBody = SendMessageBodySchema.parse(body);
        const { text, conversationId } = messageBody as SendMessageBody;

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            }
        });
       
        if (!conversation?.reference || typeof conversation.reference !== 'object') {
            res.send(404);
            return;
        }
    
        await adapter.continueConversationAsync(MicrosoftAppId, conversation.reference as Partial<ConversationReference>, async (context) => {
            await context.sendActivity(MessageFactory.text(text));
        });
        res.send(200);
    } catch (err) {
        logger.error(err);
    }
};

const handleReceiveMessage = async (req: Request, res: Response) => {
    await adapter.process(req, res, (context) => messageBot.run(context));
};

export {
    handleSendMessage,
    handleReceiveMessage
};