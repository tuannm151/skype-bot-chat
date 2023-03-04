import { MessageFactory } from 'botbuilder';

class PluginHandler {
    constructor() {
        this.commands = new Map();
        this.botName = process.env.BOT_NAME || 'MT Bot';
        this.language = process.env.LANGUAGE || 'vi_VN';
    }

    async setCommand(command) {
        this.commands.set(command.config.name, command);
    }

    async getCommand(commandName) {
        return this.commands.get(commandName);
    }

    _getLang(key, objectData, langData) {
        if (!key || typeof key !== 'string') {
            return '';
        }

        const lang = langData?.[this.language]?.[key] || langData?.en_US?.[key] || '';

        if (!lang || typeof lang !== 'string') {
            return '';
        }

        let newLang = lang;
        if (objectData && typeof objectData === 'object') {
            Object.keys(objectData).forEach(key => {
                newLang = newLang.replaceAll(`{{${key}}}`, objectData[key]);
            });
        }
        return newLang;
    }

    async handleMessage(context) {
        const { text } = context.activity;

        const textWithoutQuote = text.slice(text.lastIndexOf('>') + 1);


        const textWithoutBotName = textWithoutQuote.replaceAll(this.botName, '');

        const tokens = textWithoutBotName.trim().split(/\s+/);
        console.log('tokens', tokens);

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
        const getLangCommand = (key, objectData) => this._getLang(key, objectData, langData);

        try {
            await commandHandler.onCall({ context, params, getLang: getLangCommand });
        } catch (err) {
            console.error(`Error running onCall for plugin ${command}: ${err}`);
        }
    }
}

const pluginHandler = new PluginHandler();
export default pluginHandler;
