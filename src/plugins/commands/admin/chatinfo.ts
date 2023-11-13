import logger from "~/logger";
import { CommandHandlerArgs, Config, LangData } from "~/types";

const config : Config = {
    name: 'chatinfo',
    description: 'Get chat info',
    usage: '',
    cooldown: 3
};

const langData : LangData = {
    en_US: {
        error: 'Error, try again later.'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...'
    },
};

async function onCall({ context, getLang } : CommandHandlerArgs)  {
    try {
        const conversationId = context.activity.conversation.id;
        await context.sendActivity(`Conversation ID: ${conversationId}`);
    } catch (e) {
        logger.error(e);
        await context.sendActivity(`${getLang('error')} ${e.message}`);
    }
}

export default {
    config,
    langData,
    onCall
};
