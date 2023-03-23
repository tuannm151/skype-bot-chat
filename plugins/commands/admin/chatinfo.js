const config = {
    name: 'chatinfo',
    description: 'Get chat info',
    usage: '',
    cooldown: 3,
    disabled: true
};

const langData = {
    en_US: {
        error: 'Error, try again later.'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...'
    }
};

async function onCall({ context, params, getLang }) {
    try {
        const conversationId = context.activity.conversation.id;
        await context.sendMessage(`Conversation ID: ${conversationId}`);
    } catch (e) {
        console.error(e);
        context.sendMessage(`${getLang('error')} ${e.message}`);
    }
};

export default {
    config,
    langData,
    onCall
};
