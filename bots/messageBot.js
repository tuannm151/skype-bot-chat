import { ActivityHandler, MessageFactory, TurnContext } from 'botbuilder';
import Keyv from 'keyv';
import pluginHandler from '../core/handler.js';

export class MessageBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.

        const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT } = process.env;
        const dbURI = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;
        console.log('dbURI', dbURI);
        this.keyv = new Keyv(dbURI);

        this.keyv.on('error', err => console.error('Keyv connection error:', err));

        this.onConversationUpdate(async (context, next) => {
            this.addConversationReference(context.activity);
            await next();
        });

        this.onEndOfConversation(async (context, next) => {
            this.keyv.delete(context.activity.conversation.id);
            await next();
        });

        this.onMessage(async (context, next) => {
            context.sendMessage = async (text) => {
                await context.sendActivity(MessageFactory.text(text));
            };

            context.register = async () => {
                await this.addConversationReference(context.activity);
            };

            await pluginHandler.handleMessage(context);
            await next();
        });

        this.onMessageReaction(async (context, next) => {
            const { activity } = context;
            const { reactionType, from, recipient, replyToId } = activity;
            const { id: fromId, name: fromName } = from;
            const { id: recipientId, name: recipientName } = recipient;
            const { id: replyToIdId } = replyToId;
            await context.sendActivity(MessageFactory.text(`Reaction: ${reactionType}, from: ${fromName}, recipient: ${recipientName}, replyToId: ${replyToIdId}`));
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
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

    async addConversationReference(activity) {
        const conversationExists = await this.keyv.has(activity.conversation.id);
        if (conversationExists) {
            return;
        }
        const conversationReference = TurnContext.getConversationReference(activity);

        await this.keyv.set(conversationReference.conversation.id, conversationReference);
    }
}
