import { MessageFactory, TurnContext } from 'botbuilder';
import logger from '~/logger';
import { Lang, LangData, ObjectData, Plugin } from '~/types';

class PluginHandler {
    commands: Map<string, Plugin>;
    botName: string;
    language: string;
    constructor() {
        this.commands = new Map();
        this.botName = process.env.BOT_NAME || 'MT Bot';
        this.language = process.env.LANGUAGE as Lang || Lang.vi_VN;
    }

    async setCommand(command : Plugin) {
        this.commands.set(command.config.name, command);
    }

    async getCommand(commandName : string) {
        return this.commands.get(commandName);
    }

    _getLang(key : string, langData: LangData, objectData?: ObjectData) {
        const lang : string = langData[this.language][key] || langData[Lang.vi_VN][key] || key;

        let newLang = lang;
        if (objectData) {
            Object.keys(objectData).forEach(key => {
                newLang = newLang.replaceAll(`{{${key}}}`, objectData[key]);
            });
        }
        return newLang;
    }

    async handleMessage(context : TurnContext) {
        const { text } = context.activity;

        const textWithoutQuote = text.slice(text.lastIndexOf('>') + 1);

        const textWithoutBotName = textWithoutQuote.replaceAll(this.botName, '');

        const tokens = textWithoutBotName.trim().split(/\s+/);
        logger.info(`Received message tokens: ${tokens}`);

        const command = tokens[0];
        const commandPrefix = process.env.COMMAND_PREFIX || '!';
        if (!command.startsWith(commandPrefix)) {
            return;
        }
        // regex check valid command
        const commandRegex = new RegExp(`^${commandPrefix}[a-zA-Z0-9]+$`);
        if (!commandRegex.test(command)) {
            await context.sendActivity(MessageFactory.text('Invalid command'));
            return;
        }
        const params = tokens.slice(1);

        const commandName = command.slice(1);
        const commandHandler = await this.getCommand(commandName);
        if (!commandHandler) {
            await context.sendActivity(MessageFactory.text('Command not found'));
            return;
        }

        const { langData } = commandHandler;
        const getLangCommand = (key : string, objectData? : ObjectData) => this._getLang(key, langData, objectData);

        try {
            await commandHandler.onCall({ context, params, getLang: getLangCommand });
        } catch (err) {
            logger.error(`Error running onCall for plugin ${command}`, err);
        }
    }
}

const pluginHandler = new PluginHandler();
export default pluginHandler;
