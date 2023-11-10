import keyv from "~/connector/keyv";
import { CommandHandlerArgs, Config, LangData } from "~/types";

const config : Config = {
    name: 'register',
    description: 'register conversation to db',
    usage: '',
    cooldown: 3,
    disabled: true
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
        const conversationExists = await keyv.has(conversationId);
        if (conversationExists) {
            await context.sendActivity('Conversation already registered');
            return;
        }
        await keyv.set(conversationId, context.activity);
        await context.sendActivity('Registered conversation');
    } catch (e) {
        console.error(e);
        await context.sendActivity(`${getLang('error')} ${e.message}`);
    }
}

export default {
    config,
    langData,
    onCall
};
