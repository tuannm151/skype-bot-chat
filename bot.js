// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, MessageFactory } from 'botbuilder';
import pluginHandler from './core/handler.js';

class MessageBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            context.sendMessage = async (text) => {
                return await context.sendActivity(MessageFactory.text(text));
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
}

export default MessageBot;
