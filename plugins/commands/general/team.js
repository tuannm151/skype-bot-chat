const config = {
    name: 'team',
    description: 'Split members to two teams randomly',
    usage: '[message]',
    cooldown: 3,
    disabled: true
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

async function onCall({ context, params, getLang }) {
    try {
        if (!params || !params.length) {
            return context.sendMessage(getLang('noMessage'));
        }
        const input = params.join(' ');
        const names = input.split('|');
        for (let i = names.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [names[i], names[j]] = [names[j], names[i]];
        }

        // Divide the shuffled array into two teams
        const team1 = names.slice(0, Math.ceil(names.length / 2));
        const team2 = names.slice(Math.ceil(names.length / 2));

        // Print the teams each member in a line
        const message = `-------Team 1-------\n${team1.join('\n')}\n-------Team 2-------\n${team2.join('\n')}`;
        await context.sendMessage(message);
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
