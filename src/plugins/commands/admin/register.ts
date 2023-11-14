import { Prisma } from "@prisma/client";
import { TurnContext } from "botbuilder";
import prisma from "~/connector/prisma";
import logger from "~/logger";
import { CommandHandlerArgs, Config, LangData } from "~/types";

const config : Config = {
    name: 'register',
    description: 'register conversation to db',
    usage: '',
    cooldown: 3,
};

const langData : LangData = {
    en_US: {
        error: 'Error, try again later.'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...'
    }
};

async function onCall({ context, getLang } : CommandHandlerArgs) {
    try {
        // check if conversation already registered
        const conversationId = context.activity.conversation.id;

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            }
        });

        if (conversation) {
            await context.sendActivity('Conversation already registered');
            return;
        }

        await prisma.conversation.create({
            data : {
                id: conversationId,
                name: context.activity.conversation.name,
                isGroup: context.activity.conversation.isGroup,
                reference: TurnContext.getConversationReference(context.activity) as Prisma.JsonObject,
                type: context.activity.conversation.conversationType
            }
        });
      
        await context.sendActivity(`Registered new conversation id ${conversationId}`);
    } catch (e) {
        logger.error(e);
        await context.sendActivity(getLang('error'));
    }
}

export default {
    config,
    langData,
    onCall
};