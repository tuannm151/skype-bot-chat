import axios from 'axios';

const config = {
    name: 'gpt',
    description: 'AI GPT Chatbot',
    usage: '[message]',
    cooldown: 3
};

const langData = {
    en_US: {
        error: 'Error, try again later.',
        noMessage: 'Please enter a message.'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...',
        noMessage: 'Vui lòng nhập nội dung.'
    }
};

let cache = {};

async function onCall({ context, params, getLang }) {
    try {
        if (!params || !params.length) {
            return context.sendMessage(getLang('noMessage'));
        }
        const input = params.join(' ');
        if (input === 'new') {
            cache = {};
            return context.sendMessage('New conversation started');
        }

        const data = {
            message: input,
            messageId: cache?.messageId,
            conversationId: cache?.conversationId
        };
        const gptEndpoint = process.env?.GPT_ENDPOINT;
        const gptAuthKey = process.env?.GPT_AUTHKEY;
        if (!gptEndpoint || !gptAuthKey) {
            throw new Error('gpt endpoint or auth key not found');
        }
        const result = await axios.post(gptEndpoint + '/conversation', data, {
            headers: {
                Authorization: gptAuthKey
            }
        });
        const responseData = result.data;
        const { messageId, conversationId } = responseData;
        cache = {
            messageId,
            conversationId
        };

        await context.sendMessage(responseData.response);
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
