import { deleteItems } from '@directus/sdk';
import { ActivityHandler, MessageFactory } from 'botbuilder';
import { directus } from '~/connector/directus';
import pluginHandler from '~/core/handler.js';
import logger from '~/logger';
import { Group } from '~/types/directus';

class MessageBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            await pluginHandler.handleMessage(context);
            await next();
        });

        this.onConversationUpdate(async (context, next) => {
            const event = context.activity?.membersAdded?.length
                ? 'membersAdded'
                : context.activity?.membersRemoved?.length
                    ? 'membersRemoved'
                    : null;
            if (event) {
                const membersUpdated =
          event === 'membersAdded'
              ? context.activity.membersAdded
              : context.activity.membersRemoved;
                const isBotAffected = membersUpdated?.find(
                    (member) => member.id === context.activity.recipient.id
                );

                switch (event) {
                case 'membersAdded': {
                    if (isBotAffected) {
                        const helloText = `Hello everyone 👋👋 \n${process.env.BOT_NAME} is at your service! 👮👮`;
                        await context.sendActivity(
                            MessageFactory.text(helloText, helloText)
                        );
                        return logger.info(
                            `Bot added to conversation ${context.activity.conversation.id}`
                        );
                    }
                    const welcomeText = `Xin chào 👋👋`;
                    await context.sendActivity(
                        MessageFactory.text(welcomeText, welcomeText)
                    );
                    break;
                }
                case 'membersRemoved': {
                    if (isBotAffected) {
                        const result = await directus.request<Group[]>(
                            deleteItems('msbot_group', {
                                filter: {
                                    skype_id: { _eq: context.activity.conversation.id }
                                },
                                fields: ['name']
                            })
                        );
                        console.log(result);
                        return logger.info(
                            `Bot removed from conversation ${result?.[0]?.name || context.activity.conversation.id}`
                        );
                    }
                    const goodbyeText = `Tạm biệt 👋👋`;
                    await context.sendActivity(
                        MessageFactory.text(goodbyeText, goodbyeText)
                    );
                    break;
                }
                }
            }
            await next();
        });

        this.onMessageReaction(async (context, next) => {
            const { activity } = context;
            const { from, recipient, replyToId } = activity;
            const { name: fromName } = from;
            const { name: recipientName } = recipient;
            await context.sendActivity(
                MessageFactory.text(
                    `, from: ${fromName}, recipient: ${recipientName}, replyToId: ${replyToId}`
                )
            );
            await next();
        });
    }
}

// Create the main dialog.
const messageBot = new MessageBot();

export default messageBot;
