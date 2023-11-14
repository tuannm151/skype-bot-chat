import { Request, Response } from "restify";
import { Activity, ConversationReference } from "botbuilder";
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
        const { text, conversationId, mentions } = messageBody as SendMessageBody;

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            }
        });
       
        if (!conversation?.reference || typeof conversation.reference !== 'object') {
            res.send(404);
            return;
        }

        const data = {
            text,
            type: 'message'
        } as Partial<Activity>;

        if(mentions?.length) {
            data.entities = mentions.map(mention => ({
                mentioned: {
                    id: mention.id,
                    name: mention.name
                },
                text: `<at id="${mention.id}">${mention.name}</at>`,
                type: 'mention'
            }));
        }
 
        await adapter.continueConversationAsync(MicrosoftAppId, conversation.reference as Partial<ConversationReference>, async (context) => {
            await context.sendActivity(data);
        });
        res.send(200);
    } catch (err) {
        res.send(500);
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