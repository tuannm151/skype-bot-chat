const config = {
    name: 'register',
    description: 'register conversation to db',
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
        await context.register();
        await context.sendMessage('Registered conversation');
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
