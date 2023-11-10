import { ActivityHandler, MessageFactory } from 'botbuilder';
import pluginHandler from '~/core/handler.js';
import keyv from '~/connector/keyv.js';

class MessageBot extends ActivityHandler {
    constructor() {
        super();

        this.onEndOfConversation(async (context, next) => {
            keyv.delete(context.activity.conversation.id);
            await next();
        });

        this.onMessage(async (context, next) => {
            await pluginHandler.handleMessage(context);
            await next();
        });

        this.onMessageReaction(async (context, next) => {
            const { activity } = context;
            const { from, recipient, replyToId } = activity;
            const { name: fromName } = from;
            const { name: recipientName } = recipient;
            await context.sendActivity(MessageFactory.text(`, from: ${fromName}, recipient: ${recipientName}, replyToId: ${replyToId}`));
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded || [];
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

// Create the main dialog.
const messageBot = new MessageBot();

export default messageBot;
