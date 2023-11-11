import dotenv from 'dotenv';
dotenv.config();
import { loadCommands } from './core/loader.js';
import { TurnContext } from 'botbuilder';
import { INodeSocket } from 'botframework-streaming';
import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware2';
import  { adapter, AdapterSingleton } from './connector/adapter.js';
import messageBot from './bots/messageBot.js';
import routers from "~/routes";

const cors = corsMiddleware({
    origins: ['*']
});

const server = restify.createServer();
server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser({
    mapParams: true
}));

server.listen(process.env.port || process.env.PORT || 3978, process.env.HOST || '0.0.0.0', async () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('Loading commands...');
    await loadCommands();
    console.log('Commands loaded.');
});

// Catch-all for errors.
const onTurnErrorHandler = async (context : TurnContext, error : Error) => {
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

routers(server);

// Listen for Upgrade requests for Streaming.
server.on('upgrade', async (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = AdapterSingleton.recreateInstance();

    // Set onTurnError for the CloudAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket as unknown as INodeSocket, head, (context) => messageBot.run(context));
});
