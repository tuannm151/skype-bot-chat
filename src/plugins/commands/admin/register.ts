import { createItem, readItems } from '@directus/sdk';
import { TurnContext } from 'botbuilder';
import { directus } from '~/connector/directus';
import logger from '~/logger';
import { CommandHandlerArgs, Config, LangData } from '~/types';
import { Group } from '~/types/directus';

const config: Config = {
    name: 'register',
    description: 'register conversation to db',
    usage: '[conversation name]',
    cooldown: 3
};

const langData: LangData = {
    en_US: {
        error: 'Error, try again later.'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...'
    }
};

async function onCall({ context, getLang, params }: CommandHandlerArgs) {
    try {
    // check if conversation already registered
        const conversationId = context.activity.conversation.id;
        const name = params?.join(' ');

        if (!name) {
            return await context.sendActivity(
                `Usage: !${config.name} ${config.usage}`
            );
        }

        const groups = await directus.request<Group[]>(readItems('msbot_group', {
            filter: {
                _or: [
                    { skype_id: { _eq: conversationId } },
                    { name: { _eq: name } }
                ]
            },
            fields: ['name', 'skype_id']
        }));

        if (groups.length) {
            const group = groups[0];
            if (group.skype_id === conversationId) {
                return await context.sendActivity(
                    `WARN: Conversation ${conversationId} already registered as [${group.name}]`
                );
            }
            if (group.name === name) {
                return await context.sendActivity(
                    `ERROR: Please choose another name. Conversation [${name}] is already registered. `
                );
            }
        }

        const data = {
            name,
            is_group: context.activity.conversation.isGroup,
            reference: TurnContext.getConversationReference(context.activity),
            skype_id: conversationId
        } as Group;

        const result = await directus.request(createItem('msbot_group', data)); 

        console.log(result);

        await context.sendActivity(
            `Registered new conversation id ${conversationId} as [${name}]`
        );
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
