/* eslint-disable import/first */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import dotenv from 'dotenv';
dotenv.config();
import { loadCommands } from './core/loader.js';
import { CloudAdapter, ConfigurationServiceClientCredentialFactory, createBotFrameworkAuthenticationFromConfiguration, MessageFactory } from 'botbuilder';
import restify from 'restify';
<<<<<<< Updated upstream
import { MessageBot } from './bots/index.js';
const { MicrosoftAppId, MicrosoftAppPassword, MicrosoftAppType, MicrosoftAppTenantId } = process.env;
=======
import MessageBot from './bot.js';
>>>>>>> Stashed changes

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, process.env.HOST || '0.0.0.0', async () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('Loading commands...');
    await loadCommands();
    console.log('Commands loaded.');
});

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId,
    MicrosoftAppPassword,
    MicrosoftAppType,
    MicrosoftAppTenantId
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const messageBot = new MessageBot();

// Listen for incoming requests.
server.post('/api/messages', async (req, res) => {
    // Route received a request to adapter for processing
    await adapter.process(req, res, (context) => messageBot.run(context));
});

server.post('/api/send', async (req, res) => {
    const { body } = req;
    const { text, conversationId } = body;
    const conversationReference = await messageBot.keyv.get(conversationId);
    if (!conversationReference) {
        res.send(404);
        return;
    }
    await adapter.continueConversationAsync(MicrosoftAppId, conversationReference, async (context) => {
        await context.sendActivity(MessageFactory.text(text));
    });
    res.send(200);
});

// Listen for Upgrade requests for Streaming.
server.on('upgrade', async (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);

    // Set onTurnError for the CloudAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket, head, (context) => messageBot.run(context));
});
